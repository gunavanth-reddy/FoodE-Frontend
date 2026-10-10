const mongoose = require("mongoose");

const Review = require("../models/Review");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const Food = require("../models/Food");

// =====================================================
// CREATE REVIEW
// =====================================================

const createReview = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      orderId,
      restaurantId,
      foodId,
      rating,
      comment,
    } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!orderId || !restaurantId || !rating) {
      return res.status(400).json({
        success: false,
        message:
          "Order, restaurant and rating are required",
      });
    }

    if (
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rating must be between 1 and 5",
      });
    }

    // ==========================================
    // FIND ORDER
    // ==========================================

    const order =
      await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ==========================================
    // VERIFY ORDER OWNER
    // ==========================================

    if (
      order.user.toString() !==
      userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot review this order",
      });
    }

    // ==========================================
    // ONLY DELIVERED ORDERS
    // ==========================================

    if (
      order.status !== "DELIVERED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You can review only delivered orders",
      });
    }

    // ==========================================
    // VERIFY RESTAURANT
    // ==========================================

    if (
      order.restaurant.toString() !==
      restaurantId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant does not belong to this order",
      });
    }

    // ==========================================
    // VERIFY FOOD
    // ==========================================

    if (foodId) {
      const orderedFood =
        order.items.some(
          (item) =>
            item.food.toString() ===
            foodId.toString()
        );

      if (!orderedFood) {
        return res.status(400).json({
          success: false,
          message:
            "You can review only food items from this order",
        });
      }
    }

    // ==========================================
    // CHECK DUPLICATE REVIEW
    // ==========================================

    const existingReview =
      await Review.findOne({
        user: userId,
        order: orderId,
        restaurant: restaurantId,
        food: foodId || null,
      });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message:
          "You have already reviewed this item",
      });
    }

    // ==========================================
    // CREATE REVIEW
    // ==========================================

    const review =
      await Review.create({
        user: userId,
        order: orderId,
        restaurant: restaurantId,
        food: foodId || null,
        rating: Number(rating),
        comment: comment || "",
      });

    // ==========================================
    // UPDATE RESTAURANT RATING
    // ==========================================

    await updateRestaurantRating(
      restaurantId
    );

    // ==========================================
    // UPDATE FOOD RATING
    // ==========================================

    if (foodId) {
      await updateFoodRating(foodId);
    }

    // ==========================================
    // RETURN POPULATED REVIEW
    // ==========================================

    const populatedReview =
      await Review.findById(
        review._id
      )
        .populate(
          "user",
          "name profileImage"
        )
        .populate(
          "restaurant",
          "name image rating totalReviews"
        )
        .populate(
          "food",
          "name image price rating totalReviews"
        )
        .populate(
          "order",
          "orderNumber"
        );

    return res.status(201).json({
      success: true,
      message:
        "Review submitted successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.error(
      "Create Review Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create review",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE RESTAURANT RATING
// =====================================================

const updateRestaurantRating = async (
  restaurantId
) => {
  const result =
    await Review.aggregate([
      {
        $match: {
          restaurant:
            new mongoose.Types.ObjectId(
              restaurantId
            ),

          // Only restaurant reviews
          food: null,

          // Only visible reviews
          isVisible: true,
        },
      },

      {
        $group: {
          _id: "$restaurant",

          averageRating: {
            $avg: "$rating",
          },

          totalReviews: {
            $sum: 1,
          },
        },
      },
    ]);

  if (result.length === 0) {
    await Restaurant.findByIdAndUpdate(
      restaurantId,
      {
        rating: 0,
        totalReviews: 0,
      }
    );

    return;
  }

  await Restaurant.findByIdAndUpdate(
    restaurantId,
    {
      rating: Number(
        result[0].averageRating.toFixed(1)
      ),

      totalReviews:
        result[0].totalReviews,
    }
  );
};

// =====================================================
// UPDATE FOOD RATING
// =====================================================

const updateFoodRating = async (
  foodId
) => {
  const result =
    await Review.aggregate([
      {
        $match: {
          food:
            new mongoose.Types.ObjectId(
              foodId
            ),

          isVisible: true,
        },
      },

      {
        $group: {
          _id: "$food",

          averageRating: {
            $avg: "$rating",
          },

          totalReviews: {
            $sum: 1,
          },
        },
      },
    ]);

  if (result.length === 0) {
    await Food.findByIdAndUpdate(
      foodId,
      {
        rating: 0,
        totalReviews: 0,
      }
    );

    return;
  }

  await Food.findByIdAndUpdate(
    foodId,
    {
      rating: Number(
        result[0].averageRating.toFixed(1)
      ),

      totalReviews:
        result[0].totalReviews,
    }
  );
};

// =====================================================
// GET RESTAURANT REVIEWS
// =====================================================

const getRestaurantReviews = async (
  req,
  res
) => {
  try {
    const { restaurantId } =
      req.params;

    const reviews =
      await Review.find({
        restaurant: restaurantId,
        food: null,
        isVisible: true,
      })
        .populate(
          "user",
          "name profileImage"
        )
        .populate(
          "restaurant",
          "name image rating totalReviews"
        )
        .populate(
          "order",
          "orderNumber"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error(
      "Get Restaurant Reviews Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch restaurant reviews",
      error: error.message,
    });
  }
};

// =====================================================
// GET FOOD REVIEWS
// =====================================================

const getFoodReviews = async (
  req,
  res
) => {
  try {
    const { foodId } =
      req.params;

    const reviews =
      await Review.find({
        food: foodId,
        isVisible: true,
      })
        .populate(
          "user",
          "name profileImage"
        )
        .populate(
          "restaurant",
          "name image"
        )
        .populate(
          "food",
          "name image price rating totalReviews"
        )
        .populate(
          "order",
          "orderNumber"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error(
      "Get Food Reviews Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch food reviews",
      error: error.message,
    });
  }
};

// =====================================================
// GET OWNER REVIEWS
// =====================================================

const getMyReviews = async (
  req,
  res
) => {
  try {
    console.log(
      "========== GET MY REVIEWS =========="
    );

    console.log(
      "Owner ID:",
      req.user._id
    );

    console.log(
      "Owner role:",
      req.user.role
    );

    // ==========================================
    // FIND OWNER'S RESTAURANT
    // ==========================================

    const restaurant =
      await Restaurant.findOne({
        owner: req.user._id,
      });

    console.log(
      "Restaurant found:",
      restaurant
        ? {
            id: restaurant._id,
            name: restaurant.name,
            owner: restaurant.owner,
          }
        : null
    );

    if (!restaurant) {
      console.log(
        "No restaurant found for owner:",
        req.user._id
      );

      return res.status(404).json({
        success: false,
        message:
          "Restaurant not found for this owner",
      });
    }

    // ==========================================
    // GET ALL REVIEWS
    // ==========================================

    const reviews =
      await Review.find({
        restaurant: restaurant._id,
        isVisible: true,
      })
        .populate(
          "user",
          "name profileImage"
        )
        .populate(
          "restaurant",
          "name image rating totalReviews"
        )
        .populate(
          "food",
          "name image price rating totalReviews"
        )
        .populate(
          "order",
          "orderNumber"
        )
        .sort({
          createdAt: -1,
        });

    console.log(
      "Restaurant ID:",
      restaurant._id
    );

    console.log(
      "Reviews found:",
      reviews.length
    );

    console.log(
      "Reviews:",
      reviews
    );

    // ==========================================
    // RETURN RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        image: restaurant.image,
        rating: restaurant.rating,
        totalReviews:
          restaurant.totalReviews,
      },

      reviews,
    });
  } catch (error) {
    console.error(
      "========== GET MY REVIEWS ERROR =========="
    );

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch owner reviews",
      error: error.message,
    });
  }
};

