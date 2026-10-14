// =====================================================
// ORDER CONTROLLER — FoodE
// =====================================================

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");
const DeliverySlot = require("../models/deliverySlotModel");

const {
  notifyOrderPlaced,
  notifyNewOrder,
  notifyOrderConfirmed,
  notifyOrderDelivered,
} = require("../services/notificationService");

// =====================================================
// TIME HELPERS
// =====================================================

const timeToMinutes = (time) => {
  if (
    typeof time !== "string" ||
    !/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)
  ) {
    return null;
  }

  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const getCurrentIndiaMinutes = () => {
  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());

  const hour = Number(
    parts.find((part) => part.type === "hour")?.value || 0
  );

  const minute = Number(
    parts.find((part) => part.type === "minute")?.value || 0
  );

  return hour * 60 + minute;
};

const isSlotClosedForBooking = (slot) => {
  if (!slot || !slot.startTime) {
    return true;
  }

  const startMinutes = timeToMinutes(slot.startTime);

  if (startMinutes === null) {
    return true;
  }

  // Preserve the existing 10-minute booking cutoff.
  const cutoffMinutes = startMinutes - 10;
  const currentMinutes = getCurrentIndiaMinutes();

  if (cutoffMinutes >= 0) {
    return currentMinutes >= cutoffMinutes;
  }

  const normalizedCutoff = cutoffMinutes + 24 * 60;

  return (
    currentMinutes >= normalizedCutoff &&
    currentMinutes < startMinutes
  );
};

const findOwnerRestaurant = async (userId) => {
  return Restaurant.findOne({ owner: userId });
};

// =====================================================
// CREATE ORDER
// =====================================================

const createOrder = async (req, res) => {
  try {
    const {
      deliveryAddress,
      deliverySlot,
      paymentMethod = "COD",
      customerNote = "",
    } = req.body;

    if (
      !deliveryAddress ||
      !deliveryAddress.name ||
      !deliveryAddress.phone ||
      !deliveryAddress.addressLine ||
      !deliveryAddress.city
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete delivery address is required",
      });
    }

    if (!deliverySlot || !deliverySlot.slotId) {
      return res.status(400).json({
        success: false,
        message: "Delivery slot is required",
      });
    }

    if (!["COD", "ONLINE"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: cart.restaurant,
      isActive: true,
    });

    if (!restaurant) {
      return res.status(400).json({
        success: false,
        message: "Restaurant is not available",
      });
    }

    const selectedSlot = await DeliverySlot.findOne({
      _id: deliverySlot.slotId,
      restaurant: restaurant._id,
      isActive: true,
    });

    if (!selectedSlot) {
      return res.status(400).json({
        success: false,
        message: "Selected delivery slot is not available",
      });
    }

    if (isSlotClosedForBooking(selectedSlot)) {
      return res.status(400).json({
        success: false,
        message:
          "Selected delivery slot is closed for booking. Please choose another slot.",
      });
    }

    if (
      deliverySlot.startTime &&
      deliverySlot.startTime !== selectedSlot.startTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery slot",
      });
    }

    if (
      deliverySlot.endTime &&
      deliverySlot.endTime !== selectedSlot.endTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery slot",
      });
    }

    // Validate and calculate order items.
    const orderItems = [];

    for (const cartItem of cart.items) {
      const food = await Food.findById(cartItem.food);

      if (!food) {
        return res.status(400).json({
          success: false,
          message: "One or more food items no longer exist",
        });
      }

      if (!food.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${food.name} is currently unavailable`,
        });
      }

      if (
        !food.restaurant ||
        food.restaurant.toString() !== restaurant._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid restaurant food item",
        });
      }

      const quantity = Number(cartItem.quantity || 0);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${food.name}`,
        });
      }

      const originalPrice = Number(food.price);

      if (!Number.isFinite(originalPrice) || originalPrice < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for ${food.name}`,
        });
      }

      const discountedPrice =
        food.discountedPrice !== null &&
        food.discountedPrice !== undefined
          ? Number(food.discountedPrice)
          : null;

      if (
        discountedPrice !== null &&
        (
          !Number.isFinite(discountedPrice) ||
          discountedPrice < 0 ||
          discountedPrice > originalPrice
        )
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid discounted price for ${food.name}`,
        });
      }

      const finalPrice =
        discountedPrice !== null ? discountedPrice : originalPrice;

      const itemTotal = Number((finalPrice * quantity).toFixed(2));

      orderItems.push({
        food: food._id,
        name: food.name,
        quantity,
        price: originalPrice,
        discountedPrice,
        total: itemTotal,
      });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid food items found",
      });
    }

    const subtotal = Number(
      orderItems
        .reduce((sum, item) => sum + Number(item.total || 0), 0)
        .toFixed(2)
    );

    const deliveryFee = Number(restaurant.deliveryFee || 0);
    const discount = 0;

    const total = Number(
      (subtotal + deliveryFee - discount).toFixed(2)
    );

    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurant._id,
      items: orderItems,

      deliveryAddress: {
        name: deliveryAddress.name,
        phone: deliveryAddress.phone,
        addressLine: deliveryAddress.addressLine,
        city: deliveryAddress.city,
        state: deliveryAddress.state || "",
        pincode: deliveryAddress.pincode || "",
      },

      deliverySlot: {
        slotId: selectedSlot._id,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      },

      subtotal,
      deliveryFee,
      discount,
      total,
      paymentMethod,
      paymentStatus: "PENDING",
      status: "PLACED",
      customerNote: customerNote || "",
    });

    // Clear the cart after creating the order.
    cart.items = [];
    cart.subtotal = 0;
    cart.deliveryFee = 0;
    cart.total = 0;

    await cart.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("restaurant", "name logo phone")
      .populate("items.food", "name image price discountedPrice")
      .populate("deliverySlot.slotId");

    // Customer: order placed.
    try {
      if (typeof notifyOrderPlaced === "function") {
        await notifyOrderPlaced({
          userId: order.user,
          orderId: order._id,
          restaurantId: restaurant._id,
          orderNumber: order.orderNumber || String(order._id),
        });
      } else {
        console.error(
          "FoodE: notifyOrderPlaced is not exported correctly"
        );
      }
    } catch (error) {
      console.error("FoodE: Order placed notification failed:", error);
    }

    // Restaurant owner: new order.
    try {
      if (typeof notifyNewOrder === "function") {
        await notifyNewOrder({
          ownerId: restaurant.owner,
          orderId: order._id,
          restaurantId: restaurant._id,
          orderNumber: order.orderNumber || String(order._id),
        });
      } else {
        console.error(
          "FoodE: notifyNewOrder is not exported correctly"
        );
      }
    } catch (error) {
      console.error("FoodE: New order notification failed:", error);
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("FoodE: Create order error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating order",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// =====================================================
// GET CUSTOMER ORDERS
// =====================================================

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .populate("restaurant", "name logo phone")
      .populate("items.food", "name image price discountedPrice")
      .populate("deliverySlot.slotId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("FoodE: Get my orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};

// =====================================================
// GET SINGLE CUSTOMER ORDER
// =====================================================

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("restaurant", "name logo phone address")
      .populate("items.food", "name image price discountedPrice")
      .populate("deliverySlot.slotId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("FoodE: Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching order",
    });
  }
};

