const mongoose = require("mongoose");

const deliverySlotSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant is required"],
      index: true,
    },

    // Date in YYYY-MM-DD format using the India local calendar.
    date: {
      type: String,
      trim: true,
      default: null,
      match: [
        /^\d{4}-\d{2}-\d{2}$/,
        "Date must be YYYY-MM-DD",
      ],
      index: true,
    },

    // Stored in 24-hour HH:MM format.
    // Example: 09:00 = 9 AM, 14:30 = 2:30 PM.
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      trim: true,
      match: [
        /^([01]\d|2[0-3]):[0-5]\d$/,
        "Start time must be HH:MM",
      ],
    },

    endTime: {
      type: String,
      required: [true, "End time is required"],
      trim: true,
      match: [
        /^([01]\d|2[0-3]):[0-5]\d$/,
        "End time must be HH:MM",
      ],
    },

    // Automatically calculated from startTime and endTime.
    durationMinutes: {
      type: Number,
      default: null,
      min: [
        10,
        "Slot duration must be at least 10 minutes",
      ],
    },

    // Expected delivery ETA in minutes.
    deliveryTime: {
      min: {
        type: Number,
        required: true,
        default: 20,
        min: [1, "Minimum delivery time must be at least 1 minute"],
      },
      max: {
        type: Number,
        required: true,
        default: 35,
        min: [1, "Maximum delivery time must be at least 1 minute"],
      },
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Booking closes this many minutes before startTime.
    cutoffMinutes: {
      type: Number,
      default: 10,
      min: [0, "Cutoff minutes cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

/* ================= HELPERS ================= */

const timeToMinutes = (time) => {
  if (
    typeof time !== "string" ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  ) {
    return null;
  }

  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};

const isValidCalendarDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) {
    return false;
  }

  const [year, month, day] = String(value).split("-").map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

/* ================= VALIDATION ================= */

deliverySlotSchema.pre("validate", function () {
  // Validate date only when supplied.
  // Keeping this optional supports legacy documents.
  if (
    this.date != null &&
    !isValidCalendarDate(this.date)
  ) {
    this.invalidate(
      "date",
      "Date must be a valid YYYY-MM-DD date"
    );
  }

  const start = timeToMinutes(this.startTime);
  const end = timeToMinutes(this.endTime);

  if (start !== null && end !== null) {
    const duration = end - start;

    if (duration <= 0) {
      this.invalidate(
        "endTime",
        "End time must be later than start time"
      );
    } else {
      if (duration < 10) {
        this.invalidate(
          "durationMinutes",
          "Slot duration must be at least 10 minutes"
        );
      }

      if (
        this.durationMinutes != null &&
        Number(this.durationMinutes) !== duration
      ) {
        this.invalidate(
          "durationMinutes",
          "Duration must match startTime and endTime"
        );
      }

      // Ensure cutoff occurs before the slot begins,
      // rather than at or after the slot's end.
      if (
        this.cutoffMinutes != null &&
        Number(this.cutoffMinutes) >= duration
      ) {
        this.invalidate(
          "cutoffMinutes",
          "Cutoff must be smaller than the slot duration"
        );
      }
    }
  }

  // Validate expected delivery ETA.
  if (
    this.deliveryTime?.min != null &&
    this.deliveryTime?.max != null &&
    Number(this.deliveryTime.min) >
      Number(this.deliveryTime.max)
  ) {
    this.invalidate(
      "deliveryTime.max",
      "Maximum delivery time must be greater than or equal to minimum"
    );
  }

  if (
    this.cutoffMinutes != null &&
    (!Number.isFinite(Number(this.cutoffMinutes)) ||
      Number(this.cutoffMinutes) < 0)
  ) {
    this.invalidate(
      "cutoffMinutes",
      "Cutoff must be a non-negative number"
    );
  }
});

/* ================= INDEXES ================= */

// Supports finding slots for a restaurant and date.
deliverySlotSchema.index({
  restaurant: 1,
  date: 1,
  startTime: 1,
});

// Supports filtering active slots for a specific date.
deliverySlotSchema.index({
  restaurant: 1,
  date: 1,
  isActive: 1,
  startTime: 1,
});

// Supports existing queries that filter by restaurant and status.
deliverySlotSchema.index({
  restaurant: 1,
  isActive: 1,
  startTime: 1,
});

/* ================= EXPORT ================= */

module.exports =
  mongoose.models.DeliverySlot ||
  mongoose.model("DeliverySlot", deliverySlotSchema);