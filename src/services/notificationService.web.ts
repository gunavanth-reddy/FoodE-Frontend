import API_BASE_URL from '../config/api';

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

const warnPushUnavailable = () => {
  console.warn('FoodE: Push notifications are not configured for web.');
};

const makeHeaders = (authToken: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${authToken}`,
});

export const createNotificationChannel = async (): Promise<void> => {
  warnPushUnavailable();
};

export const displayNotification = async (
  _title: string,
  _body: string,
  _data?: Record<string, string>,
): Promise<void> => {
  warnPushUnavailable();
};

export const requestNotificationPermission = async (
  _authToken: string,
): Promise<string | null> => {
  warnPushUnavailable();
  return null;
};

export const registerForegroundMessageHandler = (
  _callback?: (message: unknown) => void,
) => {
  warnPushUnavailable();
  return () => {};
};

export const registerNotificationTapHandlers = (
  _callback?: (data: Record<string, string>) => void,
) => {
  warnPushUnavailable();
  return () => {};
};

export const getNotificationThatOpenedApp =
  async (): Promise<Record<string, string> | null> => {
    warnPushUnavailable();
    return null;
  };

export const registerNotifeeNotificationHandler = (
  _callback?: (data: Record<string, string>) => void,
) => {
  warnPushUnavailable();
  return () => {};
};

export const registerFCMTokenRefresh = (
  _authToken: string,
  _callback?: (token: string) => void,
) => {
  warnPushUnavailable();
  return () => {};
};

export const getMyNotifications = async (
  authToken: string,
): Promise<BackendNotification[]> => {
  if (!authToken) {
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'GET',
      headers: makeHeaders(authToken),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || 'Unable to load notifications.');
    }

    return Array.isArray(data?.notifications) ? data.notifications : [];
  } catch (error) {
    console.error('FoodE: Get notifications error:', error);
    return [];
  }
};

const updateNotification = async (
  authToken: string,
  path: string,
  method: 'PATCH' | 'DELETE',
): Promise<boolean> => {
  if (!authToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: makeHeaders(authToken),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || 'Unable to update notifications.');
    }

    return true;
  } catch (error) {
    console.error('FoodE: Update notifications error:', error);
    return false;
  }
};

export const markNotificationAsRead = (
  authToken: string,
  notificationId: string,
): Promise<boolean> =>
  updateNotification(
    authToken,
    `/notifications/${notificationId}/read`,
    'PATCH',
  );

export const markAllNotificationsAsRead = (
  authToken: string,
): Promise<boolean> =>
  updateNotification(authToken, '/notifications/read-all', 'PATCH');

export const deleteNotification = (
  authToken: string,
  notificationId: string,
): Promise<boolean> =>
  updateNotification(authToken, `/notifications/${notificationId}`, 'DELETE');

export const deleteAllNotifications = (
  authToken: string,
): Promise<boolean> =>
  updateNotification(authToken, '/notifications', 'DELETE');
