import React from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

// =====================================================
// RESTAURANT OWNER SCREENS
// =====================================================

import RestaurantDashboardScreen from '../screens/RestaurantDashboardScreen';
import RestaurantOrdersScreen from '../screens/RestaurantOrdersScreen';
import RestaurantMenuScreen from '../screens/RestaurantMenuScreen';
import RestaurantDetailsScreen from '../screens/RestaurantDetailsScreen';
import RestaurantReviewsScreen from '../screens/RestaurantReviewsScreen';
import RestaurantNotificationsScreen from '../screens/RestaurantNotificationsScreen';
import DeliverySlotsScreen from '../screens/DeliverySlotsScreen';

import AddFoodScreen from '../screens/AddFoodScreen';
import EditFoodScreen from '../screens/EditFoodScreen';

// =====================================================
// TYPES
// =====================================================

export type RestaurantOwnerStackParamList = {
  RestaurantDashboard: undefined;

  RestaurantOrders: {orderId?: string} | undefined;

  RestaurantMenu: undefined;

  AddFood: undefined;

  EditFood: {
    food: any;
  };

  RestaurantDetails: undefined;

  RestaurantReviews: undefined;

  RestaurantNotifications: undefined;

  DeliverySlots: undefined;
};

// =====================================================
// STACK
// =====================================================

const Stack =
  createNativeStackNavigator<
    RestaurantOwnerStackParamList
  >();

// =====================================================
// NAVIGATOR
// =====================================================

const RestaurantOwnerNavigator =
  () => {

    return (
      <Stack.Navigator
        initialRouteName="RestaurantDashboard"
        screenOptions={{
          headerShown: false,
          animation:
            'slide_from_right',
        }}
      >

        {/* =========================================
            DASHBOARD
        ========================================= */}

        <Stack.Screen
          name="RestaurantDashboard"
          component={
            RestaurantDashboardScreen
          }
        />

        {/* =========================================
            ORDERS
        ========================================= */}

        <Stack.Screen
          name="RestaurantOrders"
          component={
            RestaurantOrdersScreen
          }
        />

        {/* =========================================
            MENU
        ========================================= */}

        <Stack.Screen
          name="RestaurantMenu"
          component={
            RestaurantMenuScreen
          }
        />

        {/* =========================================
            ADD FOOD
        ========================================= */}

        <Stack.Screen
          name="AddFood"
          component={
            AddFoodScreen
          }
        />

        {/* =========================================
            EDIT FOOD
        ========================================= */}

        <Stack.Screen
          name="EditFood"
          component={
            EditFoodScreen
          }
        />

        {/* =========================================
            RESTAURANT DETAILS
        ========================================= */}

        <Stack.Screen
          name="RestaurantDetails"
          component={
            RestaurantDetailsScreen
          }
        />

        {/* =========================================
            REVIEWS
        ========================================= */}

        <Stack.Screen
          name="RestaurantReviews"
          component={
            RestaurantReviewsScreen
          }
        />

        {/* =========================================
            NOTIFICATIONS
        ========================================= */}

        <Stack.Screen
          name="RestaurantNotifications"
          component={
            RestaurantNotificationsScreen
          }
        />

        {/* =========================================
            DELIVERY SLOTS
        ========================================= */}

        <Stack.Screen
          name="DeliverySlots"
          component={
            DeliverySlotsScreen
          }
        />

      </Stack.Navigator>
    );
  };

export default RestaurantOwnerNavigator;
