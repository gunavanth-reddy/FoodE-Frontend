const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");
const { generateOTP, hashOTP, getOTPExpiry, otpMatches } = require("../utils/otp");

const SRMAP_EMAIL_REGEX = /^[^\s@]+@srmap\.edu\.in$/i;
const OTP_MAX_ATTEMPTS = 5;
const OTP_TTL_MS = 5 * 60 * 1000;

const normalizePhone = (phone) => String(phone || "").trim();
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const validatePhone = (phone) => /^\d{10}$/.test(phone);
const validateSRMAPEmail = (email) => SRMAP_EMAIL_REGEX.test(email);

function otpEmailHtml(otp, heading, description) {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#222;line-height:1.5">
    <div style="max-width:520px;margin:24px auto;padding:24px;border:1px solid #eee;border-radius:16px">
      <h2 style="color:#f47721;margin-top:0">FoodE</h2><h3>${heading}</h3><p>${description}</p>
      <div style="font-size:30px;font-weight:700;letter-spacing:8px;padding:18px;text-align:center;background:#fff4eb;border-radius:10px;color:#d95f0b">${otp}</div>
      <p>This code expires in 5 minutes. Do not share it with anyone.</p><p style="font-size:12px;color:#777">If you did not request this code, you can ignore this email.</p>
    </div></body></html>`;
}

async function createAndSendOTP({ email, purpose, subject, heading, description }) {
  const otp = generateOTP();
  const expiresAt = getOTPExpiry();

  // Replace any previous active code for this email and purpose.
  await OTP.deleteMany({ identifier: email, purpose });
  await OTP.create({
    identifier: email,
    otpHash: hashOTP(otp),
    purpose,
    expiresAt,
    attempts: 0,
    verified: false,
  });

  try {
    await sendEmail({
      to: email,
      subject,
      text: `${heading}\n\nYour FoodE verification code is ${otp}. It expires in 5 minutes. Do not share this code.`,
      html: otpEmailHtml(otp, heading, description),
    });
  } catch (error) {
    await OTP.deleteMany({ identifier: email, purpose });
    console.error("FoodE email delivery failed:", error.message);
    const mailError = new Error("We couldn't send the email right now. Please try again later.");
    mailError.statusCode = 503;
    throw mailError;
  }
}

async function validateOTPRecord({ email, purpose, otp, requireVerified = false }) {
  const record = await OTP.findOne({
    identifier: email,
    purpose,
    expiresAt: { $gt: new Date() },
  }).select("+otpHash").sort({ createdAt: -1 });

  if (!record) {
    return { error: "OTP has expired or was not requested. Please request a new code." };
  }
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    return { error: "Too many incorrect attempts. Please request a new OTP." };
  }
  if (requireVerified && !record.verified) {
    return { error: "Please verify the OTP first." };
  }

  if (!otpMatches(otp, record.otpHash)) {
    record.attempts += 1;
    await record.save();
    return { error: "Invalid OTP." };
  }

  return { record };
}

// =====================================================
// SEND REGISTRATION EMAIL OTP
// =====================================================
const sendRegistrationEmailOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!validateSRMAPEmail(email)) {
      return res.status(400).json({ success: false, message: "Enter an email that ends with @srmap.edu.in" });
    }

    const existing = await User.findOne({ email }).select("_id");
    if (existing) {
      return res.status(409).json({ success: false, message: "This email is already registered. Please log in instead." });
    }

    const recentOTP = await OTP.findOne({ identifier: email, purpose: "registration" }).sort({ createdAt: -1 });
    if (recentOTP && Date.now() - recentOTP.createdAt.getTime() < 60 * 1000) {
      return res.status(429).json({ success: false, message: "Please wait 60 seconds before requesting another OTP." });
    }

    await createAndSendOTP({
      email,
      purpose: "registration",
      subject: "Your FoodE registration OTP",
      heading: "Verify your SRM AP email",
      description: "Use this one-time password to verify your SRM AP email address and continue creating your FoodE account.",
    });

    return res.status(200).json({ success: true, message: "Verification OTP sent to your SRM AP email address." });
  } catch (error) {
    console.error("Send Registration OTP Error:", error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Server error while sending verification email.",
    });
  }
};

// =====================================================
// RESEND REGISTRATION EMAIL OTP
// =====================================================
const resendEmailOTP = async (req, res) => sendRegistrationEmailOTP(req, res);

// =====================================================
// VERIFY REGISTRATION EMAIL OTP
// =====================================================
const verifyEmailOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();

    if (!validateSRMAPEmail(email)) {
      return res.status(400).json({ success: false, message: "Enter an email that ends with @srmap.edu.in" });
    }
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ success: false, message: "Enter the valid 6-digit OTP." });
    }

    const result = await validateOTPRecord({ email, purpose: "registration", otp });
    if (result.error) {
      return res.status(400).json({ success: false, message: result.error });
    }

    result.record.verified = true;
    await result.record.save();

    return res.status(200).json({ success: true, message: "Email verified successfully. You can now create your account." });
  } catch (error) {
    console.error("Verify Registration OTP Error:", error);
    return res.status(500).json({ success: false, message: "Server error while verifying email." });
  }
};

// =====================================================
// REGISTER CUSTOMER (requires a verified SRM AP email)
// =====================================================
const registerUser = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = normalizeEmail(req.body.email);
    const phone = normalizePhone(req.body.phone);
    const password = String(req.body.password || "");

    if (name.length < 2) {
      return res.status(400).json({ success: false, message: "Name must be at least 2 characters." });
    }
    if (!validateSRMAPEmail(email)) {
      return res.status(400).json({ success: false, message: "Enter an email that ends with @srmap.edu.in" });
    }
    if (!validatePhone(phone)) {
      return res.status(400).json({ success: false, message: "Enter a valid 10-digit mobile number." });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    }

    const verifiedOTP = await OTP.findOne({
      identifier: email,
      purpose: "registration",
      verified: true,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!verifiedOTP) {
      return res.status(403).json({ success: false, message: "Verify your @srmap.edu.in email before creating an account." });
    }

    const existingPhone = await User.findOne({ phone }).select("_id");
    if (existingPhone) {
      return res.status(409).json({ success: false, message: "Mobile number is already registered." });
    }
    const existingEmail = await User.findOne({ email }).select("_id");
    if (existingEmail) {
      return res.status(409).json({ success: false, message: "This email is already registered. Please log in instead." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      name,
      email,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      phone,
      password: hashedPassword,
      role: "user", // Never accept a public role from the client.
      isActive: true,
      isPhoneVerified: false,
    });

    await OTP.deleteMany({ identifier: email, purpose: "registration" });

    return res.status(201).json({
      success: true,
      message: "Account created successfully. You can now log in with your mobile number and password.",
      user: {
        id: String(newUser._id),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        isEmailVerified: newUser.isEmailVerified,
        isPhoneVerified: newUser.isPhoneVerified,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return res.status(409).json({ success: false, message: field === "email" ? "This email is already registered." : "Mobile number is already registered." });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: Object.values(error.errors)[0]?.message || "Invalid registration details." });
    }
    return res.status(500).json({ success: false, message: "Server error during registration." });
  }
};

// =====================================================
// LOGIN (mobile number + password)
// =====================================================
const loginUser = async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const password = String(req.body.password || "");

    if (!validatePhone(phone)) {
      return res.status(400).json({ success: false, message: "Enter a valid 10-digit mobile number." });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required." });
    }

    const user = await User.findOne({ phone }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid mobile number or password." });
    }
    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: "Your account has been deactivated." });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(401).json({ success: false, message: "Invalid mobile number or password." });
    }
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing in .env");

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: Boolean(user.isEmailVerified),
        isPhoneVerified: user.isPhoneVerified,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Server error during login." });
  }
};

// =====================================================
// FORGOT PASSWORD: send OTP to registered verified email
// =====================================================
const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!validateSRMAPEmail(email)) {
      return res.status(400).json({ success: false, message: "Enter an email that ends with @srmap.edu.in" });
    }

    // Use a generic response to avoid revealing whether an account exists.
    const user = await User.findOne({ email, isEmailVerified: true, isActive: { $ne: false } }).select("_id");
    if (user) {
      const recentOTP = await OTP.findOne({ identifier: email, purpose: "forgot-password" }).sort({ createdAt: -1 });
      if (recentOTP && Date.now() - recentOTP.createdAt.getTime() < 60 * 1000) {
        return res.status(429).json({ success: false, message: "Please wait 60 seconds before requesting another OTP." });
      }
      await createAndSendOTP({
        email,
        purpose: "forgot-password",
        subject: "Your FoodE password reset OTP",
        heading: "Reset your FoodE password",
        description: "Use this one-time password to reset your FoodE account password.",
      });
    }

    return res.status(200).json({ success: true, message: "If an account exists for that SRM AP email, a password-reset OTP has been sent." });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    return res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : "Server error while requesting password reset." });
  }
};

// =====================================================
// VERIFY RESET OTP (does not reset password yet)
// =====================================================
const verifyResetOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();
    if (!validateSRMAPEmail(email)) return res.status(400).json({ success: false, message: "Enter an email that ends with @srmap.edu.in" });
    if (!/^\d{6}$/.test(otp)) return res.status(400).json({ success: false, message: "Enter the valid 6-digit OTP." });

    const result = await validateOTPRecord({ email, purpose: "forgot-password", otp });
    if (result.error) return res.status(400).json({ success: false, message: result.error });

    const userExists = await User.exists({ email, isEmailVerified: true, isActive: { $ne: false } });
    if (!userExists) return res.status(400).json({ success: false, message: "Unable to verify this password-reset request." });

    result.record.verified = true;
    await result.record.save();
    return res.status(200).json({ success: true, message: "OTP verified. You can now reset your password." });
  } catch (error) {
    console.error("Verify Reset OTP Error:", error);
    return res.status(500).json({ success: false, message: "Server error while verifying reset OTP." });
  }
};

// =====================================================
// RESET PASSWORD
// =====================================================
const resetPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();
    const newPassword = String(req.body.newPassword || "");

    if (!validateSRMAPEmail(email)) return res.status(400).json({ success: false, message: "Enter an email that ends with @srmap.edu.in" });
    if (!/^\d{6}$/.test(otp)) return res.status(400).json({ success: false, message: "Enter the valid 6-digit OTP." });
    if (newPassword.length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });

    const result = await validateOTPRecord({ email, purpose: "forgot-password", otp, requireVerified: true });
    if (result.error) return res.status(400).json({ success: false, message: result.error });

    const user = await User.findOne({ email, isEmailVerified: true, isActive: { $ne: false } }).select("+password");
    if (!user) return res.status(400).json({ success: false, message: "Unable to reset password for this account." });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    await OTP.deleteMany({ identifier: email, purpose: "forgot-password" });

    return res.status(200).json({ success: true, message: "Password reset successfully. Please log in with your new password." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ success: false, message: "Server error while resetting password." });
  }
};

// =====================================================
// GET PROFILE
// =====================================================
const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) return res.status(401).json({ success: false, message: "Unauthorized." });
    const user = await User.findById(req.user._id).select("-password -resetPasswordOTP -resetPasswordOTPExpiry");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (user.isActive === false) return res.status(403).json({ success: false, message: "Your account has been deactivated." });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching profile." });
  }
};

// =====================================================
// SAVE FCM NOTIFICATION TOKEN
// =====================================================
const saveFCMToken = async (req, res) => {
  try {
    if (!req.user || !req.user._id) return res.status(401).json({ success: false, message: "Unauthorized." });
    const fcmToken = String(req.body.fcmToken || "").trim();
    if (!fcmToken) return res.status(400).json({ success: false, message: "FCM token is required." });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (user.isActive === false) return res.status(403).json({ success: false, message: "Your account has been deactivated." });

    user.fcmToken = fcmToken;
    await user.save();
    return res.status(200).json({ success: true, message: "FCM token saved successfully." });
  } catch (error) {
    console.error("Save FCM Token Error:", error);
    return res.status(500).json({ success: false, message: "Server error while saving FCM token." });
  }
};

module.exports = {
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
};
