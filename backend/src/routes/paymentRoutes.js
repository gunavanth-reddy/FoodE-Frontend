const express = require("express");

const router = express.Router();

const {
  createPayment,
  getPaymentByOrder,
  markCODAsPaid,
  refundPayment,
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");


// =====================================================
// CUSTOMER
// =====================================================

// Create payment for an order
router.post(
  "/",
  protect,
  authorize("user"),
  createPayment
);


// Get payment for an order
router.get(
  "/order/:orderId",
  protect,
  authorize("user"),
  getPaymentByOrder
);


// =====================================================
// ADMIN
// =====================================================

// Refund payment
router.patch(
  "/order/:orderId/refund",
  protect,
  authorize("admin"),
  refundPayment
);


// =====================================================
// RESTAURANT OWNER
// =====================================================

// Mark COD payment as collected
router.patch(
  "/order/:orderId/cod-paid",
  protect,
  authorize("restaurant_owner"),
  markCODAsPaid
);


module.exports = router;