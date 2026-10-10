const Cart = require("../models/Cart");
const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");

// =====================================================
// HELPER — CALCULATE CART TOTALS
// =====================================================

const calculateTotals = (cart, restaurant) => {
  let subtotal = 0;

  cart.items.forEach((item) => {
    const itemPrice =
      item.discountedPrice !== null &&
      item.discountedPrice !== undefined
        ? item.discountedPrice
        : item.price;

    subtotal += itemPrice * item.quantity;
  });

  // ===================================================
  // SUBTOTAL
  // ===================================================

  cart.subtotal = Number(subtotal.toFixed(2));

  // ===================================================
  // DELIVERY FEE
  // ===================================================

  cart.deliveryFee = Number(
    restaurant?.deliveryFee || 0
  );

  // ===================================================
  // TOTAL
  // ===================================================

  cart.total = Number(
    (
      cart.subtotal +
      cart.deliveryFee
    ).toFixed(2)
  );
};

// =====================================================
// HELPER — POPULATE CART
// =====================================================

const populateCart = async (cartId) => {
  return Cart.findById(cartId)
    .populate(
      "restaurant",
      "name logo coverImage deliveryFee minimumOrder isOpen isActive deliveryMode deliveryTime"
    )
    .populate(
      "items.food",
      "name description image price discountedPrice isAvailable rating preparationTime foodType"
    );
};

// =====================================================
// ADD FOOD TO CART
// =====================================================

const addToCart = async (req, res) => {
  try {
    const {
      foodId,
      quantity = 1,
    } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (!foodId) {
      return res.status(400).json({
        success: false,
        message: "Food ID is required",
      });
    }

    if (
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const requestedQuantity = Number(quantity);

    // =================================================
    // FIND FOOD
    // =================================================

    const food = await Food.findById(foodId);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    // =================================================
    // FOOD AVAILABILITY
    // =================================================

    if (!food.isAvailable) {
      return res.status(400).json({
        success: false,
        message:
          "This food item is currently unavailable",
      });
    }

    // =================================================
    // FOOD MUST HAVE RESTAURANT
    // =================================================

    if (!food.restaurant) {
      return res.status(400).json({
        success: false,
        message:
          "This food item is not linked to a restaurant",
      });
    }

    // =================================================
    // FIND ACTIVE RESTAURANT
    // =================================================

    const restaurant =
      await Restaurant.findOne({
        _id: food.restaurant,
        isActive: true,
      });

    if (!restaurant) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant is currently unavailable",
      });
    }

    // =================================================
    // FIND EXISTING CART
    // =================================================

    let cart = await Cart.findOne({
      user: req.user._id,
    });

    // =================================================
    // CREATE NEW CART
    // =================================================

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        restaurant: restaurant._id,
        items: [],
      });
    }

    // =================================================
    // ONE RESTAURANT PER CART
    // =================================================

    if (
      cart.items.length > 0 &&
      cart.restaurant.toString() !==
        restaurant._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Your cart contains items from another restaurant. Please clear your cart first.",
        currentRestaurant: cart.restaurant,
        newRestaurant: restaurant._id,
      });
    }

    // Ensure restaurant is correct if cart exists
    // but contains no items.
    if (cart.items.length === 0) {
      cart.restaurant = restaurant._id;
    }

    // =================================================
    // CURRENT PRICE
    // =================================================

    const currentDiscountedPrice =
      food.discountedPrice !== null &&
      food.discountedPrice !== undefined
        ? food.discountedPrice
        : null;

    // =================================================
    // FIND EXISTING FOOD ITEM
    // =================================================

    const existingItem =
      cart.items.find(
        (item) =>
          item.food.toString() ===
          food._id.toString()
      );

    // =================================================
    // UPDATE EXISTING ITEM
    // =================================================

    if (existingItem) {
      existingItem.quantity +=
        requestedQuantity;

      existingItem.price = food.price;

      existingItem.discountedPrice =
        currentDiscountedPrice;
    }

    // =================================================
    // ADD NEW ITEM
    // =================================================

    else {
      cart.items.push({
        food: food._id,
        quantity: requestedQuantity,
        price: food.price,
        discountedPrice:
          currentDiscountedPrice,
      });
    }

    // =================================================
    // CALCULATE TOTALS
    // =================================================

    calculateTotals(
      cart,
      restaurant
    );

    // =================================================
    // SAVE
    // =================================================

    await cart.save();

    // =================================================
    // POPULATE
    // =================================================

    const populatedCart =
      await populateCart(cart._id);

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message:
        "Food added to cart successfully",
      cart: populatedCart,
    });
  } catch (error) {
    console.error(
      "Add To Cart Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while adding food to cart",
    });
  }
};

// =====================================================
// GET CART
// =====================================================

