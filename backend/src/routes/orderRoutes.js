// =====================================================
// ORDER ROUTES
// =====================================================

const express = require("express");

const router = express.Router();

// =====================================================
// CONTROLLERS
// =====================================================

const {
  createOrder,
  getMyOrders,
  getOrderById,
  getRestaurantOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

// =====================================================
// MIDDLEWARE
// =====================================================

const protect = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

// =====================================================
// CUSTOMER
// =====================================================

// Create order
router.post(
  "/",
  protect,
  authorize("user"),
  createOrder
);

// Get customer's orders
router.get(
  "/my",
  protect,
  authorize("user"),
  getMyOrders
);

// Get one customer's order
router.get(
  "/:id",
  protect,
  authorize("user"),
  getOrderById
);

// =====================================================
// RESTAURANT OWNER
// =====================================================

// Get restaurant owner's orders
router.get(
  "/restaurant/my",
  protect,
  authorize("restaurant_owner"),
  getRestaurantOrders
);

// Update restaurant order status
router.patch(
  "/restaurant/:id/status",
  protect,
  authorize("restaurant_owner"),
  updateOrderStatus
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;