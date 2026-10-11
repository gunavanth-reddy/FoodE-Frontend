const mongoose = require("mongoose");

// =====================================================
// GENERATE ORDER NUMBER
// =====================================================

const generateOrderNumber = () => {
  const timestamp = Date.now().toString();

  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `FE-${timestamp}-${random}`;
};

// =====================================================
// ORDER ITEM
// =====================================================

const orderItemSchema = new mongoose.Schema(
  {
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // Original food price at the time of order
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Discounted/sale price at the time of order
    discountedPrice: {
      type: Number,
      default: null,
      min: 0,
    },

    // Final item total
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// DELIVERY ADDRESS
// =====================================================

const addressSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    pincode: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// DELIVERY SLOT SNAPSHOT
// =====================================================

const deliverySlotSchema = new mongoose.Schema(
  {
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliverySlot",
      required: true,
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
  },
  {
    _id: false,
  }
);

// =====================================================
// ORDER SCHEMA
// =====================================================

const orderSchema = new mongoose.Schema(
  {
    // ================================================
    // CUSTOMER
    // ================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ================================================
    // RESTAURANT
    // ================================================

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    // ================================================
    // ORDER ITEMS
    // ================================================

    items: {
      type: [orderItemSchema],
      required: true,

      validate: {
        validator: function (items) {
          return (
            Array.isArray(items) &&
            items.length > 0
          );
        },

        message:
          "Order must contain at least one item",
      },
    },

    // ================================================
    // DELIVERY ADDRESS
    // ================================================

    deliveryAddress: {
      type: addressSchema,
      required: true,
    },

    // ================================================
    // DELIVERY SLOT
    // ================================================

    deliverySlot: {
      type: deliverySlotSchema,
      required: true,
    },

    // ================================================
    // PRICE DETAILS
    // ================================================

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    // ================================================
    // PAYMENT
    // ================================================

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
      ],
      default: "PENDING",
    },

    // ================================================
    // ORDER STATUS
    // ================================================

    status: {
      type: String,
      enum: [
        "PLACED",
        "CONFIRMED",
        "DELIVERED",
      ],
      default: "PLACED",
      index: true,
    },

    // ================================================
    // CUSTOMER NOTE
    // ================================================

    customerNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    // ================================================
    // ORDER NUMBER
    // ================================================

    orderNumber: {
      type: String,
      unique: true,
      index: true,
      default: generateOrderNumber,
    },

    // ================================================
    // ORDER TIMESTAMPS
    // ================================================

    confirmedAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// INDEXES
// =====================================================

// Customer order history
orderSchema.index({
  user: 1,
  createdAt: -1,
});

// Restaurant order history
orderSchema.index({
  restaurant: 1,
  createdAt: -1,
});

// Restaurant order status filtering
orderSchema.index({
  restaurant: 1,
  status: 1,
  createdAt: -1,
});

// Analytics
orderSchema.index({
  status: 1,
  createdAt: -1,
});

// =====================================================
// MODEL EXPORT
// Prevent OverwriteModelError during nodemon reloads
// =====================================================

module.exports =
  mongoose.models.Order ||
  mongoose.model("Order", orderSchema);