// =====================================================
// RESPOND TO REVIEW
// =====================================================

const respondToReview = async (
  req,
  res
) => {
  try {
    const ownerId = req.user._id;

    const { reviewId } =
      req.params;

    const { response } =
      req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (
      !response ||
      !response.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Response cannot be empty",
      });
    }

    if (response.length > 500) {
      return res.status(400).json({
        success: false,
        message:
          "Response cannot exceed 500 characters",
      });
    }

    // ==========================================
    // FIND REVIEW
    // ==========================================

    const review =
      await Review.findById(
        reviewId
      );

    if (!review) {
      return res.status(404).json({
        success: false,
        message:
          "Review not found",
      });
    }

    // ==========================================
    // VERIFY OWNER
    // ==========================================

    const restaurant =
      await Restaurant.findOne({
        _id: review.restaurant,
        owner: ownerId,
      });

    if (!restaurant) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to respond to this review",
      });
    }

    // ==========================================
    // UPDATE RESPONSE
    // ==========================================

    review.response =
      response.trim();

    await review.save();

    // ==========================================
    // RETURN UPDATED REVIEW
    // ==========================================

    const updatedReview =
      await Review.findById(
        review._id
      )
        .populate(
          "user",
          "name profileImage"
        )
        .populate(
          "restaurant",
          "name image rating totalReviews"
        )
        .populate(
          "food",
          "name image price rating totalReviews"
        )
        .populate(
          "order",
          "orderNumber"
        );

    return res.status(200).json({
      success: true,

      message:
        "Response added successfully",

      review: updatedReview,
    });
  } catch (error) {
    console.error(
      "Respond To Review Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to respond to review",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createReview,
  getRestaurantReviews,
  getFoodReviews,
  getMyReviews,
  respondToReview,
};