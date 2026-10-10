const mongoose = require("mongoose");

// =====================================================
// REVIEW SCHEMA
// =====================================================

const reviewSchema = new mongoose.Schema(
  {
    // =================================================
    // CUSTOMER
    // =================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

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
    // FOOD
    // =================================================
    // null = restaurant review
    // value = food review
    // =================================================

    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      default: null,
      index: true,
    },

    // =================================================
    // ORDER
    // =================================================

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    // =================================================
    // RATING
    // =================================================

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // =================================================
    // REVIEW COMMENT
    // =================================================

    comment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    // =================================================
    // OWNER / ADMIN RESPONSE
    // =================================================

    response: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    // =================================================
    // VISIBILITY
    // =================================================

    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// PREVENT DUPLICATE RESTAURANT REVIEWS
// =====================================================
//
// One user can create one restaurant review
// for a particular order.
//
// food = null means restaurant review.
//
// =====================================================

reviewSchema.index(
  {
    user: 1,
    order: 1,
    restaurant: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      food: null,
    },
  }
);

// =====================================================
// PREVENT DUPLICATE FOOD REVIEWS
// =====================================================
//
// One user can create one review for a particular
// food item within a particular order.
//
// =====================================================

reviewSchema.index(
  {
    user: 1,
    order: 1,
    restaurant: 1,
    food: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      food: {
        $exists: true,
        $ne: null,
      },
    },
  }
);

// =====================================================
// QUERY INDEXES
// =====================================================

// Restaurant reviews
reviewSchema.index({
  restaurant: 1,
  createdAt: -1,
});

// Food reviews
reviewSchema.index({
  food: 1,
  createdAt: -1,
});

// User's reviews
reviewSchema.index({
  user: 1,
  createdAt: -1,
});

// Visible restaurant reviews
reviewSchema.index({
  restaurant: 1,
  isVisible: 1,
  createdAt: -1,
});

// Visible food reviews
reviewSchema.index({
  food: 1,
  isVisible: 1,
  createdAt: -1,
});

// =====================================================
// MODEL EXPORT
// Prevent OverwriteModelError during nodemon reloads
// =====================================================

module.exports =
  mongoose.models.Review ||
  mongoose.model("Review", reviewSchema);