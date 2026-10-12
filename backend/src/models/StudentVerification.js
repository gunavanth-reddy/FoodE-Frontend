
const mongoose = require("mongoose");

const studentVerificationSchema = new mongoose.Schema(
  {
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    registerNo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    studentName: {
      type: String,
      trim: true,
    },
    institution: {
      type: String,
      trim: true,
    },
    program: {
      type: String,
      trim: true,
    },
    section: {
      type: String,
      trim: true,
    },
    semester: {
      type: String,
      trim: true,
    },
    specialization: {
      type: String,
      trim: true,
    },
    dob: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

studentVerificationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

module.exports =
  mongoose.models.StudentVerification ||
  mongoose.model("StudentVerification", studentVerificationSchema);
