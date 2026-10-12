const Notification = require("../models/Notification");
const User = require("../models/User");

const {
    sendNotificationToDevice,
} = require("../services/fcmService");


// =====================================================
// GET MY NOTIFICATIONS
// =====================================================

const getMyNotifications = async (req, res) => {
    try {

        const notifications =
            await Notification.find({
                user: req.user._id,
            })
                .populate(
                    "order",
                    "orderNumber status total"
                )
                .populate(
                    "restaurant",
                    "name logo"
                )
                .populate(
                    "review",
                    "rating comment"
                )
                .sort({
                    createdAt: -1,
                });

        // ==========================================
        // UNREAD COUNT
        // ==========================================

        const unreadCount =
            await Notification.countDocuments({
                user: req.user._id,
                isRead: false,
            });

        return res.status(200).json({

            success: true,

            count:
                notifications.length,

            unreadCount,

            notifications,

        });

    } catch (error) {

        console.error(
            "Get Notifications Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while fetching notifications",

        });
    }
};


// =====================================================
// MARK ONE NOTIFICATION AS READ
// =====================================================

const markAsRead = async (
    req,
    res
) => {

    try {

        const notification =
            await Notification.findOne({

                _id:
                    req.params.id,

                user:
                    req.user._id,

            });

        if (!notification) {

            return res.status(404).json({

                success: false,

                message:
                    "Notification not found",

            });
        }

        notification.isRead =
            true;

        await notification.save();

        return res.status(200).json({

            success: true,

            message:
                "Notification marked as read",

            notification,

        });

    } catch (error) {

        console.error(
            "Mark Notification Read Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while updating notification",

        });
    }
};


// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================================

const markAllAsRead = async (
    req,
    res
) => {

    try {

        await Notification.updateMany(

            {
                user:
                    req.user._id,

                isRead:
                    false,
            },

            {
                $set: {
                    isRead: true,
                },
            }

        );

        return res.status(200).json({

            success: true,

            message:
                "All notifications marked as read",

        });

    } catch (error) {

        console.error(
            "Mark All Notifications Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while updating notifications",

        });
    }
};


// =====================================================
// DELETE ONE NOTIFICATION
// =====================================================

const deleteNotification = async (
    req,
    res
) => {

    try {

        const notification =
            await Notification.findOneAndDelete({

                _id:
                    req.params.id,

                user:
                    req.user._id,

            });

        if (!notification) {

            return res.status(404).json({

                success: false,

                message:
                    "Notification not found",

            });
        }

        return res.status(200).json({

            success: true,

            message:
                "Notification deleted successfully",

        });

    } catch (error) {

        console.error(
            "Delete Notification Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while deleting notification",

        });
    }
};


// =====================================================
// DELETE ALL MY NOTIFICATIONS
// =====================================================

const deleteAllNotifications = async (
    req,
    res
) => {

    try {

        await Notification.deleteMany({

            user:
                req.user._id,

        });

        return res.status(200).json({

            success: true,

            message:
                "All notifications deleted successfully",

        });

    } catch (error) {

        console.error(
            "Delete All Notifications Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while deleting notifications",

        });
    }
};


// =====================================================
// CREATE PROMOTION
// =====================================================
//
// Admin only.
// Promotions are kept for later implementation.
// =====================================================

const createPromotion = async (
    req,
    res
) => {

    try {

        const {
            title,
            message,
        } = req.body;

        if (
            !title ||
            !title.trim() ||
            !message ||
            !message.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Title and message are required",

            });
        }

        const customers =
            await User.find({

                role:
                    "user",

                isActive:
                    true,

            }).select("_id fcmToken");

        if (
            customers.length === 0
        ) {

            return res.status(200).json({

                success: true,

                message:
                    "No active customers found",

                count: 0,

            });
        }

        // =================================================
        // CREATE DATABASE NOTIFICATIONS
        // =================================================

        const notifications =
            customers.map(
                (customer) => ({

                    user:
                        customer._id,

                    type:
                        "PROMOTION",

                    title:
                        title.trim(),

                    message:
                        message.trim(),

                })
            );

        await Notification.insertMany(
            notifications
        );

        // =================================================
        // SEND FCM PUSH NOTIFICATIONS
        // =================================================

        for (const customer of customers) {

            if (!customer.fcmToken) {
                continue;
            }

            try {

                await sendNotificationToDevice({

                    fcmToken:
                        customer.fcmToken,

                    title:
                        title.trim(),

                    body:
                        message.trim(),

                    data: {
                        type:
                            "PROMOTION",
                    },

                });

            } catch (error) {

                console.error(
                    "Promotion FCM Error:",
                    error
                );
            }
        }

        return res.status(201).json({

            success: true,

            message:
                "Promotion notification sent successfully",

            count:
                notifications.length,

        });

    } catch (error) {

        console.error(
            "Create Promotion Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while creating promotion",

        });
    }
};


// =====================================================
// CREATE PLATFORM EVENT
// =====================================================
//
// Admin only.
// Sends an important platform event to admins.
// =====================================================

