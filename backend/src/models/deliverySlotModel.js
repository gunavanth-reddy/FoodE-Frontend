const mongoose = require("mongoose");

// =====================================================
// DELIVERY SLOT SCHEMA
// =====================================================

const deliverySlotSchema = new mongoose.Schema(
  {
    // =================================================
    // RESTAURANT
    // =================================================

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant is required"],
      index: true,
    },

    // =================================================
    // SLOT START TIME
    // =================================================
    // Example: "12:00"
    // =================================================

    startTime: {
      type: String,
      required: [true, "Start time is required"],
      trim: true,
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Start time must be in HH:MM format",
      ],
    },

    // =================================================
    // SLOT END TIME
    // =================================================
    // Example: "12:30"
    // =================================================

    endTime: {
      type: String,
      required: [true, "End time is required"],
      trim: true,
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "End time must be in HH:MM format",
      ],
    },

    // =================================================
    // DELIVERY TIME
    // =================================================
    // Example:
    //
    // {
    //   min: 20,
    //   max: 35
    // }
    //
    // =================================================

    deliveryTime: {
      min: {
        type: Number,
        required: true,
        default: 20,
        min: [
          1,
          "Minimum delivery time must be at least 1 minute",
        ],
      },

      max: {
        type: Number,
        required: true,
        default: 35,
        min: [
          1,
          "Maximum delivery time must be at least 1 minute",
        ],
      },
    },

    // =================================================
    // SLOT STATUS
    // =================================================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // =================================================
    // BOOKING CUTOFF
    // =================================================
    //
    // Example:
    //
    // Slot: 12:00 - 12:30
    // Cutoff: 10 minutes
    //
    // Booking closes at 11:50
    //
    // =================================================

    cutoffMinutes: {
      type: Number,
      default: 10,
      min: [
        0,
        "Cutoff minutes cannot be negative",
      ],
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// TIME HELPER
// =====================================================

function timeToMinutes(time) {
  if (
    typeof time !== "string" ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  ) {
    return null;
  }

  const [hours, minutes] = time
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}

// =====================================================
// VALIDATION
// =====================================================

deliverySlotSchema.pre("validate", function () {
  // ===================================================
  // DELIVERY TIME VALIDATION
  // ===================================================

  if (
    this.deliveryTime &&
    this.deliveryTime.min != null &&
    this.deliveryTime.max != null
  ) {
    if (
      this.deliveryTime.min >
      this.deliveryTime.max
    ) {
      this.invalidate(
        "deliveryTime.max",
        "Maximum delivery time must be greater than or equal to minimum delivery time."
      );
    }
  }

  // ===================================================
  // START / END TIME VALIDATION
  // ===================================================

  if (this.startTime && this.endTime) {
    const startMinutes =
      timeToMinutes(this.startTime);

    const endMinutes =
      timeToMinutes(this.endTime);

    if (
      startMinutes !== null &&
      endMinutes !== null
    ) {
      // End must be after start
      if (startMinutes >= endMinutes) {
        this.invalidate(
          "endTime",
          "End time must be later than start time."
        );
      }

      // Slot must be exactly 30 minutes
      if (
        endMinutes - startMinutes !== 30
      ) {
        this.invalidate(
          "endTime",
          "Delivery slot must be exactly 30 minutes."
        );
      }
    }
  }

  // ===================================================
  // CUTOFF VALIDATION
  // ===================================================

  if (
    this.cutoffMinutes != null &&
    this.startTime
  ) {
    const startMinutes =
      timeToMinutes(this.startTime);

    if (startMinutes !== null) {
      if (
        this.cutoffMinutes >
        startMinutes
      ) {
        this.invalidate(
          "cutoffMinutes",
          "Cutoff minutes cannot exceed the time from midnight to slot start."
        );
      }
    }
  }
});

// =====================================================
// INDEXES
// =====================================================

// Restaurant + active slots
deliverySlotSchema.index({
  restaurant: 1,
  isActive: 1,
});

// Restaurant + slot start time
deliverySlotSchema.index({
  restaurant: 1,
  startTime: 1,
});

// Restaurant + active + start time
deliverySlotSchema.index({
  restaurant: 1,
  isActive: 1,
  startTime: 1,
});

// =====================================================
// MODEL EXPORT
// =====================================================

module.exports =
  mongoose.models.DeliverySlot ||
  mongoose.model(
    "DeliverySlot",
    deliverySlotSchema
  );