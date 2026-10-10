// =====================================================
// USER MODEL
// =====================================================
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    // Email is optional for legacy owner/admin accounts, but required
    // by the public customer-registration controller.
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    phone: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      trim: true,
    },

    fcmToken: {
      type: String,
      default: null,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    role: {
      type: String,
      enum: {
        values: ["user", "restaurant_owner", "admin"],
        message: "Invalid user role",
      },
      default: "user",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    profileImage: {
      type: String,
      default: "",
      trim: true,
    },

    // Kept for compatibility with existing phone-verification features.
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    // Legacy fields are retained to avoid breaking existing records/code.
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
  { timestamps: true }
);

userSchema.index({ role: 1, isActive: 1 });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
