const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");
const Category = require("../models/Category");


// =====================================================
// SEARCH FOOD
// =====================================================

const searchFood = async (req, res) => {
  try {
    const {q} = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchQuery = q.trim();

    const foods = await Food.find({
      name: {
        $regex: searchQuery,
        $options: "i",
      },
      isAvailable: true,
    })
      .populate(
        "restaurant",
        "name logo rating deliveryTime deliveryFee isOpen"
      )
      .populate(
        "category",
        "name"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: foods.length,
      results: foods,
    });

  } catch (error) {
    console.error(
      "Search Food Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while searching food",
    });
  }
};


// =====================================================
// SEARCH RESTAURANTS
// =====================================================

const searchRestaurants = async (
  req,
  res
) => {
  try {
    const {q} = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchQuery = q.trim();

    const restaurants =
      await Restaurant.find({
        isApproved: true,
        isActive: true,

        $or: [
          {
            name: {
              $regex: searchQuery,
              $options: "i",
            },
          },
          {
            description: {
              $regex: searchQuery,
              $options: "i",
            },
          },
          {
            cuisines: {
              $regex: searchQuery,
              $options: "i",
            },
          },
        ],
      })
        .sort({
          rating: -1,
        });

    return res.status(200).json({
      success: true,
      count: restaurants.length,
      results: restaurants,
    });

  } catch (error) {
    console.error(
      "Search Restaurant Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while searching restaurants",
    });
  }
};


// =====================================================
// SEARCH CATEGORIES
// =====================================================

const searchCategories = async (
  req,
  res
) => {
  try {
    const {q} = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchQuery = q.trim();

    const categories =
      await Category.find({
        name: {
          $regex: searchQuery,
          $options: "i",
        },
      })
        .sort({
          name: 1,
        });

    return res.status(200).json({
      success: true,
      count: categories.length,
      results: categories,
    });

  } catch (error) {
    console.error(
      "Search Category Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while searching categories",
    });
  }
};


// =====================================================
// GLOBAL SEARCH
// =====================================================

const globalSearch = async (req, res) => {
  try {
    const {q} = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchQuery = q.trim();

    const [foods, restaurants, categories] =
      await Promise.all([
        Food.find({
          name: {
            $regex: searchQuery,
            $options: "i",
          },
          isAvailable: true,
        })
          .populate(
            "restaurant",
            "name logo rating deliveryTime deliveryFee isOpen"
          )
          .limit(20),

        Restaurant.find({
          isApproved: true,
          isActive: true,

          $or: [
            {
              name: {
                $regex: searchQuery,
                $options: "i",
              },
            },
            {
              description: {
                $regex: searchQuery,
                $options: "i",
              },
            },
            {
              cuisines: {
                $regex: searchQuery,
                $options: "i",
              },
            },
          ],
        })
          .limit(20),

        Category.find({
          name: {
            $regex: searchQuery,
            $options: "i",
          },
        })
          .limit(20),
      ]);

    return res.status(200).json({
      success: true,

      query: searchQuery,

      results: {
        foods,
        restaurants,
        categories,
      },

      counts: {
        foods: foods.length,
        restaurants:
          restaurants.length,
        categories:
          categories.length,
      },
    });

  } catch (error) {
    console.error(
      "Global Search Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while searching",
    });
  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  searchFood,
  searchRestaurants,
  searchCategories,
  globalSearch,
};