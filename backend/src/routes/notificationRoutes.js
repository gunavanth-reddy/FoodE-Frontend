const express = require("express");

const router = express.Router();

const {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    createPromotion,
    createBroadcast,
    createPlatformEvent,
    sendTestNotification,
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");


// =====================================================
// USER / OWNER / ADMIN NOTIFICATIONS
// =====================================================

// Get my notifications

router.get(
    "/",
    protect,
    getMyNotifications
);


// =====================================================
// TEST — FCM NOTIFICATION
// =====================================================

router.post(
    "/test-fcm",
    protect,
    sendTestNotification
);


// =====================================================
// MARK ONE NOTIFICATION AS READ
// =====================================================

router.patch(
    "/:id/read",
    protect,
    markAsRead
);


// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================================

router.patch(
    "/read-all",
    protect,
    markAllAsRead
);


// =====================================================
// DELETE ONE NOTIFICATION
// =====================================================

router.delete(
    "/:id",
    protect,
    deleteNotification
);


// =====================================================
// DELETE ALL NOTIFICATIONS
// =====================================================

router.delete(
    "/",
    protect,
    deleteAllNotifications
);


// =====================================================
// ADMIN — PROMOTIONS
// =====================================================

router.post(
    "/promotion",
    protect,
    authorize("admin"),
    createPromotion
);


// =====================================================
// ADMIN — BROADCAST TO CUSTOMERS
// POST /api/notifications/broadcast
// =====================================================

router.post(
    "/broadcast",
    protect,
    authorize("admin"),
    createBroadcast
);


// =====================================================
// ADMIN — PLATFORM EVENTS
// =====================================================

router.post(
    "/platform-event",
    protect,
    authorize("admin"),
    createPlatformEvent
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;