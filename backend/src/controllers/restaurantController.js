// =====================================================
// RESTAURANT CONTROLLER
// =====================================================

const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");
const { uploadToCloudinary } = require("../utils/cloudinaryUpload");

// =====================================================
// DELIVERY SETTINGS HELPERS
// =====================================================

const parseJsonField = (value, fallback = null) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

// =====================================================
// VALIDATE DELIVERY RANGE
// =====================================================

const validateDeliveryRange = (range) => {
  const min = Number(range?.min);
  const max = Number(range?.max);

  if (
    range?.min === undefined ||
    range?.max === undefined ||
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    min < 1 ||
    max < min
  ) {
    throw new Error(
      "Provide valid delivery min/max values; min must be less than or equal to max."
    );
  }

  return {
    min,
    max,
  };
};

// =====================================================
// NORMALIZE DELIVERY SLOTS
// =====================================================

const normalizeDeliverySlots = (input) => {
  const slots = parseJsonField(input, []);

  if (!Array.isArray(slots)) {
    throw new Error(
      "deliverySlots must be an array."
    );
  }

  return slots.map((slot, index) => {
    const name = String(
      slot?.name || ""
    ).trim();

    const startTime = String(
      slot?.startTime || ""
    ).trim();

    const endTime = String(
      slot?.endTime || ""
    ).trim();

    const validTime = (time) =>
      /^([01]\d|2[0-3]):[0-5]\d$/.test(
        time
      );

    if (
      !name ||
      !validTime(startTime) ||
      !validTime(endTime) ||
      startTime >= endTime
    ) {
      throw new Error(
        `Slot ${
          index + 1
        } requires a name and valid HH:mm times; endTime must be later.`
      );
    }

    const cutoffMinutes = Number(
      slot.cutoffMinutes ?? 30
    );

    if (
      !Number.isFinite(cutoffMinutes) ||
      cutoffMinutes < 0
    ) {
      throw new Error(
        `Slot ${
          index + 1
        } has an invalid cutoffMinutes value.`
      );
    }

    return {
      name,
      startTime,
      endTime,

      deliveryTime:
        validateDeliveryRange(
          slot.deliveryTime
        ),

      isActive:
        slot.isActive !== undefined
          ? slot.isActive === true ||
            slot.isActive === "true"
          : true,

      cutoffMinutes,
    };
  });
};

// =====================================================
// NORMALIZE DELIVERY SETTINGS
// =====================================================

const normalizeDeliverySettings = (
  body,
  existing = {}
) => {
  const deliveryMode =
    body.deliveryMode ??
    existing.deliveryMode ??
    "standard";

  if (
    ![
      "standard",
      "time_slots",
    ].includes(deliveryMode)
  ) {
    throw new Error(
      "deliveryMode must be 'standard' or 'time_slots'."
    );
  }

  let deliveryTime =
    existing.deliveryTime || {
      min: 20,
      max: 35,
    };

  const suppliedRange =
    parseJsonField(
      body.deliveryTime,
      null
    );

  if (suppliedRange !== null) {
    deliveryTime =
      validateDeliveryRange(
        suppliedRange
      );
  }

  if (
    body.deliveryTimeMin !==
      undefined ||
    body.deliveryTimeMax !==
      undefined
  ) {
    deliveryTime =
      validateDeliveryRange({
        min:
          body.deliveryTimeMin ??
          deliveryTime.min,

        max:
          body.deliveryTimeMax ??
          deliveryTime.max,
      });
  }

  const deliverySlots =
    body.deliverySlots !==
    undefined
      ? normalizeDeliverySlots(
          body.deliverySlots
        )
      : existing.deliverySlots ||
        [];

  if (
    deliveryMode ===
      "time_slots" &&
    !deliverySlots.some(
      (slot) => slot.isActive
    )
  ) {
    throw new Error(
      "Enable at least one delivery slot for time-slot mode."
    );
  }

  return {
    deliveryMode,
    deliveryTime,
    deliverySlots,
  };
};

// =====================================================
// PARSE CUISINES
// =====================================================

const parseCuisines = (
  cuisines
) => {
  if (!cuisines) {
    return [];
  }

  if (Array.isArray(cuisines)) {
    return cuisines;
  }

  if (
    typeof cuisines ===
    "string"
  ) {
    try {
      const parsed =
        JSON.parse(cuisines);

      if (
        Array.isArray(parsed)
      ) {
        return parsed;
      }
    } catch (error) {
      return cuisines
        .split(",")
        .map((item) =>
          item.trim()
        )
        .filter(Boolean);
    }
  }

  return [];
};

// =====================================================
// CREATE RESTAURANT
// =====================================================

