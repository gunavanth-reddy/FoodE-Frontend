const mongoose = require("mongoose");

const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");
const Category = require("../models/Category");
const {
  uploadToCloudinary,
} = require("../utils/cloudinaryUpload");

// =====================================================
// HELPERS
// =====================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getOwnerRestaurant = async (userId) => {
  return Restaurant.findOne({
    owner: userId,
    isActive: true,
  });
};

const getFoodPrice = (food) => {
  if (
    food.discountedPrice !== null &&
    food.discountedPrice !== undefined
  ) {
    return food.discountedPrice;
  }

  return food.price;
};

// =====================================================
// CREATE FOOD
// =====================================================

const createFood = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountedPrice,
      category,
      preparationTime,
      foodType,
      isVegetarian,
    } = req.body;

    if (Object.prototype.hasOwnProperty.call(req.body, "image")) {
      return res.status(400).json({
        success: false,
        message: "Food images must be uploaded as an image file",
      });
    }

    // =================================================
    // VALIDATION
    // =================================================

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Food name is required",
      });
    }

    if (
      price === undefined ||
      price === null ||
      price === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Food price is required",
      });
    }

    const numericPrice = Number(price);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Food price must be a valid positive number",
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Food category is required",
      });
    }

    if (!isValidObjectId(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // =================================================
    // FOOD TYPE
    // =================================================

    if (
      foodType !== undefined &&
      foodType !== "veg" &&
      foodType !== "non-veg"
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Food type must be either "veg" or "non-veg"',
      });
    }

    // =================================================
    // FIND OWNER RESTAURANT
    // =================================================

    const restaurant =
      await Restaurant.findOne({
        owner: req.user._id,
        isActive: true,
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message:
          "Active restaurant not found for this owner",
      });
    }

    // =================================================
    // CHECK CATEGORY
    // =================================================

    const categoryExists =
      await Category.findOne({
        _id: category,
        restaurant: restaurant._id,
        isActive: true,
      });

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message:
          "Category not found or inactive",
      });
    }

    // =================================================
    // DISCOUNTED PRICE
    // =================================================

    let finalDiscountedPrice = null;

    if (
      discountedPrice !== undefined &&
      discountedPrice !== null &&
      discountedPrice !== ""
    ) {
      finalDiscountedPrice =
        Number(discountedPrice);

      if (
        !Number.isFinite(
          finalDiscountedPrice
        ) ||
        finalDiscountedPrice < 0 ||
        finalDiscountedPrice > numericPrice
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Discounted price must be between 0 and original price",
        });
      }
    }

    // =================================================
    // PREPARATION TIME
    // =================================================

    const finalPreparationTime =
      preparationTime !== undefined &&
      preparationTime !== ""
        ? Number(preparationTime)
        : 20;

    if (
      !Number.isFinite(
        finalPreparationTime
      ) ||
      finalPreparationTime < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Preparation time cannot be negative",
      });
    }

    // =================================================
    // FOOD TYPE
    // =================================================

    const finalFoodType =
      foodType === "veg" ||
      foodType === "non-veg"
        ? foodType
        : Boolean(isVegetarian)
        ? "veg"
        : "non-veg";

    // =================================================
    // CLOUDINARY IMAGE
    // =================================================

    let finalImage = "";

    if (req.file) {
      const uploadedImage =
        await uploadToCloudinary(
          req.file.buffer,
          "foode/foods"
        );

      if (!uploadedImage?.url) {
        return res.status(500).json({
          success: false,
          message:
            "Food image upload failed",
        });
      }

      finalImage = uploadedImage.url;
    }

    // =================================================
    // CREATE FOOD
    // =================================================

    const food = await Food.create({
      restaurant: restaurant._id,
      category: categoryExists._id,

      name: name.trim(),

      description: description
        ? description.trim()
        : "",

      image: finalImage,

      price: numericPrice,

      discountedPrice:
        finalDiscountedPrice,

      isAvailable: true,

      preparationTime:
        finalPreparationTime,

      foodType:
        finalFoodType,

      isVegetarian:
        finalFoodType === "veg",
    });

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,
      message:
        "Food item added successfully",
      food,
    });
  } catch (error) {
    console.error(
      "Create Food Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while adding food",
    });
  }
};

