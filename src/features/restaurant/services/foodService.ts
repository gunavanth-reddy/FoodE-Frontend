// =====================================================
// FOOD SERVICE
// =====================================================

import API_BASE_URL from '../../../config/api';

// =====================================================
// TYPES
// =====================================================

export interface FoodCategory {
  _id: string;
  name: string;
}

export interface FoodRestaurant {
  _id: string;
  name: string;
  isActive: boolean;
}

export interface Food {
  _id: string;

  restaurant: string | FoodRestaurant;
  category: string | FoodCategory;

  name: string;
  description?: string;
  image?: string;

  price: number;
  discountedPrice?: number | null;

  isAvailable: boolean;
  preparationTime?: number;

  foodType: 'veg' | 'non-veg';

  // Backward compatibility
  isVegetarian: boolean;

  rating?: number;
  totalReviews?: number;

  createdAt?: string;
  updatedAt?: string;
}

// =====================================================
// RESPONSE TYPES
// =====================================================

interface FoodsResponse {
  success: boolean;
  count: number;
  foods: Food[];
  message?: string;
}

interface FoodResponse {
  success: boolean;
  food?: Food;
  message?: string;
}

// =====================================================
// FETCH WITH TIMEOUT
// =====================================================

const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = 30000,
): Promise<Response> => {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

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
// ERROR HANDLER
// =====================================================

const getErrorMessage = (error: any): string => {
  if (error?.name === 'AbortError') {
    return 'Request timed out. Please check your internet connection and backend.';
  }

  return error?.message || 'Something went wrong.';
};

// =====================================================
// GET ALL PUBLIC FOODS
// =====================================================

export const getAllFoods = async (): Promise<Food[]> => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/foods`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    const data = (await response.json()) as FoodsResponse;

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch foods');
    }

    return data.foods || [];
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

// =====================================================
// GET FOODS UNDER 20 MINUTES
// =====================================================

export const getFoodsUnder20Minutes = async (): Promise<Food[]> => {
  const foods = await getAllFoods();

  return foods.filter(
    food =>
      food.isAvailable &&
      typeof food.preparationTime === 'number' &&
      food.preparationTime <= 20,
  );
};

// =====================================================
// GET BIRYANI FOODS
// =====================================================

export const getBiryaniFoods = async (): Promise<Food[]> => {
  const foods = await getAllFoods();

  return foods.filter(food => {
    if (
      typeof food.category === 'object' &&
      food.category !== null
    ) {
      return food.category.name.trim().toLowerCase() === 'biryani';
    }

    return false;
  });
};

// =====================================================
// GET VEG FOODS
// =====================================================

export const getVegFoods = async (): Promise<Food[]> => {
  const foods = await getAllFoods();

  return foods.filter(
    food =>
      food.foodType === 'veg' || food.isVegetarian === true,
  );
};

// =====================================================
// SEARCH FOODS
// =====================================================

export const searchFoods = async (
  query: string,
): Promise<Food[]> => {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/foods/search?q=${encodeURIComponent(
        trimmedQuery,
      )}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    const data = (await response.json()) as FoodsResponse;

    if (!response.ok) {
      throw new Error(data.message || 'Failed to search foods');
    }

    return data.foods || [];
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

// =====================================================
// GET RESTAURANT FOODS
// =====================================================

export const getRestaurantFoods = async (
  restaurantId: string,
): Promise<Food[]> => {
  if (!restaurantId) {
    throw new Error('Restaurant ID is required');
  }

  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/foods/restaurant/${restaurantId}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    const data = (await response.json()) as FoodsResponse;

    if (!response.ok) {
      throw new Error(
        data.message || 'Failed to fetch restaurant foods',
      );
    }

    return data.foods || [];
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

// =====================================================
// GET FOODS BY CATEGORY
// =====================================================

export const getFoodsByCategory = async (
  categoryName: string,
): Promise<Food[]> => {
  const trimmedCategory = categoryName.trim();

  if (!trimmedCategory) {
    throw new Error('Category name is required');
  }

  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/foods/category/${encodeURIComponent(
        trimmedCategory,
      )}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    const data = (await response.json()) as FoodsResponse;

    if (!response.ok) {
      throw new Error(
        data.message || 'Failed to fetch foods by category',
      );
    }

    return data.foods || [];
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

// =====================================================
// GET MY FOODS
// OWNER
// =====================================================

export const getMyFoods = async (
  token: string,
): Promise<Food[]> => {
  if (!token) {
    throw new Error('Authentication token is missing');
  }

  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/foods/my`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = (await response.json()) as FoodsResponse;

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch your foods');
    }

    return data.foods || [];
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

