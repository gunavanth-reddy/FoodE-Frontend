// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =====================================================
// PROTECT ROUTES
// =====================================================

const protect = async (req, res, next) => {
  try {
    // ===================================================
    // CHECK JWT SECRET
    // ===================================================

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error",
      });
    }

    // ===================================================
    // READ AUTHORIZATION HEADER
    // ===================================================

    let token;

    const authHeader = req.headers.authorization;

    if (
      authHeader &&
      authHeader.startsWith("Bearer ")
    ) {
      token = authHeader.split(" ")[1];
    }

    // ===================================================
    // NO TOKEN
    // ===================================================

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. No token provided.",
      });
    }

    // ===================================================
    // VERIFY TOKEN
    // ===================================================

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (jwtError) {
      console.error(
        "JWT Verification Error:",
        jwtError.message
      );

      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // ===================================================
    // VALIDATE TOKEN PAYLOAD
    // ===================================================

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    // ===================================================
    // FIND CURRENT USER
    // ===================================================
    //
    // Always get the role from the database.
    // This means if an account's role changes,
    // authorization uses the current database role.
    // ===================================================

    const user = await User.findById(
      decoded.id
    ).select("-password");

    // ===================================================
    // USER DOES NOT EXIST
    // ===================================================

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // ===================================================
    // CHECK ACCOUNT STATUS
    // ===================================================

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    // ===================================================
    // ATTACH USER TO REQUEST
    // ===================================================

    req.user = user;

    // ===================================================
    // DEBUG
    // ===================================================

    console.log("Authorization Check:", {
      userRole: user.role,
      userId: user._id,
    });

    console.log(
      "➡️ Authorized Request:",
      req.method,
      req.originalUrl
    );

    // ===================================================
    // CONTINUE
    // ===================================================

    next();
  } catch (error) {
    console.error(
      "Auth Middleware Error:",
      error
    );

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = protect;