// =====================================================
// GET MY RESTAURANT FOODS
// =====================================================

const getMyFoods = async (req, res) => {
  try {
    const restaurant =
      await Restaurant.findOne({
        owner: req.user._id,
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const foods =
      await Food.find({
        restaurant: restaurant._id,
      })
        .populate(
          "category",
          "name image isActive"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    console.error(
      "Get My Foods Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching foods",
    });
  }
};

// =====================================================
// UPDATE FOOD
// =====================================================

const updateFood = async (req, res) => {
  try {
    const restaurant =
      await Restaurant.findOne({
        owner: req.user._id,
        isActive: true,
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid food ID",
      });
    }

    const food =
      await Food.findOne({
        _id: req.params.id,
        restaurant: restaurant._id,
      });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    const {
      name,
      description,
      price,
      discountedPrice,
      category,
      preparationTime,
      foodType,
      isVegetarian,
    } = req.body;

    if (Object.prototype.hasOwnProperty.call(req.body, "image")) {
      return res.status(400).json({
        success: false,
        message: "Food images must be uploaded as an image file",
      });
    }

    // =================================================
    // NAME
    // =================================================

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        !name.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Food name cannot be empty",
        });
      }

      food.name = name.trim();
    }

    // =================================================
    // DESCRIPTION
    // =================================================

    if (description !== undefined) {
      food.description =
        typeof description === "string"
          ? description.trim()
          : "";
    }

    // =================================================
    // IMAGE
    // =================================================

    if (req.file) {
      const uploadedImage =
        await uploadToCloudinary(
          req.file.buffer,
          "foode/foods"
        );

      if (!uploadedImage?.url) {
        return res.status(500).json({
          success: false,
          message:
            "Food image upload failed",
        });
      }

      food.image =
        uploadedImage.url;
    }

    // =================================================
    // PRICE
    // =================================================

    if (
      price !== undefined &&
      price !== ""
    ) {
      const numericPrice =
        Number(price);

      if (
        !Number.isFinite(
          numericPrice
        ) ||
        numericPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Price must be a valid positive number",
        });
      }

      food.price = numericPrice;
    }

    // =================================================
    // CATEGORY
    // =================================================

    if (category !== undefined) {
      if (!isValidObjectId(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      const categoryExists =
        await Category.findOne({
          _id: category,
          restaurant: restaurant._id,
          isActive: true,
        });

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message:
            "Category not found or inactive",
        });
      }

      food.category =
        categoryExists._id;
    }

    // =================================================
    // DISCOUNTED PRICE
    // =================================================

    if (
      discountedPrice !== undefined
    ) {
      if (
        discountedPrice === null ||
        discountedPrice === ""
      ) {
        food.discountedPrice = null;
      } else {
        const numericDiscount =
          Number(discountedPrice);

        if (
          !Number.isFinite(
            numericDiscount
          ) ||
          numericDiscount < 0 ||
          numericDiscount > food.price
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Discounted price must be between 0 and original price",
          });
        }

        food.discountedPrice =
          numericDiscount;
      }
    }

    // =================================================
    // PREPARATION TIME
    // =================================================

    if (
      preparationTime !== undefined &&
      preparationTime !== ""
    ) {
      const numericPreparationTime =
        Number(preparationTime);

      if (
        !Number.isFinite(
          numericPreparationTime
        ) ||
        numericPreparationTime < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Preparation time cannot be negative",
        });
      }

      food.preparationTime =
        numericPreparationTime;
    }

    // =================================================
    // FOOD TYPE
    // =================================================

    if (foodType !== undefined) {
      if (
        foodType !== "veg" &&
        foodType !== "non-veg"
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Food type must be either "veg" or "non-veg"',
        });
      }

      food.foodType =
        foodType;

      food.isVegetarian =
        foodType === "veg";
    } else if (
      isVegetarian !== undefined
    ) {
      food.isVegetarian =
        Boolean(isVegetarian);

      food.foodType =
        Boolean(isVegetarian)
          ? "veg"
          : "non-veg";
    }

    // =================================================
    // FINAL PRICE VALIDATION
    // =================================================

    if (
      food.discountedPrice !== null &&
      food.discountedPrice >
        food.price
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Discounted price cannot be greater than food price",
      });
    }

    // =================================================
    // SAVE
    // =================================================

    await food.save();

    return res.status(200).json({
      success: true,
      message:
        "Food item updated successfully",
      food,
    });
  } catch (error) {
    console.error(
      "Update Food Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating food",
    });
  }
};