const createRestaurant =
  async (req, res) => {
    try {
      const {
        name,
        description,
        phone,
        email,
        address,
        city,
        deliveryTime,
        deliveryTimeMin,
        deliveryTimeMax,
        deliveryMode,
        deliverySlots,
        deliveryFee,
        minimumOrder,
        cuisines,
        openingTime,
        closingTime,
      } = req.body;

      // =================================================
      // REQUIRED FIELDS
      // =================================================

      if (
        !name ||
        !name.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Restaurant name is required",
        });
      }

      if (
        !phone ||
        !phone.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Restaurant phone is required",
        });
      }

      if (
        !address ||
        !address.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Restaurant address is required",
        });
      }

      if (
        !city ||
        !city.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Restaurant city is required",
        });
      }

      // =================================================
      // CHECK EXISTING RESTAURANT
      // =================================================

      const existingRestaurant =
        await Restaurant.findOne({
          owner: req.user._id,
        });

      if (existingRestaurant) {
        return res.status(400).json({
          success: false,
          message:
            "You already have a restaurant registered",
        });
      }

      // =================================================
      // CLOUDINARY UPLOADS
      // =================================================

      let logoUrl = "";
      let coverImageUrl = "";

      if (req.files?.logo?.[0]) {
        const logoUpload =
          await uploadToCloudinary(
            req.files.logo[0].buffer,
            "foode/restaurants/logos"
          );

        logoUrl =
          logoUpload.url;
      }

      if (
        req.files?.coverImage?.[0]
      ) {
        const coverUpload =
          await uploadToCloudinary(
            req.files.coverImage[0].buffer,
            "foode/restaurants/covers"
          );

        coverImageUrl =
          coverUpload.url;
      }

      // =================================================
      // DELIVERY SETTINGS
      // =================================================

      const deliverySettings =
        normalizeDeliverySettings({
          deliveryMode,
          deliveryTime,
          deliveryTimeMin,
          deliveryTimeMax,
          deliverySlots,
        });

      // =================================================
      // CREATE RESTAURANT
      // =================================================

      const restaurant =
        await Restaurant.create({
          owner: req.user._id,

          name: name.trim(),

          description: description
            ? description.trim()
            : "",

          logo: logoUrl,

          coverImage:
            coverImageUrl,

          phone: phone.trim(),

          email: email
            ? email
                .trim()
                .toLowerCase()
            : undefined,

          address:
            address.trim(),

          city: city.trim(),

          ...deliverySettings,

          deliveryFee:
            deliveryFee !==
            undefined
              ? Number(
                  deliveryFee
                )
              : 0,

          minimumOrder:
            minimumOrder !==
            undefined
              ? Number(
                  minimumOrder
                )
              : 0,

          cuisines:
            parseCuisines(
              cuisines
            ),

          openingTime:
            openingTime || "",

          closingTime:
            closingTime || "",

          isActive: true,

          isOpen: false,
        });

      return res.status(201).json({
        success: true,
        message:
          "Restaurant created successfully",
        restaurant,
      });
    } catch (error) {
      console.error(
        "Create Restaurant Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Server error while creating restaurant",
      });
    }
  };

// =====================================================
// GET MY RESTAURANT
// =====================================================

const getMyRestaurant =
  async (req, res) => {
    try {
      const restaurant =
        await Restaurant.findOne({
          owner: req.user._id,
        });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message:
            "Restaurant not found",
        });
      }

      return res.status(200).json({
        success: true,
        restaurant,
      });
    } catch (error) {
      console.error(
        "Get My Restaurant Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while fetching restaurant",
      });
    }
  };

// =====================================================
// UPDATE MY RESTAURANT
// =====================================================

