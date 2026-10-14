import React from 'react';
import {
  NavigationContainer,
  createNavigationContainerRef,
  NavigatorScreenParams,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Alert as NativeAlert} from 'react-native';

import FoodEAlertHost, {FoodEAlert} from '../utils/FoodEAlert';
import {useAuth} from '../context/AuthContext';
import {UserOrder} from '../features/user/services/orderService';

// Auth / Intro
import SplashScreen from '../features/auth/screens/SplashScreen';
import VideoScreen from '../features/auth/screens/VideoScreen';
import LoginScreen from '../features/auth/screens/LoginScreen';
import RegisterScreen from '../features/auth/screens/RegisterScreen';
import ForgotPasswordScreen from '../features/auth/screens/ForgotPasswordScreen';

// User navigation
import BottomTabNavigator from './BottomTabNavigator';

// User screens
import RestaurantDetailsScreen from '../features/user/screens/RestaurantDetailsScreen';
import CategoryFoodsScreen from '../features/user/screens/CategoryFoodsScreen';
import CartScreen from '../features/user/screens/CartScreen';
import CheckoutScreen from '../features/user/screens/CheckoutScreen';
import PaymentScreen from '../features/user/screens/PaymentScreen';
import OrderSuccessScreen from '../features/user/screens/OrderSuccessScreen';
import NotificationsScreen from '../features/user/screens/NotificationsScreen';

// Profile screens
import PersonalInfoScreen from '../features/user/screens/PersonalInfoScreen';
import EditProfileScreen from '../features/user/screens/EditProfileScreen';
import AddressScreen from '../features/user/screens/AddressScreen';
import OrdersScreen from '../features/user/screens/OrdersScreen';
import FavoritesScreen from '../features/user/screens/FavoritesScreen';

// Review
import ReviewScreen from '../features/user/screens/ReviewScreen';

// Settings
import NotificationSettingsScreen from '../features/user/screens/NotificationSettingsScreen';
import LanguageScreen from '../features/user/screens/LanguageScreen';
import HelpCenterScreen from '../features/user/screens/HelpCenterScreen';
import PrivacyPolicyScreen from '../features/user/screens/PrivacyPolicyScreen';
import TermsScreen from '../features/user/screens/TermsScreen';
import AboutScreen from '../features/user/screens/AboutScreen';

// Restaurant owner
import RestaurantOwnerNavigator, {
  RestaurantOwnerStackParamList,
} from '../features/restaurant/navigation/RestaurantOwnerNavigator';

// SuperAdmin
import AdminDashboardScreen from '../features/superadmin/screens/AdminDashboardScreen';
import AdminUsersScreen from '../features/superadmin/screens/AdminUsersScreen';
import AdminRestaurantsScreen from '../features/superadmin/screens/AdminRestaurantsScreen';
import AdminOrdersScreen from '../features/superadmin/screens/AdminOrdersScreen';
import AdminReviewsScreen from '../features/superadmin/screens/AdminReviewsScreen';
import AdminRestaurantAnalyticsScreen from '../features/superadmin/screens/AdminRestaurantAnalyticsScreen';
import AdminBroadcastScreen from '../features/superadmin/screens/AdminBroadcastScreen';

// Route native alerts through FoodE's custom alert UI.
(NativeAlert as any).alert = FoodEAlert.alert;

export type RootStackParamList = {
  // Auth / Intro
  Splash: undefined;
  VideoIntro: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;

  // Main user
  Main: undefined;

  // Restaurant owner
  RestaurantOwner:
    | NavigatorScreenParams<RestaurantOwnerStackParamList>
    | undefined;

  // SuperAdmin
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminRestaurants: undefined;
  AdminOrders: undefined;
  AdminReviews: undefined;
  AdminRestaurantAnalytics: {restaurantId: string};
  AdminBroadcast: undefined;

  // Restaurant and category
  RestaurantDetails: {restaurant: any};
  CategoryFoods: {categoryName: string};

  // Cart and checkout
  Cart: undefined;
  Checkout: undefined;
  Payment: undefined;
  OrderSuccess: {order?: UserOrder} | undefined;

  // Notifications
  Notifications: undefined;
  NotificationSettings: undefined;

  // Profile
  PersonalInfo: undefined;
  EditProfile: undefined;
  Address: undefined;
  Orders: undefined;
  Favorites: undefined;

  // Reviews
  Review: {order: UserOrder};

  // Settings
  Language: undefined;
  HelpCenter: undefined;
  PrivacyPolicy: undefined;
  Terms: undefined;
  About: undefined;
};

export const navigationRef =
  createNavigationContainerRef<RootStackParamList>();

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const {user, loading} = useAuth();

  return (
    <React.Fragment>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}>

          {/* Auth / Intro */}
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
          />

          <Stack.Screen
            name="VideoIntro"
            component={VideoScreen}
          />

          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />

          <Stack.Screen
            name="Register"
            component={RegisterScreen}
          />

          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />

          {/* Main user */}
          <Stack.Screen
            name="Main"
            component={BottomTabNavigator}
          />

          {/* Restaurant owner */}
          <Stack.Screen
            name="RestaurantOwner"
            component={RestaurantOwnerNavigator}
          />

          {/* SuperAdmin */}
          <Stack.Screen
            name="AdminDashboard"
            component={AdminDashboardScreen}
          />

          <Stack.Screen
            name="AdminUsers"
            component={AdminUsersScreen}
          />

          <Stack.Screen
            name="AdminRestaurants"
            component={AdminRestaurantsScreen}
          />

          <Stack.Screen
            name="AdminOrders"
            component={AdminOrdersScreen}
          />

          <Stack.Screen
            name="AdminReviews"
            component={AdminReviewsScreen}
          />

          <Stack.Screen
            name="AdminRestaurantAnalytics"
            component={AdminRestaurantAnalyticsScreen}
          />

          <Stack.Screen
            name="AdminBroadcast"
            component={AdminBroadcastScreen}
          />

          {/* Restaurant and category */}
          <Stack.Screen
            name="RestaurantDetails"
            component={RestaurantDetailsScreen}
          />

          <Stack.Screen
            name="CategoryFoods"
            component={CategoryFoodsScreen}
          />

          {/* Cart and checkout */}
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

          {/* Notifications */}
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
          />

          <Stack.Screen
            name="NotificationSettings"
            component={NotificationSettingsScreen}
          />

          {/* Profile */}
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

          {/* Reviews */}
          <Stack.Screen
            name="Review"
            component={ReviewScreen}
          />

          {/* Settings */}
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
