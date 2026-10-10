const admin = require("../../config/firebaseAdmin");

// =====================================================
// SEND FCM NOTIFICATION TO ONE DEVICE
// =====================================================

const sendNotificationToDevice = async ({
    fcmToken,
    title,
    body,
    data = {},
}) => {
    try {

        if (!admin.apps.length) {
            return {
                success: false,
                message: "Firebase Admin is not configured",
            };
        }

        if (!fcmToken) {
            console.log(
                "FCM notification skipped: No FCM token"
            );

            return {
                success: false,
                message: "FCM token is missing",
            };
        }

        // =================================================
        // CONVERT ALL DATA VALUES TO STRINGS
        // =================================================

        const stringData = {};

        Object.entries(data).forEach(
            ([key, value]) => {
                stringData[key] = String(value);
            }
        );

        // =================================================
        // FCM MESSAGE
        // =================================================

        const message = {
            token: fcmToken,

            notification: {
                title: title || "FoodE",
                body:
                    body ||
                    "You have a new notification",
            },

            data: stringData,

            android: {
                priority: "high",

                notification: {
                    channelId: "foode_default",
                    sound: "default",
                },
            },
        };

        // =================================================
        // SEND NOTIFICATION
        // =================================================

        const response =
            await admin
                .messaging()
                .send(message);

        console.log(
            "FCM notification sent:",
            response
        );

        return {
            success: true,
            messageId: response,
        };

    } catch (error) {

        console.error(
            "FCM notification error:",
            error
        );

        return {
            success: false,
            message: error.message,
            errorCode: error.code,
        };
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    sendNotificationToDevice,
};