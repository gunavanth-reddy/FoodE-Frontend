
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import HomeScreen from '../features/user/screens/HomeScreen';
import SearchScreen from '../features/user/screens/SearchScreen';
import FavoritesScreen from '../features/user/screens/FavoritesScreen';
import CartScreen from '../features/user/screens/CartScreen';
import OrdersScreen from '../features/user/screens/OrdersScreen';
import ProfileScreen from '../features/user/screens/ProfileScreen';

import CustomTabBar from './components/CustomTabBar';

export type BottomTabParamList = {
  Home: undefined;
  Search: undefined;
  Favorites: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        sceneStyle: {
          backgroundColor: '#FFFFFF',
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />

      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{tabBarButton: () => null}}
      />

      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
