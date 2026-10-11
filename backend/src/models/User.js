// =====================================================
// USER MODEL
// =====================================================

const mongoose = require("mongoose");

// =====================================================
// USER SCHEMA
// =====================================================

const userSchema = new mongoose.Schema(
  {
    // ===================================================
    // BASIC INFORMATION
    // ===================================================

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    // ===================================================
    // MOBILE NUMBER
    // ===================================================

    phone: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      trim: true,
      index: true,
    },

    // ===================================================
    // FCM NOTIFICATION TOKEN
    // ===================================================

    fcmToken: {
      type: String,
      default: null,
      trim: true,
    },

    // ===================================================
    // PASSWORD
    // ===================================================

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    // ===================================================
    // USER ROLE
    // ===================================================

    role: {
      type: String,
      enum: {
        values: [
          "user",
          "restaurant_owner",
          "admin",
        ],
        message: "Invalid user role",
      },
      default: "user",
      index: true,
    },

    // ===================================================
    // ACCOUNT STATUS
    // ===================================================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ===================================================
    // PROFILE IMAGE
    // ===================================================

    profileImage: {
      type: String,
      default: "",
      trim: true,
    },

    // ===================================================
    // PHONE VERIFICATION
    // ===================================================

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    // ===================================================
    // PASSWORD RESET
    // ===================================================

    resetPasswordOTP: {
      type: String,
      default: null,
      select: false,
    },

    resetPasswordOTPExpiry: {
      type: Date,
      default: null,
      select: false,
    },
  },

  // =====================================================
  // TIMESTAMPS
  // =====================================================

  {
    timestamps: true,
  }
);

// =====================================================
// INDEXES
// =====================================================

userSchema.index(
  { phone: 1 },
  { unique: true }
);

userSchema.index({
  role: 1,
  isActive: 1,
});

// =====================================================
// EXPORT MODEL
// =====================================================

const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

module.exports = User;