const express = require("express");

const router = express.Router();

const {
  addRestaurantFavorite,
  removeRestaurantFavorite,
  addFoodFavorite,
  removeFoodFavorite,
  getFavorites,
  checkRestaurantFavorite,
  checkFoodFavorite,
} = require("../controllers/favoriteController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");


// =====================================================
// ALL FAVORITE ROUTES REQUIRE CUSTOMER LOGIN
// =====================================================


// Get all favorites
router.get(
  "/",
  protect,
  authorize("user"),
  getFavorites
);


// =====================================================
// RESTAURANT FAVORITES
// =====================================================

// Add restaurant
router.post(
  "/restaurant",
  protect,
  authorize("user"),
  addRestaurantFavorite
);


// Remove restaurant
router.delete(
  "/restaurant/:restaurantId",
  protect,
  authorize("user"),
  removeRestaurantFavorite
);


// Check restaurant favorite
router.get(
  "/restaurant/:restaurantId/check",
  protect,
  authorize("user"),
  checkRestaurantFavorite
);


// =====================================================
// FOOD FAVORITES
// =====================================================

// Add food
router.post(
  "/food",
  protect,
  authorize("user"),
  addFoodFavorite
);


// Remove food
router.delete(
  "/food/:foodId",
  protect,
  authorize("user"),
  removeFoodFavorite
);


// Check food favorite
router.get(
  "/food/:foodId/check",
  protect,
  authorize("user"),
  checkFoodFavorite
);


module.exports = router;