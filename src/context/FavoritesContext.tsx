import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  Restaurant,
} from '../features/user/components/home/restaurant/restaurantData';

import {
  Food,
} from '../features/restaurant/services/foodService';

// =====================================================
// TYPES
// =====================================================

interface FavoritesContextType {
  favoriteRestaurants: Restaurant[];

  favoriteFoods: Food[];

  isRestaurantFavorite: (
    restaurantId: string | Restaurant,
  ) => boolean;

  isFoodFavorite: (
    foodId: string,
  ) => boolean;

  toggleRestaurantFavorite: (
    restaurant: Restaurant,
  ) => void;

  toggleFoodFavorite: (
    food: Food,
  ) => void;

  removeRestaurantFavorite: (
    restaurantId: string,
  ) => void;

  removeFoodFavorite: (
    foodId: string,
  ) => void;

  clearFavorites: () => void;

  loading: boolean;
}

// =====================================================
// CONTEXT
// =====================================================

const FavoritesContext =
  createContext<
    FavoritesContextType | undefined
  >(undefined);

// =====================================================
// STORAGE
// =====================================================

const RESTAURANTS_KEY =
  '@foode_favorite_restaurants';

const FOODS_KEY =
  '@foode_favorite_foods';

// =====================================================
// PROVIDER
// =====================================================

export const FavoritesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [
    favoriteRestaurants,
    setFavoriteRestaurants,
  ] = useState<Restaurant[]>([]);

  const [
    favoriteFoods,
    setFavoriteFoods,
  ] = useState<Food[]>([]);

  const [loading, setLoading] =
    useState(true);

  // ===================================================
  // LOAD FAVORITES
  // ===================================================

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const [
          restaurantsStorage,
          foodsStorage,
        ] = await Promise.all([
          AsyncStorage.getItem(
            RESTAURANTS_KEY,
          ),
          AsyncStorage.getItem(
            FOODS_KEY,
          ),
        ]);

        if (restaurantsStorage) {
          const restaurants =
            JSON.parse(
              restaurantsStorage,
            );

          if (
            Array.isArray(restaurants)
          ) {
            setFavoriteRestaurants(
              restaurants,
            );
          }
        }

        if (foodsStorage) {
          const foods =
            JSON.parse(foodsStorage);

          if (Array.isArray(foods)) {
            setFavoriteFoods(foods);
          }
        }
      } catch (error) {
        console.log(
          'Favorites load error:',
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // ===================================================
  // RESTAURANT FAVORITE CHECK
  // ===================================================

  const restaurantKey = (restaurant: Restaurant): string =>
    String((restaurant as any)?._id || (restaurant as any)?.backendId || (restaurant as any)?.id || '');

  const isRestaurantFavorite =
    useCallback(
      (restaurantOrId: string | Restaurant) => {
        const id =
          typeof restaurantOrId === 'string'
            ? restaurantOrId
            : restaurantKey(restaurantOrId);

        if (!id) return false;

        return favoriteRestaurants.some(
          restaurant => restaurantKey(restaurant) === String(id),
        );
      },
      [favoriteRestaurants],
    );

  // ===================================================
  // FOOD FAVORITE CHECK
  // ===================================================

  const isFoodFavorite =
    useCallback(
      (foodId: string) => {
        return favoriteFoods.some(
          food =>
            food._id === foodId,
        );
      },
      [favoriteFoods],
    );

  // ===================================================
  // TOGGLE RESTAURANT
  // ===================================================

  const toggleRestaurantFavorite =
    useCallback(
      (restaurant: Restaurant) => {
        setFavoriteRestaurants(
          previous => {
            const exists =
              previous.some(
                item => restaurantKey(item) === restaurantKey(restaurant),
              );

            const updated = exists
              ? previous.filter(
                  item => restaurantKey(item) !== restaurantKey(restaurant),
                )
              : [
                  ...previous,
                  restaurant,
                ];

            AsyncStorage.setItem(
              RESTAURANTS_KEY,
              JSON.stringify(updated),
            ).catch(error =>
              console.log(
                'Restaurant favorite save error:',
                error,
              ),
            );

            return updated;
          },
        );
      },
      [],
    );

  // ===================================================
  // TOGGLE FOOD
  // ===================================================

  const toggleFoodFavorite =
    useCallback(
      (food: Food) => {
        setFavoriteFoods(
          previous => {
            const exists =
              previous.some(
                item =>
                  item._id ===
                  food._id,
              );

            const updated = exists
              ? previous.filter(
                  item =>
                    item._id !==
                    food._id,
                )
              : [
                  ...previous,
                  food,
                ];

            AsyncStorage.setItem(
              FOODS_KEY,
              JSON.stringify(updated),
            ).catch(error =>
              console.log(
                'Food favorite save error:',
                error,
              ),
            );

            return updated;
          },
        );
      },
      [],
    );

  // ===================================================
  // REMOVE RESTAURANT
  // ===================================================

  const removeRestaurantFavorite =
    useCallback(
      (restaurantId: string) => {
        setFavoriteRestaurants(
          previous => {
            const updated =
              previous.filter(
                restaurant => restaurantKey(restaurant) !== String(restaurantId),
              );

            AsyncStorage.setItem(
              RESTAURANTS_KEY,
              JSON.stringify(updated),
            );

            return updated;
          },
        );
      },
      [],
    );

  // ===================================================
  // REMOVE FOOD
  // ===================================================

  const removeFoodFavorite =
    useCallback(
      (foodId: string) => {
        setFavoriteFoods(
          previous => {
            const updated =
              previous.filter(
                food =>
                  food._id !== foodId,
              );

            AsyncStorage.setItem(
              FOODS_KEY,
              JSON.stringify(updated),
            );

            return updated;
          },
        );
      },
      [],
    );

  // ===================================================
  // CLEAR ALL
  // ===================================================

  const clearFavorites =
    useCallback(async () => {
      setFavoriteRestaurants([]);
      setFavoriteFoods([]);

      await Promise.all([
        AsyncStorage.removeItem(
          RESTAURANTS_KEY,
        ),
        AsyncStorage.removeItem(
          FOODS_KEY,
        ),
      ]);
    }, []);

  // ===================================================
  // CONTEXT VALUE
  // ===================================================

  const value = useMemo(
    () => ({
      favoriteRestaurants,
      favoriteFoods,

      isRestaurantFavorite,
      isFoodFavorite,

      toggleRestaurantFavorite,
      toggleFoodFavorite,

      removeRestaurantFavorite,
      removeFoodFavorite,

      clearFavorites,

      loading,
    }),
    [
      favoriteRestaurants,
      favoriteFoods,
      isRestaurantFavorite,
      isFoodFavorite,
      toggleRestaurantFavorite,
      toggleFoodFavorite,
      removeRestaurantFavorite,
      removeFoodFavorite,
      clearFavorites,
      loading,
    ],
  );

  return (
    <FavoritesContext.Provider
      value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

// =====================================================
// HOOK
// =====================================================

export const useFavorites = () => {
  const context =
    useContext(
      FavoritesContext,
    );

  if (!context) {
    throw new Error(
      'useFavorites must be used inside FavoritesProvider',
    );
  }

  return context;
};
