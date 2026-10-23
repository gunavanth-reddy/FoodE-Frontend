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
          headerShown: true,
          headerStyle: {backgroundColor: '#FFFFFF'},
          headerTintColor: '#17171B',
          headerTitleStyle: {fontWeight: '700'},
          headerShadowVisible: false,
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
          options={{title: 'Dashboard'}}
        />

        {/* =========================================
            ORDERS
        ========================================= */}

        <Stack.Screen
          name="RestaurantOrders"
          component={
            RestaurantOrdersScreen
          }
          options={{title: 'Orders'}}
        />

        {/* =========================================
            MENU
        ========================================= */}

        <Stack.Screen
          name="RestaurantMenu"
          component={
            RestaurantMenuScreen
          }
          options={{title: 'Menu'}}
        />

        {/* =========================================
            ADD FOOD
        ========================================= */}

        <Stack.Screen
          name="AddFood"
          component={
            AddFoodScreen
          }
          options={{title: 'Add Food'}}
        />

        {/* =========================================
            EDIT FOOD
        ========================================= */}

        <Stack.Screen
          name="EditFood"
          component={
            EditFoodScreen
          }
          options={{title: 'Edit Food'}}
        />

        {/* =========================================
            RESTAURANT DETAILS
        ========================================= */}

        <Stack.Screen
          name="RestaurantDetails"
          component={
            RestaurantDetailsScreen
          }
          options={{title: 'Restaurant Details'}}
        />

        {/* =========================================
            REVIEWS
        ========================================= */}

        <Stack.Screen
          name="RestaurantReviews"
          component={
            RestaurantReviewsScreen
          }
          options={{title: 'Reviews'}}
        />

        {/* =========================================
            NOTIFICATIONS
        ========================================= */}

        <Stack.Screen
          name="RestaurantNotifications"
          component={
            RestaurantNotificationsScreen
          }
          options={{title: 'Notifications'}}
        />

        {/* =========================================
            DELIVERY SLOTS
        ========================================= */}

        <Stack.Screen
          name="DeliverySlots"
          component={
            DeliverySlotsScreen
          }
          options={{title: 'Delivery Slots'}}
        />

      </Stack.Navigator>
    );
  };

export default RestaurantOwnerNavigator;
