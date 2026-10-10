const mongoose = require("mongoose");

// =====================================================
// FOOD SCHEMA
// =====================================================

const foodSchema = new mongoose.Schema(
  {
    // =================================================
    // RESTAURANT
    // =================================================

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    // =================================================
    // CATEGORY
    // =================================================

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    // =================================================
    // FOOD INFORMATION
    // =================================================

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    // Cloudinary image URL
    image: {
      type: String,
      default: "",
      trim: true,
    },

    // =================================================
    // PRICE
    // =================================================

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountedPrice: {
      type: Number,
      default: null,
      min: 0,
    },

    // =================================================
    // AVAILABILITY
    // =================================================

    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },

    // =================================================
    // FOOD DETAILS
    // =================================================

    preparationTime: {
      type: Number,
      default: 20,
      min: 0,
    },

    // Explicit food type
    foodType: {
      type: String,
      enum: ["veg", "non-veg"],
      default: "non-veg",
      index: true,
    },

    // Backward compatibility
    isVegetarian: {
      type: Boolean,
      default: false,
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
  },
  {
    timestamps: true,
  }
);

// =====================================================
// VALIDATION
// =====================================================

foodSchema.pre("validate", function () {
  // ---------------------------------------------------
  // DISCOUNTED PRICE
  // ---------------------------------------------------

  if (
    this.discountedPrice !== null &&
    this.discountedPrice !== undefined &&
    this.discountedPrice > this.price
  ) {
    this.invalidate(
      "discountedPrice",
      "Discounted price cannot be greater than the original price."
    );
  }

  // ---------------------------------------------------
  // KEEP VEGETARIAN FLAG IN SYNC
  // ---------------------------------------------------

  if (this.foodType === "veg") {
    this.isVegetarian = true;
  }

  if (this.foodType === "non-veg") {
    this.isVegetarian = false;
  }
});

// =====================================================
// INDEXES
// =====================================================

// Restaurant food listing
foodSchema.index({
  restaurant: 1,
});

// Restaurant + availability
foodSchema.index({
  restaurant: 1,
  isAvailable: 1,
});

// Restaurant + category
foodSchema.index({
  restaurant: 1,
  category: 1,
});

// Category food listing
foodSchema.index({
  category: 1,
});

// Availability filtering
foodSchema.index({
  isAvailable: 1,
});

// Preparation time filtering
foodSchema.index({
  preparationTime: 1,
});

// Food type filtering
foodSchema.index({
  foodType: 1,
});

// =====================================================
// MODEL EXPORT
// Prevent OverwriteModelError during nodemon reloads
// =====================================================

module.exports =
  mongoose.models.Food ||
  mongoose.model("Food", foodSchema);