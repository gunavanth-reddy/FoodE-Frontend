const express = require("express");

const router = express.Router();

// =====================================================
// CONTROLLERS
// =====================================================

const {
  createFood,
  getMyFoods,
  updateFood,
  toggleFoodAvailability,
  deleteFood,
  getRestaurantFoods,
  searchFoods,
  getFoodsByCategory,
  getAllPublicFoods,
} = require("../controllers/foodController");

// =====================================================
// MIDDLEWARE
// =====================================================

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

// =====================================================
// PUBLIC FOOD ROUTES
// =====================================================

// Get all available foods
// GET /api/foods
router.get("/", getAllPublicFoods);

// Search available foods
// GET /api/foods/search?q=biryani
router.get("/search", searchFoods);

// Get available foods by category
// GET /api/foods/category/Biryani
router.get("/category/:categoryName", getFoodsByCategory);

// Get available foods of a restaurant
// GET /api/foods/restaurant/:restaurantId
router.get("/restaurant/:restaurantId", getRestaurantFoods);

// =====================================================
// RESTAURANT OWNER FOOD ROUTES
// =====================================================

// Add food with optional image upload
// POST /api/foods
router.post(
  "/",
  protect,
  authorize("restaurant_owner"),
  upload.single("image"),
  createFood
);

// Get my restaurant foods
// GET /api/foods/my
router.get(
  "/my",
  protect,
  authorize("restaurant_owner"),
  getMyFoods
);

// Update food with optional image upload
// PUT /api/foods/:id
router.put(
  "/:id",
  protect,
  authorize("restaurant_owner"),
  upload.single("image"),
  updateFood
);

// Enable / Disable food
// PATCH /api/foods/:id/availability
router.patch(
  "/:id/availability",
  protect,
  authorize("restaurant_owner"),
  toggleFoodAvailability
);

// Delete food
// DELETE /api/foods/:id
router.delete(
  "/:id",
  protect,
  authorize("restaurant_owner"),
  deleteFood
);

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;