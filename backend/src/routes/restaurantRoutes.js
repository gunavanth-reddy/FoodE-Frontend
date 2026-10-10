const express = require("express");

const router = express.Router();

const {
  createRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
  updateRestaurantStatus,
  updateRestaurantDeliveryTime,
  deleteMyRestaurant,
  getRestaurantById,
  getAllRestaurants,
  getOwnerDashboardStats,
} = require("../controllers/restaurantController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

// =====================================================
// IMAGE UPLOAD
// =====================================================

const restaurantImageUpload = upload.fields([
  {
    name: "logo",
    maxCount: 1,
  },
  {
    name: "coverImage",
    maxCount: 1,
  },
]);

// =====================================================
// PUBLIC ROUTES
// =====================================================

// Get all restaurants
// GET /api/restaurants
router.get(
  "/",
  getAllRestaurants
);

// =====================================================
// OWNER ROUTES
// =====================================================

// Owner dashboard
// GET /api/restaurants/owner/dashboard
router.get(
  "/owner/dashboard",
  protect,
  authorize("restaurant_owner"),
  getOwnerDashboardStats
);

// Get owner's restaurant
// GET /api/restaurants/my
router.get(
  "/my",
  protect,
  authorize("restaurant_owner"),
  getMyRestaurant
);

// Create restaurant
// POST /api/restaurants
router.post(
  "/",
  protect,
  authorize("restaurant_owner"),
  restaurantImageUpload,
  createRestaurant
);

// Update owner's restaurant
// PUT /api/restaurants/my
router.put(
  "/my",
  protect,
  authorize("restaurant_owner"),
  restaurantImageUpload,
  updateMyRestaurant
);

// Update delivery time
// PATCH /api/restaurants/my/delivery-time
router.patch(
  "/my/delivery-time",
  protect,
  authorize("restaurant_owner"),
  updateRestaurantDeliveryTime
);

// Update restaurant status
// PATCH /api/restaurants/my/status
router.patch(
  "/my/status",
  protect,
  authorize("restaurant_owner"),
  updateRestaurantStatus
);

// Delete owner's restaurant
// DELETE /api/restaurants/my
router.delete(
  "/my",
  protect,
  authorize("restaurant_owner"),
  deleteMyRestaurant
);

// =====================================================
// PUBLIC SINGLE RESTAURANT
// =====================================================

// IMPORTANT:
// This MUST come AFTER all /my routes.
//
// GET /api/restaurants/:id
router.get(
  "/:id",
  getRestaurantById
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;