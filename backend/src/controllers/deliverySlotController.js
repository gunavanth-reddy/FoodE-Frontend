const mongoose = require("mongoose");
const DeliverySlot = require("../models/deliverySlotModel");
const Restaurant = require("../models/Restaurant");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isValidTime = (value) =>
  typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

const timeToMinutes = (value) => {
  if (!isValidTime(value)) return null;
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = (minutes) => {
  const safe = Math.max(0, Math.min(1439, Number(minutes)));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
};

const getIndiaParts = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(new Date())
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  let hour = Number(parts.hour || 0);
  if (hour === 24) hour = 0;

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: hour * 60 + Number(parts.minute || 0),
  };
};

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
  const [year, month, day] = String(value).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const compareDates = (a, b) => String(a).localeCompare(String(b));

const normalizeDate = (value, fallback) => {
  const date = String(value || fallback || "").trim();
  return isValidDate(date) ? date : null;
};

const getDuration = (startTime, endTime, supplied) => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (start == null || end == null || end <= start) return null;
  const calculated = end - start;
  if (supplied != null && Number(supplied) !== calculated) return null;
  return calculated;
};

const normalizeDeliveryTime = (deliveryTime, restaurant) => {
  const fallback = restaurant?.deliveryTime || { min: 20, max: 35 };
  const min = Number(deliveryTime?.min ?? fallback.min ?? 20);
  const max = Number(deliveryTime?.max ?? fallback.max ?? 35);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min < 1 || max < min) return null;
  return { min, max };
};

const getLegacyOrSlotDate = (slot, today) => slot.date || today;

const isBookable = (slot, todayDate, currentMinutes) => {
  const slotDate = getLegacyOrSlotDate(slot, todayDate);
  if (compareDates(slotDate, todayDate) < 0) return false;
  if (compareDates(slotDate, todayDate) > 0) return true;

  const start = timeToMinutes(slot.startTime);
  if (start == null) return false;
  const cutoff = Number(slot.cutoffMinutes ?? 10);
  return currentMinutes < start - cutoff;
};

const formatDeliverySlot = (slot, restaurant) => {
  const start = timeToMinutes(slot.startTime);
  const end = timeToMinutes(slot.endTime);
  const duration = Number(slot.durationMinutes) || (start != null && end != null ? end - start : 30);
  const date = slot.date || getIndiaParts().date;
  const deliveryTime = normalizeDeliveryTime(slot.deliveryTime, restaurant) || { min: 20, max: 35 };

  return {
    _id: slot._id,
    restaurant: slot.restaurant,
    date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    durationMinutes: duration,
    isActive: slot.isActive !== false,
    cutoffMinutes: Number(slot.cutoffMinutes ?? 10),
    deliveryTime,
    estimatedDelivery: {
      minMinutes: deliveryTime.min,
      maxMinutes: deliveryTime.max,
    },
    etaLabel: `Delivery in ${deliveryTime.min}–${deliveryTime.max} mins`,
  };
};

const validateSlotPayload = (body, fallbackDate) => {
  const date = normalizeDate(body.date, fallbackDate);
  const startTime = String(body.startTime || "").trim();
  const endTime = String(body.endTime || "").trim();

  if (!date) return { valid: false, message: "Date must be YYYY-MM-DD" };
  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return { valid: false, message: "Time must be in HH:MM format" };
  }

  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const duration = getDuration(startTime, endTime, body.durationMinutes);

  if (start == null || end == null || end <= start) {
    return { valid: false, message: "End time must be later than start time" };
  }
  if (duration == null) {
    return { valid: false, message: "durationMinutes must match startTime and endTime" };
  }
  if (duration < 10) {
    return { valid: false, message: "A delivery slot must be at least 10 minutes" };
  }

  const cutoffMinutes = Number(body.cutoffMinutes ?? 10);
  if (!Number.isFinite(cutoffMinutes) || cutoffMinutes < 0 || cutoffMinutes >= duration) {
    return { valid: false, message: "cutoffMinutes must be 0 or greater and smaller than the slot duration" };
  }

  return { valid: true, date, startTime, endTime, durationMinutes: duration, cutoffMinutes };
};

