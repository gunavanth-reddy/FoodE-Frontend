// =====================================================
// ROLE AUTHORIZATION MIDDLEWARE
// =====================================================

// =====================================================
// NORMALIZE ROLE
// =====================================================

const normalizeRole = (role) => {
  if (!role) {
    return "";
  }

  const normalized =
    String(role)
      .trim()
      .toLowerCase();

  // Restaurant owner variations
  if (
    normalized === "restaurantowner" ||
    normalized === "restaurant-owner" ||
    normalized === "restaurant_owner"
  ) {
    return "restaurant_owner";
  }

  // Customer
  if (
    normalized === "user"
  ) {
    return "user";
  }

  // Admin
  if (
    normalized === "admin"
  ) {
    return "admin";
  }

  return normalized;
};

// =====================================================
// AUTHORIZE ROLES
// =====================================================

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // ==========================================
    // AUTHENTICATION CHECK
    // ==========================================

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // ==========================================
    // CURRENT USER ROLE
    // ==========================================

    const userRole =
      normalizeRole(
        req.user.role
      );

    // ==========================================
    // ALLOWED ROLES
    // ==========================================

    const normalizedAllowedRoles =
      allowedRoles.map(
        normalizeRole
      );

    // ==========================================
    // ROLE CHECK
    // ==========================================

    if (
      !normalizedAllowedRoles.includes(
        userRole
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to access this resource",
      });
    }

    // ==========================================
    // AUTHORIZATION PASSED
    // ==========================================

    next();
  };
};

module.exports = authorize;