const createPlatformEvent = async (
    req,
    res
) => {

    try {

        const {
            title,
            message,
        } = req.body;

        if (
            !title ||
            !title.trim() ||
            !message ||
            !message.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Title and message are required",

            });
        }

        const admins =
            await User.find({

                role:
                    "admin",

                isActive:
                    true,

            }).select("_id fcmToken");

        if (
            admins.length === 0
        ) {

            return res.status(200).json({

                success: true,

                message:
                    "No active admins found",

                count: 0,

            });
        }

        // =================================================
        // CREATE DATABASE NOTIFICATIONS
        // =================================================

        const notifications =
            admins.map(
                (admin) => ({

                    user:
                        admin._id,

                    type:
                        "PLATFORM_EVENT",

                    title:
                        title.trim(),

                    message:
                        message.trim(),

                })
            );

        await Notification.insertMany(
            notifications
        );

        // =================================================
        // SEND FCM PUSH NOTIFICATIONS
        // =================================================

        for (const adminUser of admins) {

            if (!adminUser.fcmToken) {
                continue;
            }

            try {

                await sendNotificationToDevice({

                    fcmToken:
                        adminUser.fcmToken,

                    title:
                        title.trim(),

                    body:
                        message.trim(),

                    data: {
                        type:
                            "PLATFORM_EVENT",
                    },

                });

            } catch (error) {

                console.error(
                    "Platform Event FCM Error:",
                    error
                );
            }
        }

        return res.status(201).json({

            success: true,

            message:
                "Platform event created successfully",

            count:
                notifications.length,

        });

    } catch (error) {

        console.error(
            "Create Platform Event Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while creating platform event",

        });
    }
};


// =====================================================
// ADMIN — BROADCAST TO ACTIVE CUSTOMERS
// =====================================================

const createBroadcast = async (req, res) => {
    try {
        const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
        const message = typeof req.body.message === "string" ? req.body.message.trim() : "";

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: "Title and message are required",
            });
        }

        if (title.length > 120 || message.length > 2000) {
            return res.status(400).json({
                success: false,
                message: "Title must be at most 120 characters and message at most 2000 characters",
            });
        }

        const customers = await User.find({
            role: "user",
            isActive: true,
        }).select("_id fcmToken");

        if (customers.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No active customers found",
                audience: "customers",
                recipients: 0,
                saved: 0,
                pushSent: 0,
                pushFailed: 0,
                withoutToken: 0,
            });
        }

        // Persist an in-app notification for every active customer,
        // including customers who have not registered an FCM token.
        const savedNotifications = await Notification.insertMany(
            customers.map((customer) => ({
                user: customer._id,
                type: "ADMIN_BROADCAST",
                title,
                message,
            }))
        );

        const customersWithTokens = customers.filter((customer) => customer.fcmToken);
        const withoutToken = customers.length - customersWithTokens.length;
        let pushSent = 0;
        let pushFailed = 0;

        // Send to devices independently so one invalid token does not stop the broadcast.
        const results = await Promise.all(
            customersWithTokens.map(async (customer) => {
                try {
                    return await sendNotificationToDevice({
                        fcmToken: customer.fcmToken,
                        title,
                        body: message,
                        data: { type: "ADMIN_BROADCAST" },
                    });
                } catch (error) {
                    console.error("Admin broadcast FCM error:", error.message);
                    return { success: false };
                }
            })
        );

        for (const result of results) {
            if (result && result.success) {
                pushSent += 1;
            } else {
                pushFailed += 1;
            }
        }

        return res.status(201).json({
            success: true,
            message: "Broadcast processed",
            audience: "customers",
            recipients: customers.length,
            saved: savedNotifications.length,
            pushSent,
            pushFailed,
            withoutToken,
        });
    } catch (error) {
        console.error("Create Admin Broadcast Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while creating broadcast",
        });
    }
};


// =====================================================
// TEST FCM NOTIFICATION
// =====================================================

const sendTestNotification = async (
    req,
    res
) => {

    try {

        const user =
            await User.findById(
                req.user._id
            ).select(
                "_id fcmToken"
            );

        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found",

            });
        }

        if (!user.fcmToken) {

            return res.status(400).json({

                success: false,

                message:
                    "No FCM token found for this user. Open the FoodE app first so the FCM token can be registered.",

            });
        }

        const result =
            await sendNotificationToDevice({

                fcmToken:
                    user.fcmToken,

                title:
                    "FoodE Test Notification 🔔",

                body:
                    "FCM notifications are working successfully!",

                data: {

                    type:
                        "TEST_NOTIFICATION",

                    message:
                        "FCM is working",

                },

            });

        if (!result.success) {

            return res.status(500).json({

                success: false,

                message:
                    "Failed to send FCM notification",

                error:
                    result.message,

                errorCode:
                    result.errorCode,

            });
        }

        return res.status(200).json({

            success: true,

            message:
                "Test notification sent successfully",

            messageId:
                result.messageId,

        });

    } catch (error) {

        console.error(
            "Test FCM Notification Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while sending test notification",

            error:
                error.message,

        });
    }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    getMyNotifications,

    markAsRead,

    markAllAsRead,

    deleteNotification,

    deleteAllNotifications,

    createPromotion,

    createBroadcast,

    createPlatformEvent,

    sendTestNotification,

};