const hasOverlap = async ({ restaurantId, date, startTime, endTime, excludeSlotId = null }) => {
  const query = { restaurant: restaurantId };
  if (date) query.$or = [{ date }, { date: { $exists: false } }];
  if (excludeSlotId) query._id = { $ne: excludeSlotId };

  const slots = await DeliverySlot.find(query).select("date startTime endTime").lean();
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  return slots.some((slot) => {
    const slotDate = slot.date || date;
    if (slotDate !== date) return false;
    const existingStart = timeToMinutes(slot.startTime);
    const existingEnd = timeToMinutes(slot.endTime);
    if (existingStart == null || existingEnd == null) return false;
    return start < existingEnd && end > existingStart;
  });
};

const findOwnerRestaurant = async (ownerId) =>
  Restaurant.findOne({ owner: ownerId, isActive: true });

const createDeliverySlot = async (req, res) => {
  try {
    const india = getIndiaParts();
    const validation = validateSlotPayload(req.body, india.date);
    if (!validation.valid) return res.status(400).json({ success: false, message: validation.message });

    if (compareDates(validation.date, india.date) < 0) {
      return res.status(400).json({ success: false, message: "Delivery slot date cannot be in the past" });
    }

    const restaurant = await findOwnerRestaurant(req.user._id);
    if (!restaurant) return res.status(404).json({ success: false, message: "Active restaurant not found" });

    if (await hasOverlap({ restaurantId: restaurant._id, ...validation })) {
      return res.status(400).json({ success: false, message: "This slot overlaps with another delivery slot on the same date" });
    }

    const deliverySlot = await DeliverySlot.create({
      restaurant: restaurant._id,
      date: validation.date,
      startTime: validation.startTime,
      endTime: validation.endTime,
      durationMinutes: validation.durationMinutes,
      cutoffMinutes: validation.cutoffMinutes,
      deliveryTime: normalizeDeliveryTime(req.body.deliveryTime, restaurant),
      isActive: req.body.isActive !== false,
    });

    return res.status(201).json({
      success: true,
      message: "Delivery slot created successfully",
      deliverySlot: formatDeliverySlot(deliverySlot, restaurant),
    });
  } catch (error) {
    console.error("Create Delivery Slot Error:", error);
    return res.status(500).json({ success: false, message: "Server error while creating delivery slot" });
  }
};

const getMyDeliverySlots = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found" });

    const deliverySlots = await DeliverySlot.find({ restaurant: restaurant._id }).sort({ date: 1, startTime: 1 });
    const india = getIndiaParts();

    return res.status(200).json({
      success: true,
      restaurantId: restaurant._id,
      currentIndiaDate: india.date,
      currentIndiaMinutes: india.minutes,
      deliverySlots: deliverySlots.map((slot) => formatDeliverySlot(slot, restaurant)),
    });
  } catch (error) {
    console.error("Get My Delivery Slots Error:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching delivery slots" });
  }
};

const getAvailableDeliverySlots = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    if (!isValidObjectId(restaurantId)) return res.status(400).json({ success: false, message: "Invalid restaurant ID" });

    const restaurant = await Restaurant.findOne({ _id: restaurantId, isActive: true });
    if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found" });

    const india = getIndiaParts();
    const requestedDate = req.query.date ? normalizeDate(req.query.date, null) : null;
    if (req.query.date && !requestedDate) {
      return res.status(400).json({ success: false, message: "date must be YYYY-MM-DD" });
    }

    const slots = await DeliverySlot.find({ restaurant: restaurant._id, isActive: true })
      .sort({ date: 1, startTime: 1 })
      .lean();

    const available = slots
      .filter((slot) => {
        const date = getLegacyOrSlotDate(slot, india.date);
        if (requestedDate && date !== requestedDate) return false;
        return isBookable(slot, india.date, india.minutes);
      })
      .map((slot) => formatDeliverySlot(slot, restaurant));

    return res.status(200).json({
      success: true,
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      currentIndiaDate: india.date,
      currentIndiaMinutes: india.minutes,
      requestedDate: requestedDate || null,
      deliverySlots: available,
      slots: available,
    });
  } catch (error) {
    console.error("Get Available Delivery Slots Error:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching available delivery slots" });
  }
};

