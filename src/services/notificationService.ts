import {PermissionsAndroid, Platform} from 'react-native';
import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';

import notifee, {
  AndroidImportance,
  AndroidStyle,
  EventType,
} from '@notifee/react-native';
import API_BASE_URL from '../config/api';

// =====================================================
// FCM CONFIGURATION
// =====================================================

const messaging = getMessaging();

const NOTIFICATION_CHANNEL_ID = 'foode_default';

// =====================================================
// NOTIFICATION CHANNEL
// =====================================================

export const createNotificationChannel = async (): Promise<void> => {
  try {
    await notifee.createChannel({
      id: NOTIFICATION_CHANNEL_ID,
      name: 'FoodE Notifications',
      description: 'Notifications from FoodE',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });

    console.log('FoodE: Notification channel created');
  } catch (error) {
    console.error(
      'FoodE: Notification channel error:',
      error,
    );
  }
};

// =====================================================
// DISPLAY NOTIFICATION WITH AUTOMATIC TIMESTAMP
// =====================================================

export const displayNotification = async (
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> => {
  try {
    await createNotificationChannel();

    await notifee.displayNotification({
      title: title || 'FoodE',
      body: body || 'You have a new notification',
      data,

      android: {
        channelId: NOTIFICATION_CHANNEL_ID,
        importance: AndroidImportance.HIGH,

        // Display the notification timestamp on Android.
        showTimestamp: true,
        timestamp: Date.now(),

        pressAction: {
          id: 'default',
        },

        smallIcon: 'ic_launcher',
        sound: 'default',
        vibrationPattern: [300, 500],

        style: {
          type: AndroidStyle.BIGTEXT,
          text: body || 'You have a new notification',
        },
      },
    });
  } catch (error) {
    console.error(
      'FoodE: Display notification error:',
      error,
    );
  }
};

// =====================================================
// SAVE FCM TOKEN TO BACKEND
// =====================================================

const saveFCMTokenToBackend = async (
  authToken: string,
  fcmToken: string,
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/fcm-token`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          fcmToken,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        'Save FCM token failed:',
        data?.message || 'Unknown error',
      );

      return false;
    }

    console.log('FoodE: FCM token saved successfully');

    return true;
  } catch (error) {
    console.error('FoodE: FCM backend error:', error);

    return false;
  }
};

// =====================================================
// REQUEST NOTIFICATION PERMISSION AND GET TOKEN
// =====================================================

export const requestNotificationPermission = async (
  authToken: string,
): Promise<string | null> => {
  try {
    let enabled: boolean;

    if (Platform.OS === 'android') {
      const permissionGranted =
        Platform.Version < 33 ||
        (await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        )) === PermissionsAndroid.RESULTS.GRANTED;

      enabled = permissionGranted;
    } else {
      const authStatus = await requestPermission(messaging);
      enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;
    }

    if (!enabled) {
      console.log(
        'FoodE: Notification permission denied',
      );

      return null;
    }

    await createNotificationChannel();

    const fcmToken = await getToken(messaging);

    if (!fcmToken) {
      console.error(
        'FoodE: FCM token was not generated',
      );

      return null;
    }

    console.log('FoodE FCM Token:', fcmToken);

    if (authToken) {
      await saveFCMTokenToBackend(
        authToken,
        fcmToken,
      );
    }

    return fcmToken;
  } catch (error) {
    console.error(
      'FoodE: FCM permission/token error:',
      error,
    );

    return null;
  }
};

// =====================================================
// FOREGROUND FCM MESSAGE HANDLER
// =====================================================

export const registerForegroundMessageHandler = (
  callback?: (message: any) => void,
) => {
  return onMessage(messaging, async remoteMessage => {
    console.log(
      'FoodE: Foreground notification received:',
      remoteMessage,
    );

    const title =
      remoteMessage.notification?.title || 'FoodE';

    const body =
      remoteMessage.notification?.body ||
      'You have a new notification';

    const data: Record<string, string> = {};

    if (remoteMessage.data) {
      Object.entries(remoteMessage.data).forEach(
        ([key, value]) => {
          data[key] = String(value);
        },
      );
    }

    // Foreground messages are displayed through Notifee,
    // which applies the Android timestamp configuration.
    await displayNotification(title, body, data);

    callback?.(remoteMessage);
  });
};

// =====================================================
// NOTIFICATION TAP HANDLING
// =====================================================

export const registerNotificationTapHandlers = (
  callback?: (data: Record<string, string>) => void,
) => {
  const unsubscribeOpenedApp = onNotificationOpenedApp(
    messaging,
    remoteMessage => {
      console.log(
        'FoodE: Notification opened:',
        remoteMessage,
      );

      const data: Record<string, string> = {};

      if (remoteMessage.data) {
        Object.entries(remoteMessage.data).forEach(
          ([key, value]) => {
            data[key] = String(value);
          },
        );
      }

      callback?.(data);
    },
  );

  return unsubscribeOpenedApp;
};

// =====================================================
// NOTIFICATION THAT OPENED APP FROM KILLED STATE
// =====================================================

export const getNotificationThatOpenedApp =
  async (): Promise<Record<string, string> | null> => {
    try {
      const remoteMessage =
        await getInitialNotification(messaging);

      if (!remoteMessage) {
        return null;
      }

      console.log(
        'FoodE: App opened from notification:',
        remoteMessage,
      );

      const data: Record<string, string> = {};

      if (remoteMessage.data) {
        Object.entries(remoteMessage.data).forEach(
          ([key, value]) => {
            data[key] = String(value);
          },
        );
      }

      return data;
    } catch (error) {
      console.error(
        'FoodE: Initial notification error:',
        error,
      );

      return null;
    }
  };

// =====================================================
// NOTIFEE TAP HANDLER
// =====================================================

export const registerNotifeeNotificationHandler = (
  callback?: (
    data: Record<string, string>,
  ) => void,
) => {
  return notifee.onForegroundEvent(({type, detail}) => {
    if (
      type === EventType.PRESS &&
      detail.notification?.data
    ) {
      const data: Record<string, string> = {};

      Object.entries(
        detail.notification.data,
      ).forEach(([key, value]) => {
        data[key] = String(value);
      });

      console.log(
        'FoodE: Local notification pressed:',
        data,
      );

      callback?.(data);
    }
  });
};

// =====================================================
// FCM TOKEN REFRESH
// =====================================================

export const registerFCMTokenRefresh = (
  authToken: string,
  callback?: (token: string) => void,
) => {
  return onTokenRefresh(
    messaging,
    async (newToken: string) => {
      console.log(
        'FoodE: FCM token refreshed:',
        newToken,
      );

      if (authToken && newToken) {
        await saveFCMTokenToBackend(
          authToken,
          newToken,
        );
      }

      callback?.(newToken);
    },
  );
};

// =====================================================
// BACKEND NOTIFICATION TYPE
// =====================================================

export interface BackendNotification {
  _id: string;
  user: string;
  type: string;
  title: string;
  message: string;
  order?: string | null;
  restaurant?: string | null;
  review?: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

// =====================================================
// GET MY NOTIFICATIONS
// =====================================================

export const getMyNotifications = async (
  authToken: string,
): Promise<BackendNotification[]> => {
  try {
    if (!authToken) {
      return [];
    }

    const response = await fetch(
      `${API_BASE_URL}/notifications`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        'Get notifications failed:',
        data?.message || 'Unknown error',
      );

      return [];
    }

    return Array.isArray(data?.notifications)
      ? data.notifications
      : [];
  } catch (error) {
    console.error(
      'Get notifications error:',
      error,
    );

    return [];
  }
};

// =====================================================
// MARK ONE NOTIFICATION AS READ
// =====================================================

export const markNotificationAsRead = async (
  authToken: string,
  notificationId: string,
): Promise<boolean> => {
  try {
    if (!authToken || !notificationId) {
      return false;
    }

    const response = await fetch(
      `${API_BASE_URL}/notifications/${notificationId}/read`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        'Mark notification as read failed:',
        data?.message || 'Unknown error',
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      'Mark notification as read error:',
      error,
    );

    return false;
  }
};

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================================

export const markAllNotificationsAsRead = async (
  authToken: string,
): Promise<boolean> => {
  try {
    if (!authToken) {
      return false;
    }

    const response = await fetch(
      `${API_BASE_URL}/notifications/read-all`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        'Mark all notifications failed:',
        data?.message || 'Unknown error',
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      'Mark all notifications error:',
      error,
    );

    return false;
  }
};

// =====================================================
// DELETE ONE NOTIFICATION
// =====================================================

export const deleteNotification = async (
  authToken: string,
  notificationId: string,
): Promise<boolean> => {
  try {
    if (!authToken || !notificationId) {
      return false;
    }

    const response = await fetch(
      `${API_BASE_URL}/notifications/${notificationId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        'Delete notification failed:',
        data?.message || 'Unknown error',
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      'Delete notification error:',
      error,
    );

    return false;
  }
};

// =====================================================
// DELETE ALL NOTIFICATIONS
// =====================================================

export const deleteAllNotifications = async (
  authToken: string,
): Promise<boolean> => {
  try {
    if (!authToken) {
      return false;
    }

    const response = await fetch(
      `${API_BASE_URL}/notifications`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        'Delete all notifications failed:',
        data?.message || 'Unknown error',
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      'Delete all notifications error:',
      error,
    );

    return false;
  }
};