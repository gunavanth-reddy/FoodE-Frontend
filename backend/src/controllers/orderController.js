// =====================================================
// ORDER CONTROLLER
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
// HELPERS
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

// =====================================================
// CURRENT INDIA TIME
// =====================================================

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

// =====================================================
// CHECK DELIVERY SLOT CUTOFF
// =====================================================

const isSlotClosedForBooking = (slot) => {
  if (!slot || !slot.startTime) {
    return true;
  }

  const startMinutes = timeToMinutes(slot.startTime);

  if (startMinutes === null) {
    return true;
  }

  // Fixed 10-minute cutoff
  const cutoffMinutes =
    startMinutes - 10;

  const currentMinutes =
    getCurrentIndiaMinutes();

  // Normal same-day cutoff
  if (cutoffMinutes >= 0) {
    return currentMinutes >= cutoffMinutes;
  }

  // Midnight-safe handling
  const normalizedCutoff =
    cutoffMinutes + 24 * 60;

  return (
    currentMinutes >= normalizedCutoff &&
    currentMinutes < startMinutes
  );
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

    // ==========================================
    // ADDRESS
    // ==========================================

    if (
      !deliveryAddress ||
      !deliveryAddress.name ||
      !deliveryAddress.phone ||
      !deliveryAddress.addressLine ||
      !deliveryAddress.city
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Complete delivery address is required",
      });
    }

    // ==========================================
    // DELIVERY SLOT
    // ==========================================

    if (
      !deliverySlot ||
      !deliverySlot.slotId
    ) {
      return res.status(400).json({
        success: false,
        message: "Delivery slot is required",
      });
    }

    // ==========================================
    // PAYMENT
    // ==========================================

    if (
      !["COD", "ONLINE"].includes(
        paymentMethod
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // ==========================================
    // CART
    // ==========================================

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (
      !cart ||
      !Array.isArray(cart.items) ||
      cart.items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    // ==========================================
    // RESTAURANT
    // ==========================================

    const restaurant =
      await Restaurant.findOne({
        _id: cart.restaurant,
        isActive: true,
      });

    if (!restaurant) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant is not available",
      });
    }

    // ==========================================
    // DELIVERY SLOT
    // ==========================================

    const selectedSlot =
      await DeliverySlot.findOne({
        _id: deliverySlot.slotId,
        restaurant: restaurant._id,
        isActive: true,
      });

    if (!selectedSlot) {
      return res.status(400).json({
        success: false,
        message:
          "Selected delivery slot is not available",
      });
    }

    // ==========================================
    // CHECK CUTOFF
    // ==========================================

    if (
      isSlotClosedForBooking(
        selectedSlot
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Selected delivery slot is closed for booking. Please choose another slot.",
      });
    }

    // ==========================================
    // VERIFY CLIENT SLOT TIMES
    // ==========================================

    if (
      deliverySlot.startTime &&
      deliverySlot.startTime !==
        selectedSlot.startTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery slot",
      });
    }

    if (
      deliverySlot.endTime &&
      deliverySlot.endTime !==
        selectedSlot.endTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery slot",
      });
    }

    // ==========================================
    // ORDER ITEMS
    // ==========================================

    const orderItems = [];

    for (const cartItem of cart.items) {
      const food =
        await Food.findById(
          cartItem.food
        );

      if (!food) {
        return res.status(400).json({
          success: false,
          message:
            "One or more food items no longer exist",
        });
      }

      if (!food.isAvailable) {
        return res.status(400).json({
          success: false,
          message:
            `${food.name} is currently unavailable`,
        });
      }

      if (
        !food.restaurant ||
        food.restaurant.toString() !==
          restaurant._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid restaurant food item",
        });
      }

      // ========================================
      // QUANTITY
      // ========================================

      const quantity = Number(
        cartItem.quantity || 0
      );

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid quantity for ${food.name}`,
        });
      }

      // ========================================
      // ORIGINAL PRICE
      // ========================================

      const originalPrice =
        Number(food.price);

      if (
        !Number.isFinite(
          originalPrice
        ) ||
        originalPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid price for ${food.name}`,
        });
      }

      // ========================================
      // DISCOUNTED PRICE
      // ========================================

      const discountedPrice =
        food.discountedPrice !== null &&
        food.discountedPrice !== undefined
          ? Number(food.discountedPrice)
          : null;

      if (
        discountedPrice !== null &&
        (
          !Number.isFinite(
            discountedPrice
          ) ||
          discountedPrice < 0 ||
          discountedPrice > originalPrice
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid discounted price for ${food.name}`,
        });
      }

      // ========================================
      // EFFECTIVE PRICE
      // ========================================

      const finalPrice =
        discountedPrice !== null
          ? discountedPrice
          : originalPrice;

      // ========================================
      // ITEM TOTAL
      // ========================================

      const itemTotal = Number(
        (
          finalPrice * quantity
        ).toFixed(2)
      );

      orderItems.push({
        food: food._id,
        name: food.name,
        quantity,
        price: originalPrice,
        discountedPrice,
        total: itemTotal,
      });
    }

    // ==========================================
    // VALIDATE ITEMS
    // ==========================================

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No valid food items found",
      });
    }

    // ==========================================
    // PRICE CALCULATION
    // ==========================================

    const subtotal = Number(
      orderItems
        .reduce(
          (sum, item) =>
            sum +
            Number(item.total || 0),
          0
        )
        .toFixed(2)
    );

    // Restaurant delivery fee
    const deliveryFee = Number(
      restaurant.deliveryFee || 0
    );

    const discount = 0;

    const total = Number(
      (
        subtotal +
        deliveryFee -
        discount
      ).toFixed(2)
    );

    // ==========================================
    // CREATE ORDER
    // ==========================================

    const order =
      await Order.create({
        user: req.user._id,

        restaurant:
          restaurant._id,

        items: orderItems,

        deliveryAddress: {
          name:
            deliveryAddress.name,

          phone:
            deliveryAddress.phone,

          addressLine:
            deliveryAddress.addressLine,

          city:
            deliveryAddress.city,

          state:
            deliveryAddress.state || "",

          pincode:
            deliveryAddress.pincode || "",
        },

        deliverySlot: {
          slotId:
            selectedSlot._id,

          startTime:
            selectedSlot.startTime,

          endTime:
            selectedSlot.endTime,
        },

        subtotal,

        deliveryFee,

        discount,

        total,

        paymentMethod,

        paymentStatus: "PENDING",

        status: "PLACED",

        customerNote:
          customerNote || "",
      });

    // ==========================================
    // CLEAR CART
    // ==========================================

    cart.items = [];

    cart.subtotal = 0;

    cart.deliveryFee = 0;

    cart.total = 0;

    await cart.save();

    // ==========================================
    // POPULATE ORDER
    // ==========================================

    const populatedOrder =
      await Order.findById(
        order._id
      )
        .populate(
          "restaurant",
          "name logo phone"
        )
        .populate(
          "items.food",
          "name image price discountedPrice"
        )
        .populate(
          "deliverySlot.slotId"
        );

    // ==========================================
    // CUSTOMER NOTIFICATION — ORDER PLACED
    // ==========================================

    try {
      if (
        typeof notifyOrderPlaced ===
        "function"
      ) {
        await notifyOrderPlaced({
          userId:
            populatedOrder.user ||
            req.user._id,

          orderId:
            populatedOrder._id,

          restaurantId:
            restaurant._id,

          orderNumber:
            populatedOrder.orderNumber ||
            populatedOrder._id,
        });
      }
    } catch (error) {
      console.log(
        "Order placed notification error:",
        error.message
      );
    }

    // ==========================================
    // RESTAURANT NOTIFICATION — NEW ORDER
    // ==========================================

    try {
      if (
        typeof notifyNewOrder ===
        "function"
      ) {
        await notifyNewOrder({
          ownerId:
            restaurant.owner,

          orderId:
            populatedOrder._id,

          restaurantId:
            restaurant._id,

          orderNumber:
            populatedOrder.orderNumber ||
            populatedOrder._id,
        });
      }
    } catch (error) {
      console.log(
        "New order notification error:",
        error.message
      );
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(201).json({
      success: true,
      message:
        "Order placed successfully",
      order:
        populatedOrder,
    });

  } catch (error) {
    console.error(
      "Create Order Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating order",
      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

// =====================================================
// GET MY ORDERS
// =====================================================

const getMyOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find({
        user: req.user._id,
      })
        .populate(
          "restaurant",
          "name logo phone"
        )
        .populate(
          "items.food",
          "name image price discountedPrice"
        )
        .populate(
          "deliverySlot.slotId"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error) {
    console.error(
      "Get My Orders Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching orders",
    });
  }
};

// =====================================================
// GET SINGLE ORDER
// =====================================================

const getOrderById = async (
  req,
  res
) => {
  try {
    const order =
      await Order.findOne({
        _id: req.params.id,
        user: req.user._id,
      })
        .populate(
          "restaurant",
          "name logo phone address"
        )
        .populate(
          "items.food",
          "name image price discountedPrice"
        )
        .populate(
          "deliverySlot.slotId"
        );

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
    console.error(
      "Get Order Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching order",
    });
  }
};

// =====================================================
// FIND OWNER RESTAURANT
// =====================================================

// Owner can access orders even if
// restaurant is currently inactive.

const findOwnerRestaurant = async (
  userId
) => {
  return Restaurant.findOne({
    owner: userId,
  });
};

// =====================================================
// GET RESTAURANT ORDERS
// =====================================================

const getRestaurantOrders =
  async (
    req,
    res
  ) => {
    try {

      const restaurant =
        await findOwnerRestaurant(
          req.user._id
        );

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message:
            "Restaurant not found for this owner",
        });
      }

      const orders =
        await Order.find({
          restaurant:
            restaurant._id,
        })
          .populate(
            "user",
            "name phone"
          )
          .populate(
            "items.food",
            "name image price discountedPrice"
          )
          .populate(
            "deliverySlot.slotId"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,
        count:
          orders.length,
        orders,
      });

    } catch (error) {
      console.error(
        "Get Restaurant Orders Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while fetching restaurant orders",
      });
    }
  };

// =====================================================
// UPDATE ORDER STATUS — RESTAURANT OWNER
// =====================================================
//
// FLOW:
//
// PLACED
//    ↓
// CONFIRMED
//    ↓
// DELIVERED
//
// =====================================================

const updateOrderStatus =
  async (
    req,
    res
  ) => {
    try {

      const {
        status,
      } = req.body;

      // ==========================================
      // ALLOWED STATUSES
      // ==========================================

      const allowedStatuses = [
        "CONFIRMED",
        "DELIVERED",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order status",
        });
      }

      // ==========================================
      // OWNER RESTAURANT
      // ==========================================

      const restaurant =
        await findOwnerRestaurant(
          req.user._id
        );

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message:
            "Restaurant not found for this owner",
        });
      }

      // ==========================================
      // FIND ORDER
      // ==========================================

      const order =
        await Order.findOne({
          _id: req.params.id,
          restaurant:
            restaurant._id,
        });

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }

      // ==========================================
      // VALID TRANSITIONS
      // ==========================================

      const validTransitions = {
        PLACED: [
          "CONFIRMED",
        ],

        CONFIRMED: [
          "DELIVERED",
        ],

        DELIVERED: [],
      };

      const currentTransitions =
        validTransitions[
          order.status
        ] || [];

      if (
        !currentTransitions.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Cannot change order status from ${order.status} to ${status}`,
        });
      }

      // ==========================================
      // UPDATE STATUS
      // ==========================================

      order.status = status;

      // ==========================================
      // CONFIRMED
      // ==========================================

      if (
        status === "CONFIRMED"
      ) {
        order.confirmedAt =
          new Date();
      }

      // ==========================================
      // DELIVERED
      // ==========================================

      if (
        status === "DELIVERED"
      ) {
        order.deliveredAt =
          new Date();

        // COD becomes paid
        // after delivery.

        if (
          order.paymentMethod ===
          "COD"
        ) {
          order.paymentStatus =
            "PAID";
        }
      }

      // ==========================================
      // SAVE ORDER
      // ==========================================

      await order.save();

      // ==========================================
      // ORDER CONFIRMED NOTIFICATION
      // ==========================================

      if (
        status === "CONFIRMED"
      ) {
        try {

          if (
            typeof notifyOrderConfirmed ===
            "function"
          ) {
            await notifyOrderConfirmed({
              userId:
                order.user,

              orderId:
                order._id,

              restaurantId:
                restaurant._id,

              orderNumber:
                order.orderNumber ||
                order._id,
            });
          }

        } catch (
          notificationError
        ) {
          console.log(
            "Order confirmed notification error:",
            notificationError.message
          );
        }
      }

      // ==========================================
      // ORDER DELIVERED NOTIFICATION
      // ==========================================

      if (
        status === "DELIVERED"
      ) {
        try {

          if (
            typeof notifyOrderDelivered ===
            "function"
          ) {
            await notifyOrderDelivered({
              userId:
                order.user,

              orderId:
                order._id,

              restaurantId:
                restaurant._id,

              orderNumber:
                order.orderNumber ||
                order._id,
            });
          }

        } catch (
          notificationError
        ) {
          console.log(
            "Order delivered notification error:",
            notificationError.message
          );
        }
      }

      // ==========================================
      // UPDATED ORDER
      // ==========================================

      const updatedOrder =
        await Order.findById(
          order._id
        )
          .populate(
            "restaurant",
            "name logo phone"
          )
          .populate(
            "items.food",
            "name image price discountedPrice"
          )
          .populate(
            "deliverySlot.slotId"
          );

      // ==========================================
      // RESPONSE
      // ==========================================

      return res.status(200).json({
        success: true,
        message:
          "Order status updated successfully",
        order:
          updatedOrder,
      });

    } catch (error) {

      console.error(
        "Update Order Status Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while updating order status",
        error:
          process.env.NODE_ENV ===
          "development"
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