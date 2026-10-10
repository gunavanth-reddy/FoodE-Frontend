const express = require("express");

const router = express.Router();

// =====================================================
// CONTROLLER
// =====================================================

const {
  createCategory,
  getMyCategories,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
} = require("../controllers/categoryController");

// =====================================================
// MIDDLEWARE
// =====================================================

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// =====================================================
// RESTAURANT OWNER CATEGORY ROUTES
// =====================================================

// Create category
// POST /api/categories
router.post(
  "/",
  protect,
  authorize("restaurant_owner"),
  createCategory
);

// Get my categories
// GET /api/categories/my
router.get(
  "/my",
  protect,
  authorize("restaurant_owner"),
  getMyCategories
);

// Update category
// PUT /api/categories/:id
router.put(
  "/:id",
  protect,
  authorize("restaurant_owner"),
  updateCategory
);

// Enable / Disable category
// PATCH /api/categories/:id/status
router.patch(
  "/:id/status",
  protect,
  authorize("restaurant_owner"),
  toggleCategoryStatus
);

// Delete category
// DELETE /api/categories/:id
router.delete(
  "/:id",
  protect,
  authorize("restaurant_owner"),
  deleteCategory
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;