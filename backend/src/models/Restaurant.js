const mongoose = require("mongoose");

// =====================================================
// DELIVERY SLOT SCHEMA
// =====================================================

const deliverySlotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    startTime: {
      type: String,
      required: true,
      trim: true,
    },

    endTime: {
      type: String,
      required: true,
      trim: true,
    },

    deliveryTime: {
      min: {
        type: Number,
        required: true,
        default: 20,
        min: 1,
      },

      max: {
        type: Number,
        required: true,
        default: 35,
        min: 1,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    cutoffMinutes: {
      type: Number,
      default: 30,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// RESTAURANT SCHEMA
// =====================================================

const restaurantSchema = new mongoose.Schema(
  {
    // =================================================
    // RESTAURANT OWNER
    // =================================================

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =================================================
    // BASIC INFORMATION
    // =================================================

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    logo: {
      type: String,
      default: "",
      trim: true,
    },

    coverImage: {
      type: String,
      default: "",
      trim: true,
    },

    // =================================================
    // CONTACT
    // =================================================

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    // =================================================
    // LOCATION
    // =================================================

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    // =================================================
    // RESTAURANT STATUS
    // =================================================

    isOpen: {
      type: Boolean,
      default: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // =================================================
    // DELIVERY MODE
    // =================================================

    deliveryMode: {
      type: String,
      enum: ["standard", "time_slots"],
      default: "standard",
    },

    // =================================================
    // STANDARD DELIVERY TIME
    // =================================================

    deliveryTime: {
      min: {
        type: Number,
        default: 20,
        min: 1,
      },

      max: {
        type: Number,
        default: 35,
        min: 1,
      },
    },

    // =================================================
    // DELIVERY FEE
    // =================================================
    // FoodE rule:
    // Minimum ₹10
    // Maximum ₹40
    // =================================================

    deliveryFee: {
      type: Number,
      default: 10,
      min: [10, "Delivery fee cannot be less than ₹10"],
      max: [40, "Delivery fee cannot exceed ₹40"],
    },

    // =================================================
    // MINIMUM ORDER
    // =================================================

    minimumOrder: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =================================================
    // DELIVERY SLOTS
    // =================================================

    deliverySlots: {
      type: [deliverySlotSchema],
      default: [],
    },

    // =================================================
    // RATING
    // =================================================

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =================================================
    // CUISINES
    // =================================================

    cuisines: [
      {
        type: String,
        trim: true,
      },
    ],

    // =================================================
    // OPERATING HOURS
    // =================================================

    openingTime: {
      type: String,
      default: "",
      trim: true,
    },

    closingTime: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// VALIDATION
// =====================================================

restaurantSchema.pre("validate", function () {
  // ===================================================
  // STANDARD DELIVERY TIME
  // ===================================================

  if (
    this.deliveryTime &&
    this.deliveryTime.min != null &&
    this.deliveryTime.max != null &&
    this.deliveryTime.min > this.deliveryTime.max
  ) {
    this.invalidate(
      "deliveryTime.max",
      "Maximum delivery time must be greater than or equal to minimum delivery time."
    );
  }

  // ===================================================
  // DELIVERY SLOTS
  // ===================================================

  if (
    this.deliverySlots &&
    this.deliverySlots.length > 0
  ) {
    this.deliverySlots.forEach((slot, index) => {
      // -----------------------------------------------
      // Delivery time validation
      // -----------------------------------------------

      if (
        slot.deliveryTime &&
        slot.deliveryTime.min != null &&
        slot.deliveryTime.max != null &&
        slot.deliveryTime.min >
          slot.deliveryTime.max
      ) {
        this.invalidate(
          `deliverySlots.${index}.deliveryTime.max`,
          "Slot maximum delivery time must be greater than or equal to minimum delivery time."
        );
      }

      // -----------------------------------------------
      // Time format validation
      // -----------------------------------------------

      const timeRegex =
        /^([01]\d|2[0-3]):([0-5]\d)$/;

      if (
        slot.startTime &&
        !timeRegex.test(slot.startTime)
      ) {
        this.invalidate(
          `deliverySlots.${index}.startTime`,
          "Start time must be in HH:MM format."
        );
      }

      if (
        slot.endTime &&
        !timeRegex.test(slot.endTime)
      ) {
        this.invalidate(
          `deliverySlots.${index}.endTime`,
          "End time must be in HH:MM format."
        );
      }

      // -----------------------------------------------
      // Cutoff validation
      // -----------------------------------------------

      if (
        slot.cutoffMinutes != null &&
        slot.startTime &&
        timeRegex.test(slot.startTime)
      ) {
        const [hours, minutes] =
          slot.startTime
            .split(":")
            .map(Number);

        const startMinutes =
          hours * 60 + minutes;

        if (
          slot.cutoffMinutes >
          startMinutes
        ) {
          this.invalidate(
            `deliverySlots.${index}.cutoffMinutes`,
            "Cutoff time cannot be greater than the slot start time."
          );
        }
      }
    });
  }
});

// =====================================================
// INDEXES
// =====================================================

restaurantSchema.index({
  owner: 1,
});

restaurantSchema.index({
  city: 1,
});

restaurantSchema.index({
  isActive: 1,
});

restaurantSchema.index({
  isOpen: 1,
});

restaurantSchema.index({
  city: 1,
  isActive: 1,
});

restaurantSchema.index({
  isActive: 1,
  isOpen: 1,
});

// =====================================================
// MODEL
// =====================================================

module.exports =
  mongoose.models.Restaurant ||
  mongoose.model(
    "Restaurant",
    restaurantSchema
  );