const updateDeliverySlot = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.slotId)) return res.status(400).json({ success: false, message: "Invalid delivery slot ID" });

    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found" });

    const slot = await DeliverySlot.findOne({ _id: req.params.slotId, restaurant: restaurant._id });
    if (!slot) return res.status(404).json({ success: false, message: "Delivery slot not found" });

    const india = getIndiaParts();
    const validation = validateSlotPayload(
      { ...slot.toObject(), ...req.body },
      slot.date || india.date
    );
    if (!validation.valid) return res.status(400).json({ success: false, message: validation.message });

    if (compareDates(validation.date, india.date) < 0) {
      return res.status(400).json({ success: false, message: "Delivery slot date cannot be in the past" });
    }

    if (await hasOverlap({ restaurantId: restaurant._id, ...validation, excludeSlotId: slot._id })) {
      return res.status(400).json({ success: false, message: "This slot overlaps with another delivery slot on the same date" });
    }

    slot.date = validation.date;
    slot.startTime = validation.startTime;
    slot.endTime = validation.endTime;
    slot.durationMinutes = validation.durationMinutes;
    slot.cutoffMinutes = validation.cutoffMinutes;
    slot.isActive = req.body.isActive === undefined ? slot.isActive : req.body.isActive === true;

    if (req.body.deliveryTime !== undefined) {
      const deliveryTime = normalizeDeliveryTime(req.body.deliveryTime, restaurant);
      if (!deliveryTime) return res.status(400).json({ success: false, message: "Invalid deliveryTime" });
      slot.deliveryTime = deliveryTime;
    }

    await slot.save();
    return res.status(200).json({ success: true, message: "Delivery slot updated successfully", deliverySlot: formatDeliverySlot(slot, restaurant) });
  } catch (error) {
    console.error("Update Delivery Slot Error:", error);
    return res.status(500).json({ success: false, message: "Server error while updating delivery slot" });
  }
};

const toggleDeliverySlot = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.slotId)) return res.status(400).json({ success: false, message: "Invalid delivery slot ID" });
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found" });
    const slot = await DeliverySlot.findOne({ _id: req.params.slotId, restaurant: restaurant._id });
    if (!slot) return res.status(404).json({ success: false, message: "Delivery slot not found" });
    slot.isActive = !slot.isActive;
    await slot.save();
    return res.status(200).json({ success: true, message: slot.isActive ? "Delivery slot enabled" : "Delivery slot disabled", deliverySlot: formatDeliverySlot(slot, restaurant) });
  } catch (error) {
    console.error("Toggle Delivery Slot Error:", error);
    return res.status(500).json({ success: false, message: "Server error while toggling delivery slot" });
  }
};

const deleteDeliverySlot = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.slotId)) return res.status(400).json({ success: false, message: "Invalid delivery slot ID" });
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found" });
    const result = await DeliverySlot.deleteOne({ _id: req.params.slotId, restaurant: restaurant._id });
    if (!result.deletedCount) return res.status(404).json({ success: false, message: "Delivery slot not found" });
    return res.status(200).json({ success: true, message: "Delivery slot deleted successfully" });
  } catch (error) {
    console.error("Delete Delivery Slot Error:", error);
    return res.status(500).json({ success: false, message: "Server error while deleting delivery slot" });
  }
};

module.exports = {
  createDeliverySlot,
  getMyDeliverySlots,
  getAvailableDeliverySlots,
  updateDeliverySlot,
  toggleDeliverySlot,
  deleteDeliverySlot,
};
