
const mongoose = require("mongoose");
const DeliverySlot = require("../models/deliverySlotModel");
const Restaurant = require("../models/Restaurant");

// =====================================================
// HELPERS
// =====================================================

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const isValidTimeFormat = (time) =>
  typeof time === "string" &&
  /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);

const timeToMinutes = (time) => {
  if (!isValidTimeFormat(time)) return null;

  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const isValidDate = (date) => {
  if (
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    return false;
  }

  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
};

// Get current date and time in India.
const getIndiaNow = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const get = (type) =>
    Number(parts.find((part) => part.type === type)?.value);

  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = get("hour");
  const minute = get("minute");

  return {
    date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    minutes: hour * 60 + minute,
    timestamp: Date.UTC(year, month - 1, day, hour, minute),
  };
};

const getTodayIndia = () => getIndiaNow().date;

const calculateDuration = (startTime, endTime) => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  if (start === null || end === null || end <= start) {
    return null;
  }

  return end - start;
};

const validateSlotTimes = (startTime, endTime) => {
  if (
    !isValidTimeFormat(startTime) ||
    !isValidTimeFormat(endTime)
  ) {
    return {
      valid: false,
      message: "Time must be in HH:MM format.",
    };
  }

  const durationMinutes = calculateDuration(startTime, endTime);

  if (durationMinutes === null) {
    return {
      valid: false,
      message: "End time must be after start time on the same day.",
    };
  }

  if (durationMinutes < 10) {
    return {
      valid: false,
      message: "A delivery slot must be at least 10 minutes long.",
    };
  }

  return {
    valid: true,
    durationMinutes,
  };
};

const validateCutoff = (cutoffMinutes, durationMinutes) => {
  const cutoff = Number(cutoffMinutes);

  if (
    !Number.isInteger(cutoff) ||
    cutoff < 0 ||
    cutoff >= durationMinutes
  ) {
    return {
      valid: false,
      message: "Cutoff must be a non-negative whole number smaller than the slot duration.",
    };
  }

  return { valid: true, value: cutoff };
};

const normalizeDeliveryTime = (deliveryTime) => {
  if (deliveryTime === undefined || deliveryTime === null) {
    return { min: 20, max: 35 };
  }

  const min = Number(deliveryTime.min);
  const max = Number(deliveryTime.max);

  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    min < 1 ||
    max < 1 ||
    min > max
  ) {
    return null;
  }

  return { min, max };
};

// =====================================================
// SLOT DATE/TIME HELPERS
// =====================================================

// Legacy slots without a date are treated as today's slots.
const getSlotDate = (slot) =>
  slot.date || getTodayIndia();

const getSlotCutoffTimestamp = (slot) => {
  const date = getSlotDate(slot);
  const startMinutes = timeToMinutes(slot.startTime);

  if (!isValidDate(date) || startMinutes === null) {
    return null;
  }

  const [year, month, day] = date.split("-").map(Number);

  const startTimestamp = Date.UTC(
    year,
    month - 1,
    day,
    Math.floor(startMinutes / 60),
    startMinutes % 60
  );

  return startTimestamp - (Number(slot.cutoffMinutes ?? 10) * 60000);
};

const isSlotClosedForBooking = (slot) => {
  if (!slot || !isValidTimeFormat(slot.startTime)) {
    return true;
  }

  const date = getSlotDate(slot);

  if (!isValidDate(date)) return true;

  const now = getIndiaNow();

  // Past dates are never bookable.
  if (date < now.date) return true;

  const cutoffTimestamp = getSlotCutoffTimestamp(slot);

  if (cutoffTimestamp === null) return true;

  return now.timestamp >= cutoffTimestamp;
};

// =====================================================
// OVERLAP CHECK
// =====================================================

const hasOverlap = async ({
  restaurantId,
  date,
  startTime,
  endTime,
  excludeSlotId = null,
}) => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  const query = {
    restaurant: restaurantId,
    isActive: true,
  };

  if (excludeSlotId) {
    query._id = { $ne: excludeSlotId };
  }

  const existingSlots = await DeliverySlot.find(query).select(
    "_id date startTime endTime isActive"
  );

  return existingSlots.some((slot) => {
    // Only compare slots on the same date.
    if (getSlotDate(slot) !== date) return false;

    const existingStart = timeToMinutes(slot.startTime);
    const existingEnd = timeToMinutes(slot.endTime);

    if (existingStart === null || existingEnd === null) {
      return false;
    }

    return start < existingEnd && end > existingStart;
  });
};

// =====================================================
// RESPONSE FORMATTER
// =====================================================

const formatDeliverySlot = (slot) => {
  const deliveryMin = Number(slot.deliveryTime?.min ?? 20);
  const deliveryMax = Number(slot.deliveryTime?.max ?? 35);

  const durationMinutes =
    slot.durationMinutes ??
    calculateDuration(slot.startTime, slot.endTime);

  return {
    _id: slot._id,
    restaurant: slot.restaurant,
    date: getSlotDate(slot),
    startTime: slot.startTime,
    endTime: slot.endTime,
    durationMinutes,
    isActive: slot.isActive,
    cutoffMinutes: Number(slot.cutoffMinutes ?? 10),
    deliveryTime: {
      min: deliveryMin,
      max: deliveryMax,
    },
    estimatedDelivery: {
      minMinutes: deliveryMin,
      maxMinutes: deliveryMax,
    },
    etaLabel: `Delivery in ${deliveryMin}–${deliveryMax} mins`,
  };
};