// =====================================================
// GET RESTAURANT OWNER ORDERS
// =====================================================

const getRestaurantOrders = async (req, res) => {
  try {
    const restaurant = await findOwnerRestaurant(req.user._id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found for this owner",
      });
    }

    const orders = await Order.find({
      restaurant: restaurant._id,
    })
      .populate("user", "name phone")
      .populate("items.food", "name image price discountedPrice")
      .populate("deliverySlot.slotId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("FoodE: Get restaurant orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching restaurant orders",
    });
  }
};

// =====================================================
// UPDATE ORDER STATUS + CUSTOMER PUSH NOTIFICATION
// =====================================================

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["CONFIRMED", "DELIVERED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const restaurant = await findOwnerRestaurant(req.user._id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found for this owner",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      restaurant: restaurant._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const validTransitions = {
      PLACED: ["CONFIRMED"],
      CONFIRMED: ["DELIVERED"],
      DELIVERED: [],
    };

    const allowedNextStatuses = validTransitions[order.status] || [];

    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change order status from ${order.status} to ${status}`,
      });
    }

    order.status = status;

    if (status === "CONFIRMED") {
      order.confirmedAt = new Date();
    }

    if (status === "DELIVERED") {
      order.deliveredAt = new Date();

      if (order.paymentMethod === "COD") {
        order.paymentStatus = "PAID";
      }
    }

    await order.save();

    // Send the notification after the order status is saved.
    try {
      const customerId = order.user?._id || order.user;

      if (!customerId) {
        throw new Error(
          `Customer ID is missing for order ${order._id}`
        );
      }

      const notificationPayload = {
        userId: customerId,
        orderId: order._id,
        restaurantId: restaurant._id,
        orderNumber: order.orderNumber || String(order._id),
      };

      if (status === "CONFIRMED") {
        if (typeof notifyOrderConfirmed !== "function") {
          throw new Error(
            "notifyOrderConfirmed is not exported correctly"
          );
        }

        console.log("FoodE: Sending ORDER_CONFIRMED notification", {
          orderId: String(order._id),
          customerId: String(customerId),
        });

        const result = await notifyOrderConfirmed(notificationPayload);

        console.log("FoodE: ORDER_CONFIRMED notification result:", result);
      }

      if (status === "DELIVERED") {
        if (typeof notifyOrderDelivered !== "function") {
          throw new Error(
            "notifyOrderDelivered is not exported correctly"
          );
        }

        console.log("FoodE: Sending ORDER_DELIVERED notification", {
          orderId: String(order._id),
          customerId: String(customerId),
        });

        const result = await notifyOrderDelivered(notificationPayload);

        console.log("FoodE: ORDER_DELIVERED notification result:", result);
      }
    } catch (notificationError) {
      // The order remains updated even if the push notification fails.
      console.error(
        "FoodE: Order status notification failed:",
        notificationError
      );
    }

    const updatedOrder = await Order.findById(order._id)
      .populate("restaurant", "name logo phone")
      .populate("items.food", "name image price discountedPrice")
      .populate("deliverySlot.slotId");

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("FoodE: Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating order status",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getRestaurantOrders,
  updateOrderStatus,
};