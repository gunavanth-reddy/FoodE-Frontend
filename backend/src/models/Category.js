const mongoose = require("mongoose");

// =====================================================
// CATEGORY SCHEMA
// =====================================================

const categorySchema = new mongoose.Schema(
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
    // CATEGORY INFORMATION
    // =================================================

    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    // Cloudinary image URL
    image: {
      type: String,
      default: "",
      trim: true,
    },

    // =================================================
    // STATUS
    // =================================================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // =================================================
    // DISPLAY ORDER
    // =================================================

    displayOrder: {
      type: Number,
      default: 0,
      min: [0, "Display order cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// INDEXES
// =====================================================

// Restaurant category listing
categorySchema.index({
  restaurant: 1,
  isActive: 1,
});

// Restaurant + display order
categorySchema.index({
  restaurant: 1,
  displayOrder: 1,
});

// Prevent duplicate category names inside the same restaurant
categorySchema.index(
  { restaurant: 1, name: 1 },
  { unique: true }
);

// =====================================================
// MODEL EXPORT
// Prevent OverwriteModelError during nodemon reloads
// =====================================================

module.exports =
  mongoose.models.Category ||
  mongoose.model("Category", categorySchema);