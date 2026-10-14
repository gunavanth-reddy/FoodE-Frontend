
import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import AppNavigator, {
  navigationRef,
} from './src/navigation/AppNavigator';

import {
  AuthProvider,
  useAuth,
} from './src/context/AuthContext';

import {CartProvider} from './src/context/CartContext';
import {ThemeProvider} from './src/context/ThemeContext';
import {FavoritesProvider} from './src/context/FavoritesContext';

import {
  requestNotificationPermission,
  registerFCMTokenRefresh,
  registerForegroundMessageHandler,
  registerNotificationTapHandlers,
  registerNotifeeNotificationHandler,
  getNotificationThatOpenedApp,
} from './src/services/notificationService';

// =====================================================
// NOTIFICATION NAVIGATION
// =====================================================

const handleNotificationNavigation = (
  data: Record<string, any>,
) => {
  if (!data) {
    return;
  }

  console.log(
    'FoodE: Handling notification navigation:',
    data,
  );

  if (!navigationRef.isReady()) {
    console.log(
      'FoodE: Navigation is not ready yet.',
    );
    return;
  }

  switch (data.type) {
    case 'ORDER_PLACED':
    case 'ORDER_CONFIRMED':
    case 'ORDER_DELIVERED':
      navigationRef.navigate('Orders');
      break;

    case 'PROMOTION':
    case 'PLATFORM_EVENT':
    case 'TEST_NOTIFICATION':
      navigationRef.navigate('Notifications');
      break;

    case 'NEW_ORDER':
      navigationRef.navigate('RestaurantOwner', {
        screen: 'RestaurantOrders',
      });
      break;

    case 'NEW_REVIEW':
      navigationRef.navigate('RestaurantOwner', {
        screen: 'RestaurantReviews',
      });
      break;

    case 'RESTAURANT_APPROVED':
    case 'RESTAURANT_REJECTED':
      navigationRef.navigate('RestaurantOwner', {
        screen: 'RestaurantDashboard',
      });
      break;

    default:
      navigationRef.navigate('Notifications');
  }
};

// =====================================================
// NOTIFICATION SETUP
// =====================================================

const NotificationSetup: React.FC = () => {
  const {token} = useAuth();

  // ---------------------------------------------------
  // FOREGROUND NOTIFICATIONS
  // registerForegroundMessageHandler already displays
  // incoming foreground notifications using Notifee.
// ---------------------------------------------------

  useEffect(() => {
    const unsubscribe =
      registerForegroundMessageHandler(message => {
        console.log(
          'FoodE: Foreground notification received:',
          {
            title: message.notification?.title,
            body: message.notification?.body,
            data: message.data,
          },
        );
      });

    return unsubscribe;
  }, []);

  // ---------------------------------------------------
  // NOTIFICATION TAP HANDLERS
  // ---------------------------------------------------

  useEffect(() => {
    const unsubscribeFCM =
      registerNotificationTapHandlers(data => {
        console.log(
          'FoodE: FCM notification tapped:',
          data,
        );

        handleNotificationNavigation(data);
      });

    const unsubscribeNotifee =
      registerNotifeeNotificationHandler(data => {
        console.log(
          'FoodE: Notifee notification tapped:',
          data,
        );

        handleNotificationNavigation(data);
      });

    getNotificationThatOpenedApp()
      .then(data => {
        if (data) {
          console.log(
            'FoodE: App opened from notification:',
            data,
          );

          handleNotificationNavigation(data);
        }
      })
      .catch(error => {
        console.error(
          'FoodE: Initial notification error:',
          error,
        );
      });

    return () => {
      unsubscribeFCM();
      unsubscribeNotifee();
    };
  }, []);

  // ---------------------------------------------------
  // FCM PERMISSION AND TOKEN REGISTRATION
  // ---------------------------------------------------

  useEffect(() => {
    if (!token) {
      console.log(
        'FoodE: Waiting for authentication before registering FCM.',
      );
      return;
    }

    let cancelled = false;
    let unsubscribeTokenRefresh:
      (() => void) | undefined;

    const setupNotifications = async () => {
      try {
        const fcmToken =
          await requestNotificationPermission(token);

        if (cancelled) {
          return;
        }

        if (fcmToken) {
          console.log(
            'FoodE: FCM token obtained and registration attempted.',
          );
        } else {
          console.warn(
            'FoodE: No FCM token returned. Check permissions and backend token registration.',
          );
        }

        unsubscribeTokenRefresh =
          registerFCMTokenRefresh(
            token,
            (_newToken: string) => {
              console.log(
                'FoodE: FCM token refreshed and registration attempted.',
              );
            },
          );
      } catch (error) {
        console.error(
          'FoodE: Notification setup failed:',
          error,
        );
      }
    };

    void setupNotifications();

    return () => {
      cancelled = true;
      unsubscribeTokenRefresh?.();
    };
  }, [token]);

  return null;
};

// =====================================================
// APP
// =====================================================

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <NotificationSetup />

          <CartProvider>
            <FavoritesProvider>
              <StatusBar
                hidden={false}
                translucent={false}
                backgroundColor="#FF7A00"
                barStyle="light-content"
              />

              <AppNavigator />
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