const updateMyRestaurant =
  async (req, res) => {
    try {
      const restaurant =
        await Restaurant.findOne({
          owner: req.user._id,
        });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message:
            "Restaurant not found",
        });
      }

      const {
        name,
        description,
        phone,
        email,
        address,
        city,
        deliveryTime,
        deliveryTimeMin,
        deliveryTimeMax,
        deliveryMode,
        deliverySlots,
        deliveryFee,
        minimumOrder,
        cuisines,
        openingTime,
        closingTime,
      } = req.body;

      // =================================================
      // BASIC FIELDS
      // =================================================

      if (
        name !== undefined
      ) {
        if (
          !String(name).trim()
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Restaurant name cannot be empty",
          });
        }

        restaurant.name =
          name.trim();
      }

      if (
        description !==
        undefined
      ) {
        restaurant.description =
          String(
            description
          ).trim();
      }

      if (
        phone !== undefined
      ) {
        restaurant.phone =
          String(phone).trim();
      }

      if (
        email !== undefined
      ) {
        restaurant.email =
          email
            ? String(email)
                .trim()
                .toLowerCase()
            : "";
      }

      if (
        address !== undefined
      ) {
        restaurant.address =
          String(
            address
          ).trim();
      }

      if (
        city !== undefined
      ) {
        restaurant.city =
          String(city).trim();
      }

      // =================================================
      // DELIVERY SETTINGS
      // =================================================

      if (
        deliveryTime !==
          undefined ||
        deliveryTimeMin !==
          undefined ||
        deliveryTimeMax !==
          undefined ||
        deliveryMode !==
          undefined ||
        deliverySlots !==
          undefined
      ) {
        const deliverySettings =
          normalizeDeliverySettings(
            {
              deliveryTime,
              deliveryTimeMin,
              deliveryTimeMax,
              deliveryMode,
              deliverySlots,
            },
            restaurant
          );

        restaurant.deliveryMode =
          deliverySettings.deliveryMode;

        restaurant.deliveryTime =
          deliverySettings.deliveryTime;

        restaurant.deliverySlots =
          deliverySettings.deliverySlots;
      }

      // =================================================
      // FEES
      // =================================================

      if (
        deliveryFee !==
        undefined
      ) {
        const fee = Number(
          deliveryFee
        );

        if (
          !Number.isFinite(
            fee
          ) ||
          fee < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid delivery fee",
          });
        }

        restaurant.deliveryFee =
          fee;
      }

      if (
        minimumOrder !==
        undefined
      ) {
        const minimum = Number(
          minimumOrder
        );

        if (
          !Number.isFinite(
            minimum
          ) ||
          minimum < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid minimum order amount",
          });
        }

        restaurant.minimumOrder =
          minimum;
      }

      // =================================================
      // CUISINES
      // =================================================

      if (
        cuisines !== undefined
      ) {
        restaurant.cuisines =
          parseCuisines(
            cuisines
          );
      }

      // =================================================
      // OPENING / CLOSING TIME
      // =================================================

      if (
        openingTime !==
        undefined
      ) {
        restaurant.openingTime =
          openingTime;
      }

      if (
        closingTime !==
        undefined
      ) {
        restaurant.closingTime =
          closingTime;
      }

      // =================================================
      // LOGO
      // =================================================

      if (req.files?.logo?.[0]) {
        const logoUpload =
          await uploadToCloudinary(
            req.files.logo[0].buffer,
            "foode/restaurants/logos"
          );

        restaurant.logo =
          logoUpload.url;
      }

      // =================================================
      // COVER IMAGE
      // =================================================

      if (
        req.files?.coverImage?.[0]
      ) {
        const coverUpload =
          await uploadToCloudinary(
            req.files.coverImage[0].buffer,
            "foode/restaurants/covers"
          );

        restaurant.coverImage =
          coverUpload.url;
      }

      // =================================================
      // SAVE
      // =================================================

      await restaurant.save();

      return res.status(200).json({
        success: true,
        message:
          "Restaurant updated successfully",
        restaurant,
      });
    } catch (error) {
      console.error(
        "Update Restaurant Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Server error while updating restaurant",
      });
    }
  };

// =====================================================
// UPDATE RESTAURANT DELIVERY SETTINGS
// =====================================================

const updateRestaurantDeliveryTime =
  async (req, res) => {
    try {
      const restaurant =
        await Restaurant.findOne({
          owner: req.user._id,
        });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message:
            "Restaurant not found",
        });
      }

      const deliverySettings =
        normalizeDeliverySettings(
          req.body,
          restaurant
        );

      restaurant.deliveryMode =
        deliverySettings.deliveryMode;

      restaurant.deliveryTime =
        deliverySettings.deliveryTime;

      restaurant.deliverySlots =
        deliverySettings.deliverySlots;

      await restaurant.save();

      return res.status(200).json({
        success: true,
        message:
          "Delivery settings updated successfully",

        deliveryMode:
          restaurant.deliveryMode,

        deliveryTime:
          restaurant.deliveryTime,

        deliverySlots:
          restaurant.deliverySlots,

        restaurant,
      });
    } catch (error) {
      console.error(
        "Update Restaurant Delivery Settings Error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error?.message ||
          "Unable to update delivery settings",
      });
    }
  };

// =====================================================
// UPDATE RESTAURANT OPEN/CLOSED STATUS
// =====================================================

const updateRestaurantStatus =
  async (req, res) => {
    try {
      const { isOpen } =
        req.body;

      if (
        typeof isOpen !==
        "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "isOpen must be true or false",
        });
      }

      const restaurant =
        await Restaurant.findOne({
          owner: req.user._id,
        });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message:
            "Restaurant not found",
        });
      }

      restaurant.isOpen =
        isOpen;

      await restaurant.save();

      return res.status(200).json({
        success: true,

        message: isOpen
          ? "Restaurant is now open"
          : "Restaurant is now closed",

        restaurant,
      });
    } catch (error) {
      console.error(
        "Update Restaurant Status Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while updating restaurant status",
      });
    }
  };

