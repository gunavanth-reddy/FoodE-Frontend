
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic information
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    // Mobile number — used for FoodE login
    phone: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, "Enter a valid 10-digit mobile number"],
    },

    // FoodE password — bcrypt hash only
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    // SRM AP ERP student verification
    studentVerification: {
      studentName: {
        type: String,
        trim: true,
        default: null,
      },
      registerNo: {
        type: String,
        trim: true,
        uppercase: true,
        default: null,
      },
      institution: {
        type: String,
        trim: true,
        default: null,
      },
      program: {
        type: String,
        trim: true,
        default: null,
      },
      section: {
        type: String,
        trim: true,
        default: null,
      },
      semester: {
        type: String,
        trim: true,
        default: null,
      },
      specialization: {
        type: String,
        trim: true,
        default: null,
      },
      dob: {
        type: String,
        trim: true,
        default: null,
      },
      gender: {
        type: String,
        trim: true,
        default: null,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: null,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      verifiedAt: {
        type: Date,
        default: null,
      },
    },

    // Push notifications
    fcmToken: {
      type: String,
      default: null,
      trim: true,
    },

    // User role
    role: {
      type: String,
      enum: ["user", "restaurant_owner", "admin"],
      default: "user",
      index: true,
    },

    // Account status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Profile image
    profileImage: {
      type: String,
      default: "",
      trim: true,
    },

    // Separate from ERP student verification
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Unique mobile number
userSchema.index({ phone: 1 }, { unique: true });

// Role and account status
userSchema.index({ role: 1, isActive: 1 });

// Unique student registration number when present.
// Allows existing users without a student registration number.
userSchema.index(
  { "studentVerification.registerNo": 1 },
  {
    unique: true,
    partialFilterExpression: {
      "studentVerification.registerNo": { $type: "string" },
    },
  }
);

module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);
