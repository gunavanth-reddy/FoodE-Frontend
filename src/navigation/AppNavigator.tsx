import React from 'react';

import {

  NavigationContainer,

  createNavigationContainerRef,

  NavigatorScreenParams,

} from '@react-navigation/native';

import {

  createNativeStackNavigator,

} from '@react-navigation/native-stack';

import {Alert as NativeAlert} from 'react-native';

import FoodEAlertHost, {FoodEAlert} from '../utils/FoodEAlert';

import SplashScreen from '../features/auth/screens/SplashScreen';

// Route every native Alert.alert call through the FoodE-styled alert UI.

(NativeAlert as any).alert = FoodEAlert.alert;

// =====================================================

// AUTH / INTRO

// =====================================================

import VideoScreen from '../features/auth/screens/VideoScreen';

import LoginScreen from '../features/auth/screens/LoginScreen';

import RegisterScreen from '../features/auth/screens/RegisterScreen';

import ForgotPasswordScreen from '../features/auth/screens/ForgotPasswordScreen';

import OTPVerificationScreen from '../features/auth/screens/OTPVerificationScreen';
import EmailVerificationScreen from '../features/auth/screens/EmailVerificationScreen';

// =====================================================

// USER NAVIGATION

// =====================================================

import BottomTabNavigator from './BottomTabNavigator';

// =====================================================

// USER SCREENS

// =====================================================

import RestaurantDetailsScreen from '../features/user/screens/RestaurantDetailsScreen';

import FoodDetailsScreen from '../features/user/screens/FoodDetailsScreen';

import CategoryFoodsScreen from '../features/user/screens/CategoryFoodsScreen';

import CartScreen from '../features/user/screens/CartScreen';

import CheckoutScreen from '../features/user/screens/CheckoutScreen';

import PaymentScreen from '../features/user/screens/PaymentScreen';

import OrderSuccessScreen from '../features/user/screens/OrderSuccessScreen';

import NotificationsScreen from '../features/user/screens/NotificationsScreen';

// =====================================================

// PROFILE SCREENS

// =====================================================

import PersonalInfoScreen from '../features/user/screens/PersonalInfoScreen';

import EditProfileScreen from '../features/user/screens/EditProfileScreen';

import AddressScreen from '../features/user/screens/AddressScreen';

import OrdersScreen from '../features/user/screens/OrdersScreen';

import FavoritesScreen from '../features/user/screens/FavoritesScreen';

// =====================================================

// REVIEW

// =====================================================

import ReviewScreen from '../features/user/screens/ReviewScreen';

// =====================================================

// SETTINGS

// =====================================================

import NotificationSettingsScreen from '../features/user/screens/NotificationSettingsScreen';

import LanguageScreen from '../features/user/screens/LanguageScreen';

import HelpCenterScreen from '../features/user/screens/HelpCenterScreen';

import PrivacyPolicyScreen from '../features/user/screens/PrivacyPolicyScreen';

import TermsScreen from '../features/user/screens/TermsScreen';

import AboutScreen from '../features/user/screens/AboutScreen';

// =====================================================

// RESTAURANT OWNER

// =====================================================

import RestaurantOwnerNavigator, {

  RestaurantOwnerStackParamList,

} from '../features/restaurant/navigation/RestaurantOwnerNavigator';

// =====================================================

// ADMIN

// =====================================================

import AdminDashboardScreen from '../features/superadmin/screens/AdminDashboardScreen';

import AdminUsersScreen from '../features/superadmin/screens/AdminUsersScreen';

import AdminRestaurantsScreen from '../features/superadmin/screens/AdminRestaurantsScreen';

import AdminOrdersScreen from '../features/superadmin/screens/AdminOrdersScreen';

import AdminReviewsScreen from '../features/superadmin/screens/AdminReviewsScreen';

import AdminRestaurantAnalyticsScreen from '../features/superadmin/screens/AdminRestaurantAnalyticsScreen';

// =====================================================

// AUTH CONTEXT

// =====================================================

import {useAuth} from '../context/AuthContext';

// =====================================================

// ORDER TYPE

// =====================================================

import {UserOrder} from '../features/user/services/orderService';

// =====================================================

// ROOT STACK PARAM LIST

// =====================================================

export type RootStackParamList = {

  // ===================================================

  // AUTH / INTRO

  // ===================================================

  Splash: undefined;

  VideoIntro: undefined;

  Login: undefined;

  Register: {verifiedEmail?: string} | undefined;

  EmailVerification: undefined;

  ForgotPassword: undefined;

  OTPVerification: {

    type: 'email' | 'phone';

    identifier: string;

    purpose?: 'registration' | 'login' | 'password-reset';

    developmentOTP?: string;

  };

  // ===================================================

  // MAIN APPLICATION

  // ===================================================

  Main: undefined;

  // ===================================================

  // RESTAURANT OWNER

  // ===================================================

  RestaurantOwner:

    | NavigatorScreenParams<RestaurantOwnerStackParamList>

    | undefined;

  // ===================================================

  // ADMIN

  // ===================================================

  AdminDashboard: undefined;

  AdminUsers: undefined;

  AdminRestaurants: undefined;

  AdminOrders: undefined;

  AdminReviews: undefined;

  AdminRestaurantAnalytics: {restaurantId: string};

  // ===================================================

  // RESTAURANTS & FOOD

  // ===================================================

  RestaurantDetails: {

    restaurant: any;

  };

  FoodDetails: {

    food: any;

  };

  CategoryFoods: {

    categoryName: string;

  };

  // ===================================================

  // CART & CHECKOUT

  // ===================================================

  Cart: undefined;

  Checkout: undefined;

  Payment: undefined;

  OrderSuccess: {

    order: UserOrder;

  };

  // ===================================================

  // NOTIFICATIONS

  // ===================================================

  Notifications: undefined;

  NotificationSettings: undefined;

  // ===================================================

  // PROFILE

  // ===================================================

  PersonalInfo: undefined;

  EditProfile: undefined;

  Address: undefined;

  Orders: undefined;

  Favorites: undefined;

  // ===================================================

  // REVIEWS

  // ===================================================

  Review: {

    order: UserOrder;

  };

  // ===================================================

  // SETTINGS

  // ===================================================

  Language: undefined;

  HelpCenter: undefined;

  PrivacyPolicy: undefined;

  Terms: undefined;

  About: undefined;

};

