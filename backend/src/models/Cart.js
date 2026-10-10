const mongoose = require("mongoose");

// =====================================================
// CART ITEM SCHEMA
// =====================================================

const cartItemSchema = new mongoose.Schema(
  {
    // ================================================
    // FOOD
    // ================================================

    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },

    // ================================================
    // QUANTITY
    // ================================================

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    // ================================================
    // ORIGINAL PRICE
    // ================================================

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // ================================================
    // DISCOUNTED PRICE
    // ================================================

    discountedPrice: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// CART SCHEMA
// =====================================================

const cartSchema = new mongoose.Schema(
  {
    // =================================================
    // CUSTOMER
    // =================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
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
    // CART ITEMS
    // =================================================

    items: {
      type: [cartItemSchema],
      default: [],
    },

    // =================================================
    // TOTALS
    // =================================================

    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
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

cartSchema.pre("validate", function () {
  if (!this.items || this.items.length === 0) {
    this.subtotal = 0;
    this.total = this.deliveryFee || 0;
    return;
  }

  // -----------------------------------------------
  // VALIDATE ITEM DISCOUNTED PRICES
  // -----------------------------------------------

  this.items.forEach((item, index) => {
    if (
      item.discountedPrice !== null &&
      item.discountedPrice !== undefined &&
      item.discountedPrice > item.price
    ) {
      this.invalidate(
        `items.${index}.discountedPrice`,
        "Discounted price cannot be greater than the original price."
      );
    }
  });
});

// =====================================================
// INDEXES
// =====================================================

// User cart lookup
cartSchema.index({
  user: 1,
});

// Restaurant cart lookup
cartSchema.index({
  restaurant: 1,
});

// Restaurant + updated carts
cartSchema.index({
  restaurant: 1,
  updatedAt: -1,
});

// =====================================================
// MODEL EXPORT
// Prevent OverwriteModelError during nodemon reloads
// =====================================================

module.exports =
  mongoose.models.Cart ||
  mongoose.model("Cart", cartSchema);