// =====================================================
// CREATE / UPDATE FOOD TYPES
// =====================================================

export interface CreateFoodData {
  name: string;
  description?: string;

  // Existing image URL (backward compatibility)
  image?: string;

  // Selected local image file
  imageFile?: {
    uri: string;
    type: string;
    fileName: string;
  } | null;

  price: number;
  discountedPrice?: number | null;
  category: string;
  preparationTime?: number;
  foodType?: 'veg' | 'non-veg';
  isVegetarian?: boolean;
}

// =====================================================
// BUILD MULTIPART FORM DATA
// =====================================================

const buildFoodFormData = (
  foodData: CreateFoodData | Partial<CreateFoodData>,
): FormData => {
  const formData = new FormData();

  Object.entries(foodData).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      key === 'imageFile'
    ) {
      return;
    }

    // Don't send empty image URL when uploading a new image
    if (key === 'image' && foodData.imageFile) {
      return;
    }

    formData.append(key, String(value));
  });

  // Attach the selected image for the backend upload handler.
  if (foodData.imageFile) {
    formData.append(
      'image',
      {
        uri: foodData.imageFile.uri,
        type: foodData.imageFile.type || 'image/jpeg',
        name: foodData.imageFile.fileName || 'food-image.jpg',
      } as any,
    );
  }

  return formData;
};

// =====================================================
// CREATE FOOD
// OWNER
// =====================================================

export const createFood = async (
  token: string,
  foodData: CreateFoodData,
): Promise<Food> => {
  if (!token) {
    throw new Error('Authentication token is missing');
  }

  try {
    const formData = buildFoodFormData(foodData);

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/foods`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          // Do not manually set multipart Content-Type
        },
        body: formData,
      },
      60000,
    );

    const data = (await response.json()) as FoodResponse;

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create food');
    }

    if (!data.food) {
      throw new Error(
        'Food was created but no food data was returned.',
      );
    }

    return data.food;
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

// =====================================================
// UPDATE FOOD
// OWNER
// =====================================================

export const updateFood = async (
  token: string,
  foodId: string,
  foodData: Partial<CreateFoodData>,
): Promise<Food> => {
  if (!token) {
    throw new Error('Authentication token is missing');
  }

  if (!foodId) {
    throw new Error('Food ID is required');
  }

  try {
    const formData = buildFoodFormData(foodData);

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/foods/${foodId}`,
      {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          // Do not manually set multipart Content-Type
        },
        body: formData,
      },
      60000,
    );

    const data = (await response.json()) as FoodResponse;

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update food');
    }

    if (!data.food) {
      throw new Error('Updated food data was not returned.');
    }

    return data.food;
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

// =====================================================
// TOGGLE FOOD AVAILABILITY
// OWNER
// =====================================================

export const toggleFoodAvailability = async (
  token: string,
  foodId: string,
): Promise<Food> => {
  if (!token) {
    throw new Error('Authentication token is missing');
  }

  if (!foodId) {
    throw new Error('Food ID is required');
  }

  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/foods/${foodId}/availability`,
      {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = (await response.json()) as FoodResponse;

    if (!response.ok) {
      throw new Error(
        data.message || 'Failed to update food availability',
      );
    }

    if (!data.food) {
      throw new Error('Updated food data was not returned.');
    }

    return data.food;
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

// =====================================================
// DELETE FOOD
// OWNER
// =====================================================

export const deleteFood = async (
  token: string,
  foodId: string,
): Promise<void> => {
  if (!token) {
    throw new Error('Authentication token is missing');
  }

  if (!foodId) {
    throw new Error('Food ID is required');
  }

  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/foods/${foodId}`,
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = (await response.json()) as {
      success: boolean;
      message?: string;
    };

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete food');
    }
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};