// =====================================================
// TOGGLE FOOD AVAILABILITY
// =====================================================

const toggleFoodAvailability =
  async (req, res) => {
    try {
      const restaurant =
        await Restaurant.findOne({
          owner: req.user._id,
          isActive: true,
        });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message:
            "Restaurant not found",
        });
      }

      if (
        !isValidObjectId(req.params.id)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid food ID",
        });
      }

      const food =
        await Food.findOne({
          _id: req.params.id,
          restaurant: restaurant._id,
        });

      if (!food) {
        return res.status(404).json({
          success: false,
          message:
            "Food item not found",
        });
      }

      food.isAvailable =
        !food.isAvailable;

      await food.save();

      return res.status(200).json({
        success: true,
        message: food.isAvailable
          ? "Food is now available"
          : "Food is now unavailable",
        food,
      });
    } catch (error) {
      console.error(
        "Toggle Food Availability Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while updating food availability",
      });
    }
  };

// =====================================================
// DELETE FOOD
// =====================================================

const deleteFood = async (req, res) => {
  try {
    const restaurant =
      await Restaurant.findOne({
        owner: req.user._id,
        isActive: true,
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    if (
      !isValidObjectId(req.params.id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid food ID",
      });
    }

    const food =
      await Food.findOne({
        _id: req.params.id,
        restaurant: restaurant._id,
      });

    if (!food) {
      return res.status(404).json({
        success: false,
        message:
          "Food item not found",
      });
    }

    await Food.deleteOne({
      _id: food._id,
    });

    return res.status(200).json({
      success: true,
      message:
        "Food item deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Food Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while deleting food",
    });
  }
};

// =====================================================
// GET ALL PUBLIC FOODS
// =====================================================

const getAllPublicFoods =
  async (req, res) => {
    try {
      const foods =
        await Food.find({
          isAvailable: true,
        })
          .populate(
            "category",
            "name image isActive"
          )
          .populate(
            "restaurant",
            "name logo coverImage isActive isOpen deliveryFee deliveryTime"
          )
          .sort({
            rating: -1,
            createdAt: -1,
          });

      // =================================================
      // ONLY ACTIVE RESTAURANTS
      // =================================================

      const activeFoods =
        foods.filter(
          (food) =>
            food.restaurant &&
            food.restaurant.isActive
        );

      return res.status(200).json({
        success: true,
        count: activeFoods.length,
        foods: activeFoods,
      });
    } catch (error) {
      console.error(
        "Get All Public Foods Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while fetching all foods",
      });
    }
  };

// =====================================================
// GET PUBLIC FOODS FOR RESTAURANT
// =====================================================

const getRestaurantFoods =
  async (req, res) => {
    try {
      if (
        !isValidObjectId(
          req.params.restaurantId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid restaurant ID",
        });
      }

      // =================================================
      // FIND ACTIVE RESTAURANT
      // =================================================

      const restaurant =
        await Restaurant.findOne({
          _id: req.params.restaurantId,
          isActive: true,
        });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message:
            "Restaurant not found",
        });
      }

      // =================================================
      // GET AVAILABLE FOODS
      // =================================================

      const foods =
        await Food.find({
          restaurant:
            restaurant._id,
          isAvailable: true,
        })
          .populate(
            "category",
            "name image isActive"
          )
          .sort({
            createdAt: 1,
          });

      return res.status(200).json({
        success: true,
        count: foods.length,
        foods,
      });
    } catch (error) {
      console.error(
        "Get Restaurant Foods Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while fetching restaurant foods",
      });
    }
  };

