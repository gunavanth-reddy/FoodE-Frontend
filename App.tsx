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

  const type = data.type;

  console.log(
    'FoodE: Handling notification navigation:',
    data,
  );

  // ===================================================
  // WAIT FOR NAVIGATION TO BE READY
  // ===================================================

  if (!navigationRef.isReady()) {
    console.log(
      'FoodE: Navigation is not ready yet.',
    );

    return;
  }

  // ===================================================
  // CUSTOMER — ORDER NOTIFICATIONS
  // ===================================================

  if (
    type === 'ORDER_PLACED' ||
    type === 'ORDER_CONFIRMED' ||
    type === 'ORDER_DELIVERED'
  ) {
    navigationRef.navigate('Orders');
    return;
  }

  // ===================================================
  // CUSTOMER — PROMOTION
  // ===================================================

  if (type === 'PROMOTION') {
    navigationRef.navigate('Notifications');
    return;
  }

  // ===================================================
  // RESTAURANT OWNER — NEW ORDER
  // ===================================================

  if (type === 'NEW_ORDER') {
    navigationRef.navigate('RestaurantOwner', {
      screen: 'RestaurantOrders',
    });

    return;
  }

  // ===================================================
  // RESTAURANT OWNER — NEW REVIEW
  // ===================================================

  if (type === 'NEW_REVIEW') {
    navigationRef.navigate('RestaurantOwner', {
      screen: 'RestaurantReviews',
    });

    return;
  }

  // ===================================================
  // RESTAURANT OWNER — APPROVED
  // ===================================================

  if (type === 'RESTAURANT_APPROVED') {
    navigationRef.navigate('RestaurantOwner', {
      screen: 'RestaurantDashboard',
    });

    return;
  }

  // ===================================================
  // RESTAURANT OWNER — REJECTED
  // ===================================================

  if (type === 'RESTAURANT_REJECTED') {
    navigationRef.navigate('RestaurantOwner', {
      screen: 'RestaurantDashboard',
    });

    return;
  }

  // ===================================================
  // PLATFORM EVENT
  // ===================================================

  if (type === 'PLATFORM_EVENT') {
    navigationRef.navigate('Notifications');
    return;
  }

  // ===================================================
  // TEST NOTIFICATION
  // ===================================================

  if (type === 'TEST_NOTIFICATION') {
    navigationRef.navigate('Notifications');
    return;
  }

  // ===================================================
  // FALLBACK
  // ===================================================

  navigationRef.navigate('Notifications');
};

// =====================================================
// NOTIFICATION SETUP
// =====================================================

const NotificationSetup: React.FC = () => {
  const {token} = useAuth();

  // ===================================================
  // FOREGROUND NOTIFICATION
  // ===================================================

  useEffect(() => {
    const unsubscribe =
      registerForegroundMessageHandler(message => {
        console.log(
          'FoodE: Foreground notification received:',
          message,
        );
      });

    return unsubscribe;
  }, []);

  // ===================================================
  // NOTIFICATION TAP HANDLERS
  // ===================================================

  useEffect(() => {
    const unsubscribeFCM =
      registerNotificationTapHandlers(data => {
        console.log(
          'FoodE: FCM notification tap:',
          data,
        );

        handleNotificationNavigation(data);
      });

    const unsubscribeNotifee =
      registerNotifeeNotificationHandler(data => {
        console.log(
          'FoodE: Local notification tap:',
          data,
        );

        handleNotificationNavigation(data);
      });

    getNotificationThatOpenedApp().then(data => {
      if (data) {
        console.log(
          'FoodE: App opened from notification:',
          data,
        );

        handleNotificationNavigation(data);
      }
    });

    return () => {
      unsubscribeFCM();
      unsubscribeNotifee();
    };
  }, []);

  // ===================================================
  // FCM PERMISSION + TOKEN
  // ===================================================

  useEffect(() => {
    if (!token) {
      return;
    }

    let unsubscribeTokenRefresh:
      (() => void) | undefined;

    const setupNotifications = async () => {
      try {
        const fcmToken =
          await requestNotificationPermission(token);

        if (fcmToken) {
          console.log(
            'FoodE FCM Token:',
            fcmToken,
          );
        }

        unsubscribeTokenRefresh =
          registerFCMTokenRefresh(
            token,
            (newToken: string) => {
              console.log(
                'FoodE FCM Token Updated:',
                newToken,
              );
            },
          );
      } catch (error) {
        console.error(
          'FoodE Notification Setup Error:',
          error,
        );
      }
    };

    setupNotifications();

    return () => {
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