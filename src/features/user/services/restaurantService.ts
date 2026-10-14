// =====================================================
// USER RESTAURANT SERVICE
// =====================================================

const API_BASE_URL =
  'https://foode.site/api';

// =====================================================
// TYPES
// =====================================================

export interface DeliveryTime {
  min: number;
  max: number;
}

export interface Restaurant {
  _id: string;
  id?: string;

  name: string;
  description?: string;

  // Images
  image?: string;
  coverImage?: string;
  logo?: string;
  imageUrl?: string;

  // Cuisine
  cuisine?: string | string[];
  cuisines?: string | string[];

  // Restaurant details
  address?: string;
  location?: string;
  city?: string;
  phone?: string;
  email?: string;

  // Ratings
  rating?: number;
  totalReviews?: number;

  // Delivery
  deliveryTime?: DeliveryTime;
  deliveryFee?: number;
  minimumOrder?: number;
  priceForTwo?: string | number;

  // Status
  isOpen?: boolean;
  isActive?: boolean;
  isApproved?: boolean;
  freeDelivery?: boolean;

  // Offers
  offer?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;

  [key: string]: any;
}

// =====================================================
// API RESPONSE
// =====================================================

interface RestaurantsResponse {
  success: boolean;
  count?: number;
  restaurants?: Restaurant[];
  restaurant?: Restaurant;
  message?: string;
}

// =====================================================
// NORMALIZE DELIVERY TIME
// =====================================================

const normalizeDeliveryTime = (
  value: any,
): DeliveryTime => {
  // New backend format
  if (
    value &&
    typeof value === 'object' &&
    typeof value.min === 'number' &&
    typeof value.max === 'number'
  ) {
    return {
      min: value.min,
      max: value.max,
    };
  }

  // Old numeric format
  if (
    typeof value === 'number' &&
    Number.isFinite(value)
  ) {
    return {
      min: value,
      max: value,
    };
  }

  // Old string format: "20-30 min"
  if (typeof value === 'string') {
    const match = value.match(
      /(\d+)\s*[-–]\s*(\d+)/,
    );

    if (match) {
      return {
        min: Number(match[1]),
        max: Number(match[2]),
      };
    }

    const numberValue = Number(
      value.replace(/[^0-9]/g, ''),
    );

    if (
      Number.isFinite(numberValue) &&
      numberValue > 0
    ) {
      return {
        min: numberValue,
        max: numberValue,
      };
    }
  }

  // Default
  return {
    min: 20,
    max: 35,
  };
};

// =====================================================
// NORMALIZE RESTAURANT
// =====================================================

const normalizeRestaurant = (
  restaurant: Restaurant,
): Restaurant => {
  const restaurantImage =
    restaurant.coverImage ||
    restaurant.image ||
    restaurant.imageUrl ||
    restaurant.logo ||
    '';

  const cuisineValue =
    restaurant.cuisines ??
    restaurant.cuisine ??
    [];

  const normalizedCuisines =
    Array.isArray(cuisineValue)
      ? cuisineValue
      : cuisineValue
        ? [cuisineValue]
        : [];

  return {
    ...restaurant,

    // IDs
    _id: String(
      restaurant._id ||
        restaurant.id ||
        '',
    ),

    id:
      restaurant.id ||
      restaurant._id,

    // Images
    image: restaurantImage,

    coverImage:
      restaurant.coverImage ||
      restaurantImage,

    logo:
      restaurant.logo ||
      '',

    // Cuisine
    cuisine:
      normalizedCuisines,

    cuisines:
      normalizedCuisines,

    // Rating
    rating:
      Number(restaurant.rating) || 0,

    // Delivery time
    deliveryTime:
      normalizeDeliveryTime(
        restaurant.deliveryTime,
      ),

    // Address
    address:
      restaurant.address ||
      restaurant.location ||
      'SRM AP University, Neerukonda',

    // Status
    isOpen:
      restaurant.isOpen !== false,

    isActive:
      restaurant.isActive !== false,
  };
};

// =====================================================
// FETCH WITH TIMEOUT
// =====================================================

const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = 10000,
): Promise<Response> => {
  const controller =
    new AbortController();

  const timeoutId =
    setTimeout(
      () => controller.abort(),
      timeout,
    );

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

// =====================================================
// GET ALL RESTAURANTS
// =====================================================

export const getRestaurants =
  async (): Promise<Restaurant[]> => {
    try {
      const url =
        `${API_BASE_URL}/restaurants`;

      console.log(
        'Fetching restaurants:',
        url,
      );

      const response =
        await fetchWithTimeout(
          url,
          {
            method: 'GET',
            headers: {
              Accept:
                'application/json',
            },
          },
          10000,
        );

      const data =
        (await response.json()) as RestaurantsResponse;

      console.log(
        'Restaurants API status:',
        response.status,
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to fetch restaurants: ${response.status}`,
        );
      }

      if (data.success !== true) {
        throw new Error(
          data.message ||
            'Failed to fetch restaurants.',
        );
      }

      const restaurants =
        Array.isArray(
          data.restaurants,
        )
          ? data.restaurants
          : [];

      return restaurants.map(
        normalizeRestaurant,
      );
    } catch (error: any) {
      console.log(
        'getRestaurants ERROR:',
        error,
      );

      if (
        error?.name ===
        'AbortError'
      ) {
        throw new Error(
          'Restaurant request timed out. Check that the backend is running.',
        );
      }

      if (
        error?.message ===
          'Network request failed' ||
        error instanceof TypeError
      ) {
        throw new Error(
          'Unable to connect to FoodE server. Check your Wi-Fi connection and backend IP address.',
        );
      }

      throw error;
    }
  };

// =====================================================
// GET SINGLE RESTAURANT
// =====================================================

export const getRestaurantById =
  async (
    restaurantId: string,
  ): Promise<Restaurant> => {
    if (!restaurantId) {
      throw new Error(
        'Restaurant ID is required.',
      );
    }

    try {
      const response =
        await fetchWithTimeout(
          `${API_BASE_URL}/restaurants/${restaurantId}`,
          {
            method: 'GET',
            headers: {
              Accept:
                'application/json',
            },
          },
          10000,
        );

      const data =
        (await response.json()) as RestaurantsResponse;

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to fetch restaurant.',
        );
      }

      if (
        data.success !== true ||
        !data.restaurant
      ) {
        throw new Error(
          data.message ||
            'Restaurant not found.',
        );
      }

      return normalizeRestaurant(
        data.restaurant,
      );
    } catch (error: any) {
      console.log(
        'getRestaurantById ERROR:',
        error,
      );

      if (
        error?.name ===
        'AbortError'
      ) {
        throw new Error(
          'Restaurant request timed out.',
        );
      }

      if (
        error?.message ===
          'Network request failed' ||
        error instanceof TypeError
      ) {
        throw new Error(
          'Unable to connect to FoodE server. Check your network connection.',
        );
      }

      throw error;
    }
  };

// =====================================================
// EXPORT DEFAULT
// =====================================================

export default {
  getRestaurants,
  getRestaurantById,
};