// =====================================================
// SEARCH PUBLIC FOODS
// =====================================================

const searchFoods = async (
  req,
  res
) => {
  try {
    const query =
      req.query.q?.trim();

    if (!query) {
      return res.status(400).json({
        success: false,
        message:
          "Search query is required",
      });
    }

    // =================================================
    // SEARCH AVAILABLE FOODS
    // =================================================

    const foods =
      await Food.find({
        isAvailable: true,

        $or: [
          {
            name: {
              $regex: query,
              $options: "i",
            },
          },
          {
            description: {
              $regex: query,
              $options: "i",
            },
          },
        ],
      })
        .populate(
          "category",
          "name image isActive"
        )
        .populate(
          "restaurant",
          "name logo coverImage isActive isOpen deliveryFee deliveryTime"
        )
        .sort({
          rating: -1,
          createdAt: -1,
        });

    // =================================================
    // ONLY ACTIVE RESTAURANTS
    // =================================================

    const activeFoods =
      foods.filter(
        (food) =>
          food.restaurant &&
          food.restaurant.isActive
      );

    return res.status(200).json({
      success: true,
      count: activeFoods.length,
      foods: activeFoods,
    });
  } catch (error) {
    console.error(
      "Search Foods Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while searching foods",
    });
  }
};

// =====================================================
// GET PUBLIC FOODS BY CATEGORY
// =====================================================

const getFoodsByCategory =
  async (req, res) => {
    try {
      const categoryName =
        req.params.categoryName?.trim();

      // =================================================
      // VALIDATE CATEGORY
      // =================================================

      if (!categoryName) {
        return res.status(400).json({
          success: false,
          message:
            "Category name is required",
        });
      }

      // =================================================
      // SEE ALL
      // =================================================

      if (
        categoryName.toLowerCase() ===
        "all"
      ) {
        const foods =
          await Food.find({
            isAvailable: true,
          })
            .populate(
              "category",
              "name image isActive"
            )
            .populate(
              "restaurant",
              "name logo coverImage isActive isOpen deliveryFee deliveryTime"
            )
            .sort({
              createdAt: -1,
            });

        const activeFoods =
          foods.filter(
            (food) =>
              food.restaurant &&
              food.restaurant.isActive
          );

        return res.status(200).json({
          success: true,
          count: activeFoods.length,
          category: "All",
          foods: activeFoods,
        });
      }

      // =================================================
      // FIND ACTIVE CATEGORIES
      // =================================================

      const categories =
        await Category.find({
          name: {
            $regex: `^${categoryName}$`,
            $options: "i",
          },
          isActive: true,
        }).select(
          "_id name restaurant"
        );

      if (!categories.length) {
        return res.status(200).json({
          success: true,
          count: 0,
          category: categoryName,
          foods: [],
        });
      }

      // =================================================
      // CATEGORY IDS
      // =================================================

      const categoryIds =
        categories.map(
          (category) =>
            category._id
        );

      // =================================================
      // FIND AVAILABLE FOODS
      // =================================================

      const foods =
        await Food.find({
          category: {
            $in: categoryIds,
          },
          isAvailable: true,
        })
          .populate(
            "category",
            "name image isActive"
          )
          .populate(
            "restaurant",
            "name logo coverImage isActive isOpen deliveryFee deliveryTime"
          )
          .sort({
            createdAt: -1,
          });

      // =================================================
      // ONLY ACTIVE RESTAURANTS
      // =================================================

      const activeFoods =
        foods.filter(
          (food) =>
            food.restaurant &&
            food.restaurant.isActive
        );

      return res.status(200).json({
        success: true,
        count: activeFoods.length,
        category: categoryName,
        foods: activeFoods,
      });
    } catch (error) {
      console.error(
        "Get Foods By Category Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while fetching category foods",
      });
    }
  };

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createFood,
  getMyFoods,
  updateFood,
  toggleFoodAvailability,
  deleteFood,
  getAllPublicFoods,
  getRestaurantFoods,
  searchFoods,
  getFoodsByCategory,
};
