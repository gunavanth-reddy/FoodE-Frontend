const Notification = require("../models/Notification");
const User = require("../models/User");

const {
    sendNotificationToDevice,
} = require("./fcmService");

// =====================================================
// CREATE ONE NOTIFICATION
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

        if (
            !user ||
            !type ||
            !title ||
            !message
        ) {
            console.error(
                "Notification Error: Missing required fields"
            );

            return null;
        }

        // =================================================
        // CREATE DATABASE NOTIFICATION
        // =================================================

        const notification =
            await Notification.create({
                user,
                type,
                title,
                message,
                order,
                restaurant,
                review,
            });

        // =================================================
        // SEND FCM PUSH NOTIFICATION
        // =================================================

        try {

            const recipient =
                await User
                    .findById(user)
                    .select("fcmToken");

            if (recipient?.fcmToken) {

                await sendNotificationToDevice({
                    fcmToken:
                        recipient.fcmToken,

                    title,

                    body: message,

                    data: {
                        notificationId:
                            notification._id.toString(),

                        type: String(type),

                        orderId:
                            order
                                ? order.toString()
                                : "",

                        restaurantId:
                            restaurant
                                ? restaurant.toString()
                                : "",

                        reviewId:
                            review
                                ? review.toString()
                                : "",
                    },
                });

            } else {

                console.log(
                    "Notification created, but user has no FCM token:",
                    user
                );
            }

        } catch (pushError) {

            console.error(
                "FCM Push Notification Error:",
                pushError
            );

            // FCM failure should NOT
            // break database notification creation.
        }

        return notification;

    } catch (error) {

        console.error(
            "Create Notification Error:",
            error
        );

        // Notification failure should NOT
        // break the main operation.

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

        message:
            `Your order ${orderNumber} has been placed successfully.`,

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

    return createNotification({
        user: userId,

        type: "ORDER_CONFIRMED",

        title: "Order Confirmed ✅",

        message:
            `Your order ${orderNumber} has been confirmed by the restaurant.`,

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

        message:
            `Your order ${orderNumber} has been delivered. Enjoy your food!`,

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

        message:
            `You received a new order ${orderNumber}.`,

        order: orderId,

        restaurant: restaurantId,
    });
};


// =====================================================
// RESTAURANT OWNER — APPROVED
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

        message:
            `${restaurantName} has been approved. You can now start accepting orders.`,

        restaurant: restaurantId,
    });
};


// =====================================================
// RESTAURANT OWNER — REJECTED
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

        message:
            `${restaurantName} has not been approved by the FoodE admin.`,

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

        message:
            `Your restaurant received a new ${rating}-star review.`,

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

        message:
            `${restaurantName} is waiting for approval.`,

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