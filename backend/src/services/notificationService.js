const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendNotificationToDevice } = require("./fcmService");

// =====================================================
// CREATE NOTIFICATION + SEND PUSH
// =====================================================

const createNotification = async ({
  user,
  type,
  title,
  message,
  order = null,
  restaurant = null,
  review = null,
}) => {
  try {
    if (!user || !type || !title || !message) {
      console.error("FoodE: Missing notification fields", {
        user,
        type,
        title,
      });
      return null;
    }

    // Save notification in MongoDB.
    const notification = await Notification.create({
      user,
      type,
      title,
      message,
      order,
      restaurant,
      review,
    });

    console.log("FoodE: Notification saved", {
      notificationId: String(notification._id),
      type,
      userId: String(user),
    });

    // Find the recipient's FCM token.
    try {
      const recipient = await User.findById(user).select("fcmToken");

      if (!recipient?.fcmToken) {
        console.warn("FoodE: Recipient has no FCM token", {
          userId: String(user),
          type,
        });

        return notification;
      }

      // Send push notification through Firebase.
      const result = await sendNotificationToDevice({
        fcmToken: recipient.fcmToken,
        title,
        body: message,
        data: {
          notificationId: String(notification._id),
          type: String(type),
          orderId: order ? String(order) : "",
          restaurantId: restaurant ? String(restaurant) : "",
          reviewId: review ? String(review) : "",
          timestamp: String(Date.now()),
        },
      });

      if (!result?.success) {
        console.error("FoodE: FCM send failed", {
          type,
          userId: String(user),
          error: result?.message || "Unknown FCM error",
          errorCode: result?.errorCode || "UNKNOWN",
        });
      } else {
        console.log("FoodE: FCM accepted notification", {
          type,
          notificationId: String(notification._id),
          messageId: result.messageId,
        });
      }
    } catch (pushError) {
      console.error("FoodE: Push notification error", {
        type,
        userId: String(user),
        message: pushError.message,
        code: pushError.code,
      });
    }

    return notification;
  } catch (error) {
    console.error("FoodE: Create notification error", error);
    return null;
  }
};

// =====================================================
// CUSTOMER — ORDER PLACED
// =====================================================

const notifyOrderPlaced = async ({
  userId,
  orderId,
  restaurantId,
  orderNumber,
}) => {
  return createNotification({
    user: userId,
    type: "ORDER_PLACED",
    title: "Order Placed 🛒",
    message: `Your order ${orderNumber} has been placed successfully.`,
    order: orderId,
    restaurant: restaurantId,
  });
};

// =====================================================
// CUSTOMER — ORDER CONFIRMED
// =====================================================

const notifyOrderConfirmed = async ({
  userId,
  orderId,
  restaurantId,
  orderNumber,
}) => {
  console.log("FoodE: Processing order confirmation", {
    userId: userId ? String(userId) : null,
    orderId: orderId ? String(orderId) : null,
  });

  return createNotification({
    user: userId,
    type: "ORDER_CONFIRMED",
    title: "Order Confirmed ✅",
    message: `Your order ${orderNumber} has been confirmed by the restaurant and is being prepared.`,
    order: orderId,
    restaurant: restaurantId,
  });
};

// =====================================================
// CUSTOMER — ORDER DELIVERED
// =====================================================

const notifyOrderDelivered = async ({
  userId,
  orderId,
  restaurantId,
  orderNumber,
}) => {
  return createNotification({
    user: userId,
    type: "ORDER_DELIVERED",
    title: "Order Delivered ✅",
    message: `Your order ${orderNumber} has been delivered. Enjoy your food!`,
    order: orderId,
    restaurant: restaurantId,
  });
};

// =====================================================
// RESTAURANT OWNER — NEW ORDER
// =====================================================

const notifyNewOrder = async ({
  ownerId,
  orderId,
  restaurantId,
  orderNumber,
}) => {
  return createNotification({
    user: ownerId,
    type: "NEW_ORDER",
    title: "New Order 🛒",
    message: `You received a new order ${orderNumber}.`,
    order: orderId,
    restaurant: restaurantId,
  });
};

// =====================================================
// RESTAURANT OWNER — RESTAURANT APPROVED
// =====================================================

const notifyRestaurantApproved = async ({
  ownerId,
  restaurantId,
  restaurantName,
}) => {
  return createNotification({
    user: ownerId,
    type: "RESTAURANT_APPROVED",
    title: "Restaurant Approved ✅",
    message: `${restaurantName} has been approved. You can now start accepting orders.`,
    restaurant: restaurantId,
  });
};

// =====================================================
// RESTAURANT OWNER — RESTAURANT REJECTED
// =====================================================

const notifyRestaurantRejected = async ({
  ownerId,
  restaurantId,
  restaurantName,
}) => {
  return createNotification({
    user: ownerId,
    type: "RESTAURANT_REJECTED",
    title: "Restaurant Rejected ❌",
    message: `${restaurantName} has not been approved by the FoodE admin.`,
    restaurant: restaurantId,
  });
};

// =====================================================
// RESTAURANT OWNER — NEW REVIEW
// =====================================================

const notifyNewReview = async ({
  ownerId,
  restaurantId,
  reviewId,
  rating,
}) => {
  return createNotification({
    user: ownerId,
    type: "NEW_REVIEW",
    title: "New Review ⭐",
    message: `Your restaurant received a new ${rating}-star review.`,
    restaurant: restaurantId,
    review: reviewId,
  });
};

// =====================================================
// ADMIN — NEW RESTAURANT
// =====================================================

const notifyNewRestaurant = async ({
  adminId,
  restaurantId,
  restaurantName,
}) => {
  return createNotification({
    user: adminId,
    type: "NEW_RESTAURANT",
    title: "New Restaurant Registration 🏪",
    message: `${restaurantName} is waiting for approval.`,
    restaurant: restaurantId,
  });
};

// =====================================================
// ADMIN — PLATFORM EVENT
// =====================================================

const notifyPlatformEvent = async ({
  adminId,
  title,
  message,
}) => {
  return createNotification({
    user: adminId,
    type: "PLATFORM_EVENT",
    title,
    message,
  });
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createNotification,
  notifyOrderPlaced,
  notifyOrderConfirmed,
  notifyOrderDelivered,
  notifyNewOrder,
  notifyRestaurantApproved,
  notifyRestaurantRejected,
  notifyNewReview,
  notifyNewRestaurant,
  notifyPlatformEvent,
};
