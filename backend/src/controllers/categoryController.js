const mongoose = require("mongoose");

const Category = require("../models/Category");
const Restaurant = require("../models/Restaurant");

// =====================================================
// HELPERS
// =====================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getOwnerRestaurant = async (ownerId) => {
  return Restaurant.findOne({
    owner: ownerId,
  });
};

const normalizeName = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

const normalizeDescription = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

const validateDisplayOrder = (value) => {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  const number = Number(value);

  if (!Number.isInteger(number) || number < 0) {
    return null;
  }

  return number;
};

// =====================================================
// CREATE CATEGORY
// =====================================================

const createCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      displayOrder,
    } = req.body;

    const categoryName = normalizeName(name);

    // -------------------------------------------------
    // Validate name
    // -------------------------------------------------

    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    if (categoryName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Category name must be at least 2 characters",
      });
    }

    if (categoryName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Category name cannot exceed 100 characters",
      });
    }

    // -------------------------------------------------
    // Validate description
    // -------------------------------------------------

    const categoryDescription =
      normalizeDescription(description);

    if (categoryDescription.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 500 characters",
      });
    }

    // -------------------------------------------------
    // Validate display order
    // -------------------------------------------------

    const order = validateDisplayOrder(displayOrder);

    if (order === null) {
      return res.status(400).json({
        success: false,
        message: "Display order must be a non-negative integer",
      });
    }

    // -------------------------------------------------
    // Find owner's restaurant
    // -------------------------------------------------

    const restaurant = await getOwnerRestaurant(req.user._id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message:
          "Restaurant not found. Please create your restaurant first.",
      });
    }

    if (!restaurant.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your restaurant is currently inactive",
      });
    }

    // -------------------------------------------------
    // Check duplicate category
    // -------------------------------------------------

    const existingCategory = await Category.findOne({
      restaurant: restaurant._id,
      name: categoryName,
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "This category already exists",
      });
    }

    // -------------------------------------------------
    // Create category
    // -------------------------------------------------

    const category = await Category.create({
      restaurant: restaurant._id,
      name: categoryName,
      description: categoryDescription,
      image:
        typeof image === "string"
          ? image.trim()
          : "",
      displayOrder: order,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create Category Error:", error);

    // MongoDB duplicate-key protection
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This category already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating category",
    });
  }
};

// =====================================================
// GET MY CATEGORIES
// =====================================================

const getMyCategories = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(
      req.user._id
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const categories = await Category.find({
      restaurant: restaurant._id,
    }).sort({
      displayOrder: 1,
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
    });
  }
};

// =====================================================
// UPDATE CATEGORY
// =====================================================

const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // -------------------------------------------------
    // Validate category ID
    // -------------------------------------------------

    if (!isValidObjectId(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const {
      name,
      description,
      image,
      displayOrder,
    } = req.body;

    // -------------------------------------------------
    // Find owner's restaurant
    // -------------------------------------------------

    const restaurant = await getOwnerRestaurant(
      req.user._id
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    if (!restaurant.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your restaurant is currently inactive",
      });
    }

    // -------------------------------------------------
    // Find category belonging to owner
    // -------------------------------------------------

    const category = await Category.findOne({
      _id: categoryId,
      restaurant: restaurant._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // -------------------------------------------------
    // Update name
    // -------------------------------------------------

    if (name !== undefined) {
      const categoryName = normalizeName(name);

      if (!categoryName) {
        return res.status(400).json({
          success: false,
          message: "Category name cannot be empty",
        });
      }

      if (categoryName.length < 2) {
        return res.status(400).json({
          success: false,
          message:
            "Category name must be at least 2 characters",
        });
      }

      if (categoryName.length > 100) {
        return res.status(400).json({
          success: false,
          message:
            "Category name cannot exceed 100 characters",
        });
      }

      // Check duplicate name excluding current category
      const duplicateCategory =
        await Category.findOne({
          restaurant: restaurant._id,
          name: categoryName,
          _id: { $ne: category._id },
        });

      if (duplicateCategory) {
        return res.status(400).json({
          success: false,
          message: "This category already exists",
        });
      }

      category.name = categoryName;
    }

    // -------------------------------------------------
    // Update description
    // -------------------------------------------------

    if (description !== undefined) {
      const categoryDescription =
        normalizeDescription(description);

      if (categoryDescription.length > 500) {
        return res.status(400).json({
          success: false,
          message:
            "Description cannot exceed 500 characters",
        });
      }

      category.description = categoryDescription;
    }

    // -------------------------------------------------
    // Update image
    // -------------------------------------------------

    if (image !== undefined) {
      category.image =
        typeof image === "string"
          ? image.trim()
          : "";
    }

    // -------------------------------------------------
    // Update display order
    // -------------------------------------------------

    if (displayOrder !== undefined) {
      const order =
        validateDisplayOrder(displayOrder);

      if (order === null) {
        return res.status(400).json({
          success: false,
          message:
            "Display order must be a non-negative integer",
        });
      }

      category.displayOrder = order;
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update Category Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This category already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while updating category",
    });
  }
};

// =====================================================
// TOGGLE CATEGORY STATUS
// =====================================================

const toggleCategoryStatus = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // -------------------------------------------------
    // Validate ID
    // -------------------------------------------------

    if (!isValidObjectId(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // -------------------------------------------------
    // Find owner's restaurant
    // -------------------------------------------------

    const restaurant = await getOwnerRestaurant(
      req.user._id
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    if (!restaurant.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your restaurant is currently inactive",
      });
    }

    // -------------------------------------------------
    // Find category
    // -------------------------------------------------

    const category = await Category.findOne({
      _id: categoryId,
      restaurant: restaurant._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // -------------------------------------------------
    // Toggle status
    // -------------------------------------------------

    category.isActive = !category.isActive;

    await category.save();

    return res.status(200).json({
      success: true,
      message: category.isActive
        ? "Category activated"
        : "Category deactivated",
      category,
    });
  } catch (error) {
    console.error(
      "Toggle Category Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating category status",
    });
  }
};

// =====================================================
// DELETE CATEGORY
// =====================================================

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // -------------------------------------------------
    // Validate ID
    // -------------------------------------------------

    if (!isValidObjectId(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // -------------------------------------------------
    // Find owner's restaurant
    // -------------------------------------------------

    const restaurant = await getOwnerRestaurant(
      req.user._id
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    if (!restaurant.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your restaurant is currently inactive",
      });
    }

    // -------------------------------------------------
    // Find category belonging to owner
    // -------------------------------------------------

    const category = await Category.findOne({
      _id: categoryId,
      restaurant: restaurant._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // -------------------------------------------------
    // Delete category
    // -------------------------------------------------

    await Category.deleteOne({
      _id: category._id,
      restaurant: restaurant._id,
    });

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete Category Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting category",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createCategory,
  getMyCategories,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
};