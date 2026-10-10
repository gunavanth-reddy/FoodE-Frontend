const express = require("express");

const router = express.Router();

// =====================================================
// CONTROLLERS
// =====================================================

const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

// =====================================================
// MIDDLEWARE
// =====================================================

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// =====================================================
// CART ROUTES
// =====================================================

// Add food to cart
// POST /api/cart/add
router.post(
  "/add",
  protect,
  authorize("user"),
  addToCart
);

// Get current user's cart
// GET /api/cart
router.get(
  "/",
  protect,
  authorize("user"),
  getCart
);

// Update food quantity
// PUT /api/cart/item/:foodId
router.put(
  "/item/:foodId",
  protect,
  authorize("user"),
  updateCartItem
);

// Remove food from cart
// DELETE /api/cart/item/:foodId
router.delete(
  "/item/:foodId",
  protect,
  authorize("user"),
  removeFromCart
);

// Clear cart
// DELETE /api/cart/clear
router.delete(
  "/clear",
  protect,
  authorize("user"),
  clearCart
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;