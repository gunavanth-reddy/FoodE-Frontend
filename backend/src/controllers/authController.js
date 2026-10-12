
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const StudentVerification = require("../models/StudentVerification");
const { verifyERPStudent } = require("../services/erpService");

const normalizePhone = (value) => String(value || "").trim();
const validPhone = (phone) => /^[0-9]{10}$/.test(phone);

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const publicUser = (user) => ({
  id: String(user._id),
  name: user.name,
  phone: user.phone,
  role: user.role,
  isActive: user.isActive,
  isPhoneVerified: Boolean(user.isPhoneVerified),
  profileImage: user.profileImage,
  studentVerification: user.studentVerification,
});

// Verify the student's SRM AP portal credentials during signup only.
const verifySRMAPStudent = async (req, res) => {
  try {
    const portalRegisterNo = String(
      req.body.registerNo || req.body.username || ""
    ).trim();
    const password = String(req.body.password || "");

    if (!portalRegisterNo || !password) {
      return res.status(400).json({
        success: false,
        message: "Student registration number and portal password are required.",
      });
    }

    const result = await verifyERPStudent({
      registerNo: portalRegisterNo,
      password,
    });

    if (!result || result.success !== true) {
      return res.status(401).json({
        success: false,
        message: result?.message || "ERP verification failed.",
      });
    }

    const student = result.student || {};
    const registerNo = String(student.registerNo || "")
      .trim()
      .toUpperCase();

    if (!registerNo) {
      return res.status(502).json({
        success: false,
        message: "ERP did not return a student registration number.",
      });
    }

    const existing = await User.exists({
      "studentVerification.registerNo": registerNo,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This student is already registered with FoodE.",
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    await StudentVerification.create({
      tokenHash: hashToken(verificationToken),
      registerNo,
      studentName: String(student.studentName || "").trim(),
      institution: String(student.institution || "SRM AP").trim(),
      program: String(student.program || "").trim(),
      section: String(student.section || "").trim(),
      semester: String(student.semester || "").trim(),
      specialization: String(student.specialization || "").trim(),
      dob: String(student.dob || "").trim(),
      gender: String(student.gender || "").trim(),
      email: String(student.email || "").trim(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    return res.status(200).json({
      success: true,
      message: "SRM AP student verified successfully.",
      verificationToken,
      student: {
        registerNo,
        studentName: student.studentName || "",
        institution: student.institution || "SRM AP",
        program: student.program || "",
      },
    });
  } catch (error) {
    console.error("ERP Verification Error:", error.message);

    return res.status(502).json({
      success: false,
      message: "Unable to verify ERP details right now.",
    });
  }
};

// Create FoodE account only after ERP verification.
const registerUser = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const phone = normalizePhone(req.body.phone);
    const password = String(req.body.password || "");
    const verificationToken = String(
      req.body.verificationToken || ""
    ).trim();

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must contain at least 2 characters.",
      });
    }

    if (!validPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    if (!/^[a-f0-9]{64}$/i.test(verificationToken)) {
      return res.status(403).json({
        success: false,
        message: "Verify your SRM AP ERP account first.",
      });
    }

    const phoneExists = await User.exists({ phone });

    if (phoneExists) {
      return res.status(409).json({
        success: false,
        message: "Mobile number is already registered.",
      });
    }

    // Atomically claim the token to prevent reuse.
    const verification = await StudentVerification.findOneAndUpdate(
      {
        tokenHash: hashToken(verificationToken),
        consumedAt: null,
        expiresAt: { $gt: new Date() },
      },
      { $set: { consumedAt: new Date() } },
      { new: true }
    );

    if (!verification) {
      return res.status(403).json({
        success: false,
        message: "Verification expired or already used. Verify ERP again.",
      });
    }

    const studentExists = await User.exists({
      "studentVerification.registerNo": verification.registerNo,
    });

    if (studentExists) {
      return res.status(409).json({
        success: false,
        message: "This student already has a FoodE account.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      phone,
      password: hashedPassword,
      role: "user",
      isActive: true,
      isPhoneVerified: false,
      studentVerification: {
        registerNo: verification.registerNo,
        studentName: verification.studentName,
        institution: verification.institution,
        program: verification.program,
        section: verification.section,
        semester: verification.semester,
        specialization: verification.specialization,
        dob: verification.dob,
        gender: verification.gender,
        email: verification.email,
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Account created. Log in with mobile number and password.",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Register Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Mobile number or student ID already registered.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid registration details.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};

// Login: mobile number + FoodE password only.
const loginUser = async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const password = String(req.body.password || "");

    if (!validPhone(phone) || !password) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid mobile number and password.",
      });
    }

    const user = await User.findOne({ phone }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid mobile number or password.",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated.",
      });
    }

    return res.status(200).json({
      success: true,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Get Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile.",
    });
  }
};

const saveFCMToken = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const fcmToken = String(req.body.fcmToken || "").trim();

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: "FCM token is required.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated.",
      });
    }

    user.fcmToken = fcmToken;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "FCM token saved successfully.",
    });
  } catch (error) {
    console.error("Save FCM Token Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while saving FCM token.",
    });
  }
};

// No OTP-based password recovery.
const forgotPassword = async (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "To recover your FoodE account, contact FoodE support.",
  });
};

module.exports = {
  verifySRMAPStudent,
  registerUser,
  loginUser,
  getProfile,
  saveFCMToken,
  forgotPassword,
};
