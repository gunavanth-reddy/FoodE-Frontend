const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // ==========================================
    // USER
    // ==========================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================
    // ORDER
    // ==========================================

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      index: true,
    },

    // ==========================================
    // AMOUNT
    // ==========================================

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },

    // ==========================================
    // PAYMENT METHOD
    // ==========================================

    method: {
      type: String,
      enum: [
        "COD",
        "ONLINE",
      ],
      required: true,
    },

    // ==========================================
    // PAYMENT STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        "PENDING",
        "SUCCESS",
        "FAILED",
        "REFUNDED",
      ],
      default: "PENDING",
      index: true,
    },

    // ==========================================
    // PAYMENT GATEWAY DETAILS
    // ==========================================

    gateway: {
      type: String,
      default: "",
    },

    gatewayOrderId: {
      type: String,
      default: "",
      sparse: true,
    },

    gatewayPaymentId: {
      type: String,
      default: "",
      sparse: true,
    },

    gatewaySignature: {
      type: String,
      default: "",
    },

    // ==========================================
    // REFUND
    // ==========================================

    refundId: {
      type: String,
      default: "",
    },

    refundedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Payment",
  paymentSchema
);