// =====================================================

// NAVIGATION REF

// =====================================================

export const navigationRef =

  createNavigationContainerRef<RootStackParamList>();

// =====================================================

// STACK

// =====================================================

const Stack =

  createNativeStackNavigator<RootStackParamList>();

// =====================================================

// APP NAVIGATOR

// =====================================================

const AppNavigator = () => {

  const {user, loading} = useAuth();

  // ===================================================

  // NAVIGATION

  // ===================================================

  return (

    <React.Fragment>

    <NavigationContainer ref={navigationRef}>

      <Stack.Navigator

        initialRouteName="Splash"

        screenOptions={{

          headerShown: false,

          animation: 'slide_from_right',

        }}>

        {/* =================================================

            SPLASH

        ================================================= */}

        <Stack.Screen

          name="Splash"

          component={SplashScreen}

        />

        {/* =================================================

            VIDEO INTRO

        ================================================= */}

        <Stack.Screen

          name="VideoIntro"

          component={VideoScreen}

        />

        {/* =================================================

            AUTH

        ================================================= */}

        <Stack.Screen

          name="Login"

          component={LoginScreen}

        />

        <Stack.Screen

          name="Register"

          component={RegisterScreen}

        />

        <Stack.Screen
          name="EmailVerification"
          component={EmailVerificationScreen}
        />

        <Stack.Screen

          name="ForgotPassword"

          component={ForgotPasswordScreen}

        />

        <Stack.Screen

          name="OTPVerification"

          component={OTPVerificationScreen}

        />

        {/* =================================================

            MAIN USER

        ================================================= */}

        <Stack.Screen

          name="Main"

          component={BottomTabNavigator}

        />

        {/* =================================================

            RESTAURANT OWNER

        ================================================= */}

        <Stack.Screen

          name="RestaurantOwner"

          component={RestaurantOwnerNavigator}

        />

        {/* =================================================

            ADMIN DASHBOARD

        ================================================= */}

        <Stack.Screen

          name="AdminDashboard"

          component={AdminDashboardScreen}

        />

        <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />

        <Stack.Screen name="AdminRestaurants" component={AdminRestaurantsScreen} />

        <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} />

        <Stack.Screen name="AdminReviews" component={AdminReviewsScreen} />

        <Stack.Screen name="AdminRestaurantAnalytics" component={AdminRestaurantAnalyticsScreen} />

        {/* =================================================

            RESTAURANT & FOOD

        ================================================= */}

        <Stack.Screen

          name="RestaurantDetails"

          component={RestaurantDetailsScreen}

        />

        <Stack.Screen

          name="FoodDetails"

          component={FoodDetailsScreen}

        />

        <Stack.Screen

          name="CategoryFoods"

          component={CategoryFoodsScreen}

        />

        {/* =================================================

            CART & CHECKOUT

        ================================================= */}

        <Stack.Screen

          name="Cart"

          component={CartScreen}

        />

        <Stack.Screen

          name="Checkout"

          component={CheckoutScreen}

        />

        <Stack.Screen

          name="Payment"

          component={PaymentScreen}

        />

        <Stack.Screen

          name="OrderSuccess"

          component={OrderSuccessScreen}

        />

        {/* =================================================

            NOTIFICATIONS

        ================================================= */}

        <Stack.Screen

          name="Notifications"

          component={NotificationsScreen}

        />

        <Stack.Screen

          name="NotificationSettings"

          component={NotificationSettingsScreen}

        />

        {/* =================================================

            PROFILE

        ================================================= */}

        <Stack.Screen

          name="PersonalInfo"

          component={PersonalInfoScreen}

        />

        <Stack.Screen

          name="EditProfile"

          component={EditProfileScreen}

        />

        <Stack.Screen

          name="Address"

          component={AddressScreen}

        />

        <Stack.Screen

          name="Orders"

          component={OrdersScreen}

        />

        <Stack.Screen

          name="Favorites"

          component={FavoritesScreen}

        />

        {/* =================================================

            REVIEWS

        ================================================= */}

        <Stack.Screen

          name="Review"

          component={ReviewScreen}

        />

        {/* =================================================

            SETTINGS

        ================================================= */}

        <Stack.Screen

          name="Language"

          component={LanguageScreen}

        />

        <Stack.Screen

          name="HelpCenter"

          component={HelpCenterScreen}

        />

        <Stack.Screen

          name="PrivacyPolicy"

          component={PrivacyPolicyScreen}

        />

        <Stack.Screen

          name="Terms"

          component={TermsScreen}

        />

        <Stack.Screen

          name="About"

          component={AboutScreen}

        />

      </Stack.Navigator>

    </NavigationContainer>

    <FoodEAlertHost />

    </React.Fragment>

  );

};

export default AppNavigator;