// =====================================================
// DELETE MY RESTAURANT
// =====================================================

const deleteMyRestaurant =
  async (req, res) => {
    try {
      const restaurant =
        await Restaurant.findOne({
          owner: req.user._id,
        });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message:
            "Restaurant not found",
        });
      }

      await Restaurant.deleteOne({
        _id: restaurant._id,
      });

      return res.status(200).json({
        success: true,
        message:
          "Restaurant deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete Restaurant Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while deleting restaurant",
      });
    }
  };

// =====================================================
// GET PUBLIC RESTAURANT BY ID
// =====================================================

const getRestaurantById =
  async (req, res) => {
    try {
      const restaurant =
        await Restaurant.findOne({
          _id: req.params.id,
          isActive: true,
        });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message:
            "Restaurant not found",
        });
      }

      return res.status(200).json({
        success: true,
        restaurant,
      });
    } catch (error) {
      console.error(
        "Get Restaurant Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while fetching restaurant",
      });
    }
  };

// =====================================================
// GET ALL PUBLIC RESTAURANTS
// =====================================================

const getAllRestaurants =
  async (req, res) => {
    try {
      const restaurants =
        await Restaurant.find({
          isActive: true,
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,
        count:
          restaurants.length,
        restaurants,
      });
    } catch (error) {
      console.error(
        "Get Restaurants Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while fetching restaurants",
      });
    }
  };

// =====================================================
// RESTAURANT OWNER DASHBOARD STATS
// =====================================================

const getOwnerDashboardStats =
  async (req, res) => {
    try {
      const restaurant =
        await Restaurant.findOne({
          owner: req.user._id,
        });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message:
            "Restaurant not found",
        });
      }

      const orders =
        await Order.find({
          restaurant:
            restaurant._id,
        });

      // =================================================
      // TODAY
      // =================================================

      const startOfDay =
        new Date();

      startOfDay.setHours(
        0,
        0,
        0,
        0
      );

      const endOfDay =
        new Date();

      endOfDay.setHours(
        23,
        59,
        59,
        999
      );

      const todayOrders =
        orders.filter(
          (order) => {
            const createdAt =
              new Date(
                order.createdAt
              );

            return (
              createdAt >=
                startOfDay &&
              createdAt <=
                endOfDay
            );
          }
        );

      // =================================================
      // REVENUE
      // =================================================

      const todayRevenue =
        todayOrders
          .filter(
            (order) =>
              order.status !==
              "CANCELLED"
          )
          .reduce(
            (
              total,
              order
            ) =>
              total +
              Number(
                order.total || 0
              ),
            0
          );

      const totalRevenue =
        orders
          .filter(
            (order) =>
              order.status !==
              "CANCELLED"
          )
          .reduce(
            (
              total,
              order
            ) =>
              total +
              Number(
                order.total || 0
              ),
            0
          );

      // =================================================
      // ORDER COUNTS
      // =================================================

      const pendingOrders =
        orders.filter(
          (order) =>
            [
              "PLACED",
              "CONFIRMED",
            ].includes(
              order.status
            )
        ).length;

      const activeOrders =
        orders.filter(
          (order) =>
            [
              "PREPARING",
              "READY",
              "OUT_FOR_DELIVERY",
            ].includes(
              order.status
            )
        ).length;

      const completedOrders =
        orders.filter(
          (order) =>
            order.status ===
            "DELIVERED"
        ).length;

      const cancelledOrders =
        orders.filter(
          (order) =>
            order.status ===
            "CANCELLED"
        ).length;

      // =================================================
      // RESPONSE
      // =================================================

      return res.status(200).json({
        success: true,

        stats: {
          restaurant: {
            id:
              restaurant._id,

            name:
              restaurant.name,

            logo:
              restaurant.logo,

            isOpen:
              restaurant.isOpen,

            rating:
              restaurant.rating,

            totalReviews:
              restaurant.totalReviews,
          },

          orders: {
            total:
              orders.length,

            today:
              todayOrders.length,

            pending:
              pendingOrders,

            active:
              activeOrders,

            completed:
              completedOrders,

            cancelled:
              cancelledOrders,
          },

          revenue: {
            today:
              todayRevenue,

            total:
              totalRevenue,
          },
        },
      });
    } catch (error) {
      console.error(
        "Owner Dashboard Stats Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while fetching owner dashboard statistics",
      });
    }
  };

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
  updateRestaurantDeliveryTime,
  updateRestaurantStatus,
  deleteMyRestaurant,
  getRestaurantById,
  getAllRestaurants,
  getOwnerDashboardStats,
};