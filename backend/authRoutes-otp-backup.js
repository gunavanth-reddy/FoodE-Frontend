const express = require("express");
const { rateLimit } = require("express-rate-limit");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  saveFCMToken,
  sendRegistrationEmailOTP,
  resendEmailOTP,
  verifyEmailOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.OTP_SEND_RATE_LIMIT_MAX || 1000),
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.OTP_VERIFY_RATE_LIMIT_MAX || 2000),
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT_MAX || 1000),
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

// Registration email OTP
router.post("/send-email-otp", otpSendLimiter, sendRegistrationEmailOTP);
router.post("/resend-email-otp", otpSendLimiter, resendEmailOTP);
router.post("/verify-email", otpVerifyLimiter, verifyEmailOTP);

// Account registration and login
router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);

// Password reset
router.post("/forgot-password", otpSendLimiter, forgotPassword);
router.post("/verify-reset-otp", otpVerifyLimiter, verifyResetOTP);
router.post("/reset-password", authLimiter, resetPassword);

// Protected routes
router.get("/profile", protect, getProfile);
router.put("/fcm-token", protect, saveFCMToken);

module.exports = router;