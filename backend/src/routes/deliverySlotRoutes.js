const express = require("express");

const router = express.Router();

// =====================================================
// CONTROLLER
// =====================================================

const {
  createDeliverySlot,
  getMyDeliverySlots,
  getAvailableDeliverySlots,
  updateDeliverySlot,
  toggleDeliverySlot,
  deleteDeliverySlot,
} = require("../controllers/deliverySlotController");

// =====================================================
// MIDDLEWARE
// =====================================================

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// =====================================================
// OWNER ROUTES
// =====================================================

// Get owner's delivery slots
// GET /api/delivery-slots/my
router.get(
  "/my",
  protect,
  authorize("restaurant_owner"),
  getMyDeliverySlots
);

// Create delivery slot
// POST /api/delivery-slots
router.post(
  "/",
  protect,
  authorize("restaurant_owner"),
  createDeliverySlot
);

// Update delivery slot
// PUT /api/delivery-slots/:slotId
router.put(
  "/:slotId",
  protect,
  authorize("restaurant_owner"),
  updateDeliverySlot
);

// Enable / Disable delivery slot
// PATCH /api/delivery-slots/:slotId/toggle
router.patch(
  "/:slotId/toggle",
  protect,
  authorize("restaurant_owner"),
  toggleDeliverySlot
);

// Delete delivery slot
// DELETE /api/delivery-slots/:slotId
router.delete(
  "/:slotId",
  protect,
  authorize("restaurant_owner"),
  deleteDeliverySlot
);

// =====================================================
// CUSTOMER ROUTE
// =====================================================

// Get available delivery slots for a restaurant
// GET /api/delivery-slots/restaurant/:restaurantId
router.get(
  "/restaurant/:restaurantId",
  getAvailableDeliverySlots
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;