// =====================================================
// CREATE DELIVERY SLOT
// =====================================================

const createDeliverySlot = async (req, res) => {
  try {
    const {
      date,
      startTime,
      endTime,
      cutoffMinutes = 10,
      deliveryTime,
    } = req.body;

    if (!isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid date in YYYY-MM-DD format.",
      });
    }

    if (date < getTodayIndia()) {
      return res.status(400).json({
        success: false,
        message: "You cannot create a delivery slot for a past date.",
      });
    }

    const timeValidation = validateSlotTimes(startTime, endTime);

    if (!timeValidation.valid) {
      return res.status(400).json({
        success: false,
        message: timeValidation.message,
      });
    }

    const cutoffValidation = validateCutoff(
      cutoffMinutes,
      timeValidation.durationMinutes
    );

    if (!cutoffValidation.valid) {
      return res.status(400).json({
        success: false,
        message: cutoffValidation.message,
      });
    }

    const normalizedDeliveryTime =
      normalizeDeliveryTime(deliveryTime);

    if (!normalizedDeliveryTime) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery time. Minimum must be less than or equal to maximum.",
      });
    }

    const restaurant = await Restaurant.findOne({
      owner: req.user._id,
      isActive: true,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Active restaurant not found.",
      });
    }

    const duplicateSlot = await DeliverySlot.findOne({
      restaurant: restaurant._id,
      date,
      startTime,
      endTime,
    });

    if (duplicateSlot) {
      return res.status(400).json({
        success: false,
        message: "This delivery slot already exists for that date.",
      });
    }

    const overlappingSlot = await hasOverlap({
      restaurantId: restaurant._id,
      date,
      startTime,
      endTime,
    });

    if (overlappingSlot) {
      return res.status(400).json({
        success: false,
        message: "This slot overlaps with another active delivery slot on that date.",
      });
    }

    const deliverySlot = await DeliverySlot.create({
      restaurant: restaurant._id,
      date,
      startTime,
      endTime,
      durationMinutes: timeValidation.durationMinutes,
      cutoffMinutes: cutoffValidation.value,
      deliveryTime: normalizedDeliveryTime,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Delivery slot created successfully.",
      deliverySlot: formatDeliverySlot(deliverySlot),
    });
  } catch (error) {
    console.error("Create Delivery Slot Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This delivery slot already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating delivery slot.",
    });
  }
};

// =====================================================
// GET OWNER DELIVERY SLOTS
// =====================================================

const getMyDeliverySlots = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      owner: req.user._id,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
    }

    const deliverySlots = await DeliverySlot.find({
      restaurant: restaurant._id,
    });

    deliverySlots.sort((a, b) => {
      const dateCompare = getSlotDate(a).localeCompare(getSlotDate(b));

      if (dateCompare !== 0) return dateCompare;

      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    });

    return res.status(200).json({
      success: true,
      restaurantId: restaurant._id,
      deliverySlots: deliverySlots.map(formatDeliverySlot),
    });
  } catch (error) {
    console.error("Get My Delivery Slots Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching delivery slots.",
    });
  }
};

// =====================================================
// GET AVAILABLE SLOTS FOR CUSTOMER
// =====================================================

const getAvailableDeliverySlots = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { date } = req.query;

    if (!isValidObjectId(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID.",
      });
    }

    if (date !== undefined && !isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid date in YYYY-MM-DD format.",
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      isActive: true,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found or inactive.",
      });
    }

    const slots = await DeliverySlot.find({
      restaurant: restaurant._id,
      isActive: true,
    });

    const now = getIndiaNow();

    const futureSlots = slots.filter((slot) => {
      const slotDate = getSlotDate(slot);

      if (date && slotDate !== date) return false;

      if (slotDate < now.date) return false;

      return !isSlotClosedForBooking(slot);
    });

    futureSlots.sort((a, b) => {
      const dateCompare = getSlotDate(a).localeCompare(getSlotDate(b));

      if (dateCompare !== 0) return dateCompare;

      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    });

    return res.status(200).json({
      success: true,
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      currentIndiaMinutes: now.minutes,
      currentIndiaDate: now.date,
      deliverySlots: futureSlots.map(formatDeliverySlot),
    });
  } catch (error) {
    console.error("Get Available Delivery Slots Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching available delivery slots.",
    });
  }
};

// =====================================================
// UPDATE DELIVERY SLOT
// =====================================================

const updateDeliverySlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    const {
      date,
      startTime,
      endTime,
      cutoffMinutes,
      deliveryTime,
      isActive,
    } = req.body;

    if (!isValidObjectId(slotId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery slot ID.",
      });
    }

    const restaurant = await Restaurant.findOne({
      owner: req.user._id,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
    }

    if (!restaurant.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your restaurant is currently inactive.",
      });
    }

    const deliverySlot = await DeliverySlot.findOne({
      _id: slotId,
      restaurant: restaurant._id,
    });

    if (!deliverySlot) {
      return res.status(404).json({
        success: false,
        message: "Delivery slot not found.",
      });
    }

    const newDate =
      date !== undefined ? date : getSlotDate(deliverySlot);

    const newStartTime =
      startTime !== undefined ? startTime : deliverySlot.startTime;

    const newEndTime =
      endTime !== undefined ? endTime : deliverySlot.endTime;

    const newCutoff =
      cutoffMinutes !== undefined
        ? cutoffMinutes
        : Number(deliverySlot.cutoffMinutes ?? 10);

    if (!isValidDate(newDate)) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid date in YYYY-MM-DD format.",
      });
    }

    if (newDate < getTodayIndia()) {
      return res.status(400).json({
        success: false,
        message: "You cannot set a delivery slot to a past date.",
      });
    }

    const timeValidation = validateSlotTimes(
      newStartTime,
      newEndTime
    );

    if (!timeValidation.valid) {
      return res.status(400).json({
        success: false,
        message: timeValidation.message,
      });
    }

    const cutoffValidation = validateCutoff(
      newCutoff,
      timeValidation.durationMinutes
    );

    if (!cutoffValidation.valid) {
      return res.status(400).json({
        success: false,
        message: cutoffValidation.message,
      });
    }

    if (deliveryTime !== undefined) {
      const normalizedDeliveryTime =
        normalizeDeliveryTime(deliveryTime);

      if (!normalizedDeliveryTime) {
        return res.status(400).json({
          success: false,
          message: "Invalid delivery time. Minimum must be less than or equal to maximum.",
        });
      }

      deliverySlot.deliveryTime = normalizedDeliveryTime;
    }

    if (
      isActive !== undefined &&
      typeof isActive !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false.",
      });
    }

    const overlappingSlot = await hasOverlap({
      restaurantId: restaurant._id,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      excludeSlotId: deliverySlot._id,
    });

    if (overlappingSlot) {
      return res.status(400).json({
        success: false,
        message: "This slot overlaps with another active delivery slot on that date.",
      });
    }

    deliverySlot.date = newDate;
    deliverySlot.startTime = newStartTime;
    deliverySlot.endTime = newEndTime;
    deliverySlot.durationMinutes = timeValidation.durationMinutes;
    deliverySlot.cutoffMinutes = cutoffValidation.value;

    if (isActive !== undefined) {
      deliverySlot.isActive = isActive;
    }

    await deliverySlot.save();

    return res.status(200).json({
      success: true,
      message: "Delivery slot updated successfully.",
      deliverySlot: formatDeliverySlot(deliverySlot),
    });
  } catch (error) {
    console.error("Update Delivery Slot Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This delivery slot already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while updating delivery slot.",
    });
  }
};

// =====================================================
// TOGGLE DELIVERY SLOT
// =====================================================

const toggleDeliverySlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    if (!isValidObjectId(slotId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery slot ID.",
      });
    }

    const restaurant = await Restaurant.findOne({
      owner: req.user._id,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
    }

    if (!restaurant.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your restaurant is currently inactive.",
      });
    }

    const deliverySlot = await DeliverySlot.findOne({
      _id: slotId,
      restaurant: restaurant._id,
    });

    if (!deliverySlot) {
      return res.status(404).json({
        success: false,
        message: "Delivery slot not found.",
      });
    }

    deliverySlot.isActive = !deliverySlot.isActive;

    // Preserve the configured cutoff.
    await deliverySlot.save();

    return res.status(200).json({
      success: true,
      message: deliverySlot.isActive
        ? "Delivery slot enabled."
        : "Delivery slot disabled.",
      deliverySlot: formatDeliverySlot(deliverySlot),
    });
  } catch (error) {
    console.error("Toggle Delivery Slot Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while toggling delivery slot.",
    });
  }
};

// =====================================================
// DELETE DELIVERY SLOT
// =====================================================

const deleteDeliverySlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    if (!isValidObjectId(slotId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery slot ID.",
      });
    }

    const restaurant = await Restaurant.findOne({
      owner: req.user._id,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
    }

    if (!restaurant.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your restaurant is currently inactive.",
      });
    }

    const deliverySlot = await DeliverySlot.findOne({
      _id: slotId,
      restaurant: restaurant._id,
    });

    if (!deliverySlot) {
      return res.status(404).json({
        success: false,
        message: "Delivery slot not found.",
      });
    }

    await DeliverySlot.deleteOne({
      _id: deliverySlot._id,
      restaurant: restaurant._id,
    });

    return res.status(200).json({
      success: true,
      message: "Delivery slot deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Delivery Slot Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting delivery slot.",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createDeliverySlot,
  getMyDeliverySlots,
  getAvailableDeliverySlots,
  updateDeliverySlot,
  toggleDeliverySlot,
  deleteDeliverySlot,
};
