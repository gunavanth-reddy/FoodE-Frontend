
const express = require("express");
const { rateLimit } = require("express-rate-limit");

const router = express.Router();

const {
  verifySRMAPStudent,
  registerUser,
  loginUser,
  getProfile,
  saveFCMToken,
  forgotPassword,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

router.post(
  "/verify-student",
  (req, res, next) => {
    console.log("[FoodE] Received student verification request");
    next();
  },
  verificationLimiter,
  verifySRMAPStudent
);
router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/forgot-password", authLimiter, forgotPassword);

router.get("/profile", protect, getProfile);
router.put("/fcm-token", protect, saveFCMToken);

module.exports = router;
