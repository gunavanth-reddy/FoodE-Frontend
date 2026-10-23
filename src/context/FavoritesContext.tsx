import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {Restaurant} from '../features/user/components/home/restaurant/restaurantData';
import {Food} from '../features/restaurant/services/foodService';
import {useAuth} from './AuthContext';
import API_BASE_URL from '../config/api';

interface FavoritesContextType {
  favoriteRestaurants: Restaurant[];
  favoriteFoods: Food[];
  isRestaurantFavorite: (restaurantId: string | Restaurant) => boolean;
  isFoodFavorite: (foodId: string) => boolean;
  toggleRestaurantFavorite: (restaurant: Restaurant) => Promise<void>;
  toggleFoodFavorite: (food: Food) => Promise<void>;
  removeRestaurantFavorite: (restaurantId: string) => Promise<void>;
  removeFoodFavorite: (foodId: string) => Promise<void>;
  clearFavorites: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const restaurantKey = (restaurant: Restaurant): string =>
  String(restaurant?._id || restaurant?.backendId || restaurant?.id || '');
const LEGACY_RESTAURANTS_KEY = '@foode_favorite_restaurants';
const LEGACY_FOODS_KEY = '@foode_favorite_foods';

export const FavoritesProvider = ({children}: {children: ReactNode}) => {
  const {token, loading: authLoading} = useAuth();
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<Restaurant[]>([]);
  const [favoriteFoods, setFavoriteFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedFavorites = useRef(false);

  const request = useCallback(async (path: string, init: RequestInit = {}) => {
    if (!token) throw new Error('Sign in to manage your favorites.');
    const response = await fetch(`${API_BASE_URL}/favorites${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? {'Content-Type': 'application/json'} : {}),
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok || !data?.success) {
      throw new Error(data?.message || 'Unable to update favorites.');
    }
    return data;
  }, [token]);

  const refreshFavorites = useCallback(async () => {
    if (!hasLoadedFavorites.current) setLoading(true);
    if (!token) {
      setFavoriteRestaurants([]);
      setFavoriteFoods([]);
      hasLoadedFavorites.current = true;
      setLoading(false);
      return;
    }
    try {
      const data = await request('/');
      setFavoriteRestaurants(Array.isArray(data.restaurants) ? data.restaurants : []);
      setFavoriteFoods(Array.isArray(data.foods) ? data.foods : []);
    } finally {
      hasLoadedFavorites.current = true;
      setLoading(false);
    }
  }, [request, token]);

  const migrateLegacyFavorites = useCallback(async () => {
    if (!token) return;
    const [savedRestaurants, savedFoods] = await Promise.all([
      AsyncStorage.getItem(LEGACY_RESTAURANTS_KEY),
      AsyncStorage.getItem(LEGACY_FOODS_KEY),
    ]);
    const restaurants = savedRestaurants ? JSON.parse(savedRestaurants) : [];
    const foods = savedFoods ? JSON.parse(savedFoods) : [];
    const migrations: Promise<unknown>[] = [];
    if (Array.isArray(restaurants)) {
      restaurants.forEach((restaurant: Restaurant) => {
        const id = restaurantKey(restaurant);
        if (id) migrations.push(request('/restaurant', {
          method: 'POST', body: JSON.stringify({restaurantId: id}),
        }).catch(() => undefined));
      });
    }
    if (Array.isArray(foods)) {
      foods.forEach((food: Food) => {
        if (food?._id) migrations.push(request('/food', {
          method: 'POST', body: JSON.stringify({foodId: food._id}),
        }).catch(() => undefined));
      });
    }
    await Promise.all(migrations);
    await Promise.all([
      AsyncStorage.removeItem(LEGACY_RESTAURANTS_KEY),
      AsyncStorage.removeItem(LEGACY_FOODS_KEY),
    ]);
  }, [request, token]);

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    hasLoadedFavorites.current = false;
    setLoading(true);
    setFavoriteRestaurants([]);
    setFavoriteFoods([]);
    migrateLegacyFavorites()
      .then(refreshFavorites)
      .catch(error => {
        console.warn('Favorites sync failed:', error);
        if (active) {
          setFavoriteRestaurants([]);
          setFavoriteFoods([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [authLoading, migrateLegacyFavorites, refreshFavorites, token]);

  const isRestaurantFavorite = useCallback((restaurantOrId: string | Restaurant) => {
    const id = typeof restaurantOrId === 'string'
      ? restaurantOrId
      : restaurantKey(restaurantOrId);
    return !!id && favoriteRestaurants.some(restaurant => restaurantKey(restaurant) === String(id));
  }, [favoriteRestaurants]);

  const isFoodFavorite = useCallback((foodId: string) =>
    favoriteFoods.some(food => String(food._id) === String(foodId)), [favoriteFoods]);

  const toggleRestaurantFavorite = useCallback(async (restaurant: Restaurant) => {
    const id = restaurantKey(restaurant);
    if (!id) throw new Error('Restaurant is missing its database ID.');
    if (isRestaurantFavorite(id)) {
      await request(`/restaurant/${encodeURIComponent(id)}`, {method: 'DELETE'});
    } else {
      await request('/restaurant', {method: 'POST', body: JSON.stringify({restaurantId: id})});
    }
    await refreshFavorites();
  }, [isRestaurantFavorite, refreshFavorites, request]);

  const toggleFoodFavorite = useCallback(async (food: Food) => {
    const id = String(food?._id || '');
    if (!id) throw new Error('Food item is missing its database ID.');
    if (isFoodFavorite(id)) {
      await request(`/food/${encodeURIComponent(id)}`, {method: 'DELETE'});
    } else {
      await request('/food', {method: 'POST', body: JSON.stringify({foodId: id})});
    }
    await refreshFavorites();
  }, [isFoodFavorite, refreshFavorites, request]);

  const removeRestaurantFavorite = useCallback(async (id: string) => {
    if (!id) return;
    await request(`/restaurant/${encodeURIComponent(id)}`, {method: 'DELETE'});
    await refreshFavorites();
  }, [refreshFavorites, request]);

  const removeFoodFavorite = useCallback(async (id: string) => {
    if (!id) return;
    await request(`/food/${encodeURIComponent(id)}`, {method: 'DELETE'});
    await refreshFavorites();
  }, [refreshFavorites, request]);

  const clearFavorites = useCallback(async () => {
    await Promise.all([
      ...favoriteRestaurants.map(restaurant => request(`/restaurant/${encodeURIComponent(restaurantKey(restaurant))}`, {method: 'DELETE'})),
      ...favoriteFoods.map(food => request(`/food/${encodeURIComponent(food._id)}`, {method: 'DELETE'})),
    ]);
    setFavoriteRestaurants([]);
    setFavoriteFoods([]);
  }, [favoriteFoods, favoriteRestaurants, request]);

  const value = useMemo(() => ({
    favoriteRestaurants,
    favoriteFoods,
    isRestaurantFavorite,
    isFoodFavorite,
    toggleRestaurantFavorite,
    toggleFoodFavorite,
    removeRestaurantFavorite,
    removeFoodFavorite,
    clearFavorites,
    refreshFavorites,
    loading,
  }), [
    favoriteRestaurants,
    favoriteFoods,
    isRestaurantFavorite,
    isFoodFavorite,
    toggleRestaurantFavorite,
    toggleFoodFavorite,
    removeRestaurantFavorite,
    removeFoodFavorite,
    clearFavorites,
    refreshFavorites,
    loading,
  ]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used inside FavoritesProvider');
  return context;
};
