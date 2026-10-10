const express = require("express");

const router = express.Router();

const {
    getPendingRestaurants,
    approveRestaurant,
    rejectRestaurant,
    getAllRestaurants,
    toggleRestaurantStatus,
    getAllUsers,
    toggleUserStatus,
    getDashboardStats,
    getOrderStats,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// =====================================================
// ALL ADMIN ROUTES
// =====================================================

// Every route below requires:
// 1. Login
// 2. Admin role

router.use(protect);
router.use(authorize("admin"));

// =====================================================
// ADMIN DASHBOARD
// =====================================================

// Main dashboard statistics
router.get(
    "/dashboard",
    getDashboardStats
);

// Order + revenue statistics
router.get(
    "/dashboard/orders",
    getOrderStats
);

// =====================================================
// RESTAURANT MANAGEMENT
// =====================================================

// Get pending restaurants
router.get(
    "/restaurants/pending",
    getPendingRestaurants
);

// Get all restaurants
router.get(
    "/restaurants",
    getAllRestaurants
);

// Approve restaurant
router.patch(
    "/restaurants/:id/approve",
    approveRestaurant
);

// Reject restaurant
router.patch(
    "/restaurants/:id/reject",
    rejectRestaurant
);

// Activate / deactivate restaurant
router.patch(
    "/restaurants/:id/status",
    toggleRestaurantStatus
);

// =====================================================
// USER MANAGEMENT
// =====================================================

// Get all users
router.get(
    "/users",
    getAllUsers
);

// Activate / deactivate user
router.patch(
    "/users/:id/status",
    toggleUserStatus
);

module.exports = router;