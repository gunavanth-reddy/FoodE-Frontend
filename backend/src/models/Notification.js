const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // ==========================================
    // RECIPIENT
    // ==========================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================
    // NOTIFICATION TYPE
    // ==========================================

    type: {
      type: String,
      enum: [
        // Customer
        "ORDER_PLACED",
        "ORDER_DELIVERED",
        "PROMOTION",
        "ADMIN_BROADCAST",

        // Restaurant Owner
        "NEW_ORDER",
        "RESTAURANT_APPROVED",
        "RESTAURANT_REJECTED",
        "NEW_REVIEW",

        // Admin
        "NEW_RESTAURANT",
        "PLATFORM_EVENT",
      ],
      required: true,
    },

    // ==========================================
    // TITLE
    // ==========================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // MESSAGE
    // ==========================================

    message: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // OPTIONAL REFERENCES
    // ==========================================

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
    },

    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      default: null,
    },

    // ==========================================
    // READ STATUS
    // ==========================================

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);