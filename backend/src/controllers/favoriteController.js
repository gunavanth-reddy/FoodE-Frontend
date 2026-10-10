const Favorite = require("../models/Favorite");
const Restaurant = require("../models/Restaurant");
const Food = require("../models/Food");


// =====================================================
// ADD RESTAURANT TO FAVORITES
// =====================================================

const addRestaurantFavorite = async (req, res) => {
  try {
    const {restaurantId} = req.body;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID is required",
      });
    }

    const restaurant =
      await Restaurant.findOne({
        _id: restaurantId,
        isApproved: true,
        isActive: true,
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const existingFavorite =
      await Favorite.findOne({
        user: req.user._id,
        restaurant: restaurantId,
      });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant is already in favorites",
      });
    }

    const favorite =
      await Favorite.create({
        user: req.user._id,
        restaurant: restaurantId,
      });

    return res.status(201).json({
      success: true,
      message:
        "Restaurant added to favorites",
      favorite,
    });

  } catch (error) {
    console.error(
      "Add Restaurant Favorite Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while adding restaurant to favorites",
    });
  }
};


// =====================================================
// REMOVE RESTAURANT FROM FAVORITES
// =====================================================

const removeRestaurantFavorite = async (
  req,
  res
) => {
  try {
    const favorite =
      await Favorite.findOneAndDelete({
        user: req.user._id,
        restaurant: req.params.restaurantId,
      });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message:
          "Restaurant is not in favorites",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Restaurant removed from favorites",
    });

  } catch (error) {
    console.error(
      "Remove Restaurant Favorite Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while removing restaurant from favorites",
    });
  }
};


// =====================================================
// ADD FOOD TO FAVORITES
// =====================================================

const addFoodFavorite = async (req, res) => {
  try {
    const {foodId} = req.body;

    if (!foodId) {
      return res.status(400).json({
        success: false,
        message: "Food ID is required",
      });
    }

    const food =
      await Food.findById(foodId);

    if (!food) {
      return res.status(404).json({
        success: false,
        message:
          "Food item not found",
      });
    }

    const existingFavorite =
      await Favorite.findOne({
        user: req.user._id,
        food: foodId,
      });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message:
          "Food is already in favorites",
      });
    }

    const favorite =
      await Favorite.create({
        user: req.user._id,
        food: foodId,
      });

    return res.status(201).json({
      success: true,
      message:
        "Food added to favorites",
      favorite,
    });

  } catch (error) {
    console.error(
      "Add Food Favorite Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while adding food to favorites",
    });
  }
};


// =====================================================
// REMOVE FOOD FROM FAVORITES
// =====================================================

const removeFoodFavorite = async (
  req,
  res
) => {
  try {
    const favorite =
      await Favorite.findOneAndDelete({
        user: req.user._id,
        food: req.params.foodId,
      });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message:
          "Food is not in favorites",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Food removed from favorites",
    });

  } catch (error) {
    console.error(
      "Remove Food Favorite Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while removing food from favorites",
    });
  }
};


// =====================================================
// GET ALL FAVORITES
// =====================================================

const getFavorites = async (req, res) => {
  try {
    const favorites =
      await Favorite.find({
        user: req.user._id,
      })
        .populate(
          "restaurant",
          "name logo coverImage rating totalReviews deliveryTime deliveryFee isOpen"
        )
        .populate(
          "food",
          "name image description price discountedPrice isAvailable"
        )
        .sort({
          createdAt: -1,
        });

    const restaurants = [];
    const foods = [];

    favorites.forEach((favorite) => {
      if (favorite.restaurant) {
        restaurants.push(
          favorite.restaurant
        );
      }

      if (favorite.food) {
        foods.push(favorite.food);
      }
    });

    return res.status(200).json({
      success: true,
      count: favorites.length,
      favorites,
      restaurants,
      foods,
    });

  } catch (error) {
    console.error(
      "Get Favorites Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching favorites",
    });
  }
};


// =====================================================
// CHECK RESTAURANT FAVORITE
// =====================================================

const checkRestaurantFavorite = async (
  req,
  res
) => {
  try {
    const favorite =
      await Favorite.exists({
        user: req.user._id,
        restaurant:
          req.params.restaurantId,
      });

    return res.status(200).json({
      success: true,
      isFavorite: !!favorite,
    });

  } catch (error) {
    console.error(
      "Check Restaurant Favorite Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while checking favorite",
    });
  }
};


// =====================================================
// CHECK FOOD FAVORITE
// =====================================================

const checkFoodFavorite = async (
  req,
  res
) => {
  try {
    const favorite =
      await Favorite.exists({
        user: req.user._id,
        food: req.params.foodId,
      });

    return res.status(200).json({
      success: true,
      isFavorite: !!favorite,
    });

  } catch (error) {
    console.error(
      "Check Food Favorite Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while checking favorite",
    });
  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  addRestaurantFavorite,
  removeRestaurantFavorite,
  addFoodFavorite,
  removeFoodFavorite,
  getFavorites,
  checkRestaurantFavorite,
  checkFoodFavorite,
};