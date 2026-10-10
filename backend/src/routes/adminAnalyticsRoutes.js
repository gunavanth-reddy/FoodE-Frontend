const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  getOverview,
  getRestaurantAnalytics,
  getSingleRestaurantAnalytics,
} = require("../controllers/adminAnalyticsController");

// =====================================================
// ADMIN ANALYTICS
// =====================================================

// Overall dashboard
// GET /api/admin/analytics/overview
router.get(
  "/overview",
  protect,
  authorize("admin"),
  getOverview
);

// Every restaurant
// GET /api/admin/analytics/restaurants
router.get(
  "/restaurants",
  protect,
  authorize("admin"),
  getRestaurantAnalytics
);

// One restaurant
// GET /api/admin/analytics/restaurant/:restaurantId
router.get(
  "/restaurant/:restaurantId",
  protect,
  authorize("admin"),
  getSingleRestaurantAnalytics
);

module.exports = router;