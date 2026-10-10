const express = require("express");

const {
  createReview,
  getRestaurantReviews,
  getFoodReviews,
  getMyReviews,
  respondToReview,
} = require("../controllers/reviewController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// CUSTOMER
// =====================================================

// Create review
// POST /api/reviews
router.post(
  "/",
  protect,
  authorize("user"),
  createReview
);

// Get restaurant reviews
// GET /api/reviews/restaurant/:restaurantId
router.get(
  "/restaurant/:restaurantId",
  getRestaurantReviews
);

// Get food reviews
// GET /api/reviews/food/:foodId
router.get(
  "/food/:foodId",
  getFoodReviews
);

// =====================================================
// RESTAURANT OWNER
// =====================================================

// Get reviews for owner's restaurant
// GET /api/reviews/my
router.get(
  "/my",
  protect,
  authorize("restaurant_owner"),
  getMyReviews
);

// Respond to a review
// PATCH /api/reviews/:reviewId/response
router.patch(
  "/:reviewId/response",
  protect,
  authorize("restaurant_owner"),
  respondToReview
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;