const getCart = async (req, res) => {
  try {
    const cart =
      await Cart.findOne({
        user: req.user._id,
      })
        .populate(
          "restaurant",
          "name logo coverImage deliveryFee minimumOrder isOpen isActive deliveryMode deliveryTime"
        )
        .populate(
          "items.food",
          "name description image price discountedPrice isAvailable rating preparationTime foodType"
        );

    // =================================================
    // EMPTY CART
    // =================================================

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        cart: null,
      });
    }

    // =================================================
    // FIND CURRENT RESTAURANT
    // =================================================

    const restaurant =
      await Restaurant.findOne({
        _id: cart.restaurant?._id || cart.restaurant,
        isActive: true,
      });

    if (!restaurant) {
      return res.status(200).json({
        success: true,
        message:
          "Restaurant is currently unavailable",
        cart,
      });
    }

    // =================================================
    // RECALCULATE TOTALS
    // =================================================

    calculateTotals(
      cart,
      restaurant
    );

    await cart.save();

    // =================================================
    // RETURN UPDATED CART
    // =================================================

    const updatedCart =
      await populateCart(cart._id);

    return res.status(200).json({
      success: true,
      cart: updatedCart,
    });
  } catch (error) {
    console.error(
      "Get Cart Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching cart",
    });
  }
};

// =====================================================
// UPDATE ITEM QUANTITY
// =====================================================

const updateCartItem = async (
  req,
  res
) => {
  try {
    const {
      quantity,
    } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (
      !Number.isInteger(
        Number(quantity)
      ) ||
      Number(quantity) < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be at least 1",
      });
    }

    const requestedQuantity =
      Number(quantity);

    // =================================================
    // FIND CART
    // =================================================

    const cart =
      await Cart.findOne({
        user: req.user._id,
      });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // =================================================
    // FIND ITEM
    // =================================================

    const item =
      cart.items.find(
        (cartItem) =>
          cartItem.food.toString() ===
          req.params.foodId
      );

    if (!item) {
      return res.status(404).json({
        success: false,
        message:
          "Food item not found in cart",
      });
    }

    // =================================================
    // FIND CURRENT FOOD
    // =================================================

    const food =
      await Food.findById(
        req.params.foodId
      );

    if (!food) {
      return res.status(404).json({
        success: false,
        message:
          "Food item no longer exists",
      });
    }

    // =================================================
    // FOOD AVAILABILITY
    // =================================================

    if (!food.isAvailable) {
      return res.status(400).json({
        success: false,
        message:
          "This food item is currently unavailable",
      });
    }

    // =================================================
    // VERIFY FOOD RESTAURANT
    // =================================================

    if (
      !food.restaurant ||
      food.restaurant.toString() !==
        cart.restaurant.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Food does not belong to this cart's restaurant",
      });
    }

    // =================================================
    // UPDATE ITEM
    // =================================================

    item.quantity =
      requestedQuantity;

    item.price =
      food.price;

    item.discountedPrice =
      food.discountedPrice !== null &&
      food.discountedPrice !== undefined
        ? food.discountedPrice
        : null;

    // =================================================
    // FIND RESTAURANT
    // =================================================

    const restaurant =
      await Restaurant.findOne({
        _id: cart.restaurant,
        isActive: true,
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message:
          "Restaurant is currently unavailable",
      });
    }

    // =================================================
    // RECALCULATE TOTALS
    // =================================================

    calculateTotals(
      cart,
      restaurant
    );

    // =================================================
    // SAVE
    // =================================================

    await cart.save();

    // =================================================
    // POPULATE
    // =================================================

    const populatedCart =
      await populateCart(cart._id);

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message:
        "Cart updated successfully",
      cart: populatedCart,
    });
  } catch (error) {
    console.error(
      "Update Cart Item Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating cart",
    });
  }
};

// =====================================================
// REMOVE ITEM FROM CART
// =====================================================

const removeFromCart = async (
  req,
  res
) => {
  try {
    // =================================================
    // FIND CART
    // =================================================

    const cart =
      await Cart.findOne({
        user: req.user._id,
      });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // =================================================
    // FIND ITEM
    // =================================================

    const originalLength =
      cart.items.length;

    cart.items =
      cart.items.filter(
        (item) =>
          item.food.toString() !==
          req.params.foodId
      );

    if (
      cart.items.length ===
      originalLength
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Food item not found in cart",
      });
    }

    // =================================================
    // CART EMPTY
    // =================================================

    if (
      cart.items.length === 0
    ) {
      await Cart.deleteOne({
        _id: cart._id,
      });

      return res.status(200).json({
        success: true,
        message:
          "Food removed and cart is now empty",
        cart: null,
      });
    }

    // =================================================
    // FIND RESTAURANT
    // =================================================

    const restaurant =
      await Restaurant.findOne({
        _id: cart.restaurant,
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
    // RECALCULATE TOTALS
    // =================================================

    calculateTotals(
      cart,
      restaurant
    );

    // =================================================
    // SAVE
    // =================================================

    await cart.save();

    // =================================================
    // POPULATE
    // =================================================

    const populatedCart =
      await populateCart(cart._id);

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message:
        "Food removed from cart",
      cart: populatedCart,
    });
  } catch (error) {
    console.error(
      "Remove From Cart Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while removing food",
    });
  }
};

// =====================================================
// CLEAR CART
// =====================================================

const clearCart = async (
  req,
  res
) => {
  try {
    const cart =
      await Cart.findOne({
        user: req.user._id,
      });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message:
          "Cart is already empty",
        cart: null,
      });
    }

    await Cart.deleteOne({
      _id: cart._id,
    });

    return res.status(200).json({
      success: true,
      message:
        "Cart cleared successfully",
      cart: null,
    });
  } catch (error) {
    console.error(
      "Clear Cart Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while clearing cart",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};