const { messaging } = require("../config/firebaseAdmin");

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
        if (!fcmToken) {
            console.log(
                "FCM notification skipped: No FCM token"
            );

            return {
                success: false,
                message: "FCM token is missing",
            };
        }

        // Convert all data values to strings.
        const stringData = {};

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                stringData[key] = String(value);
            }
        });

        // Use the server's current timestamp.
        const timestamp = Date.now();

        stringData.timestamp = String(timestamp);

        // FCM message.
        const message = {
            token: fcmToken,

            notification: {
                title: title || "FoodE",
                body: body || "You have a new notification",
            },

            data: stringData,

            android: {
                priority: "high",

                notification: {
                    channelId: "foode_default",
                    sound: "default",
                    defaultSound: true,
                    visibility: "private",
                },
            },
        };

        // Send notification.
        const response = await messaging.send(message);

        console.log("FCM notification sent:", {
            messageId: response,
            timestamp: new Date(timestamp).toISOString(),
        });

        return {
            success: true,
            messageId: response,
            timestamp,
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
