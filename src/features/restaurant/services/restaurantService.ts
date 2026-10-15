// =====================================================
// RESTAURANT OWNER SERVICE - FoodE
// =====================================================

import {Asset} from 'react-native-image-picker';

// =====================================================
// API CONFIG
// =====================================================

const API_BASE_URL = 'https://foode.site/api';

// =====================================================
// TYPES
// =====================================================

export interface RestaurantData {
  name: string;
  description?: string;

  // Images can be existing URLs or newly selected files
  logo?: string | Asset;
  coverImage?: string | Asset;

  phone: string;
  email?: string;
  address: string;
  city: string;

  deliveryTime?: number;
  deliveryFee?: number;
  minimumOrder?: number;

  cuisines?: string[];

  openingTime?: string;
  closingTime?: string;
}

export interface Restaurant {
  _id: string;

  name: string;
  description?: string;

  logo?: string;
  coverImage?: string;

  phone?: string;
  email?: string;
  address?: string;
  city?: string;

  deliveryTime?: number;
  deliveryFee?: number;
  minimumOrder?: number;

  cuisines?: string[];

  openingTime?: string;
  closingTime?: string;

  isOpen?: boolean;
  isActive?: boolean;
  isApproved?: boolean;
}

// =====================================================
// API RESPONSE
// =====================================================

interface ApiResponse {
  success?: boolean;
  message?: string;

  restaurant?: Restaurant;
  restaurants?: Restaurant[];

  [key: string]: any;
}

// =====================================================
// FETCH WITH TIMEOUT
// =====================================================

const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = 15000,
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
// SAFE RESPONSE PARSER
// =====================================================

const parseResponse = async (
  response: Response,
): Promise<ApiResponse> => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
};

// =====================================================
// BUILD RESTAURANT FORMDATA
// =====================================================

const buildRestaurantFormData = (
  restaurantData: Partial<RestaurantData>,
): FormData => {
  const formData = new FormData();

  Object.entries(restaurantData).forEach(([key, value]) => {
    // Skip only undefined and null values
    if (value === undefined || value === null) {
      return;
    }

    // ===============================================
    // HANDLE RESTAURANT IMAGES
    // ===============================================

    if (key === 'logo' || key === 'coverImage') {
      // Preserve existing image URLs, including legacy Cloudinary URLs.
      if (typeof value === 'string') {
        // Keep existing URLs if supplied.
        // Skip empty image strings.
        if (value.trim()) {
          formData.append(key, value);
        }

        return;
      }

      // Newly selected local image
      const asset = value as Asset;

      if (!asset.uri) {
        return;
      }

      const mimeType = asset.type || 'image/jpeg';

      const extension =
        mimeType.split('/')[1] || 'jpg';

      const fileName =
        asset.fileName || `${key}.${extension}`;

      const imageFile = {
        uri: asset.uri,
        name: fileName,
        type: mimeType,
      };

      // IMPORTANT:
      // Field names must match backend Multer fields:
      // logo and coverImage
      formData.append(key, imageFile as any);

      return;
    }

    // ===============================================
    // HANDLE CUISINES ARRAY
    // ===============================================

    if (key === 'cuisines' && Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
      return;
    }

    // ===============================================
    // HANDLE NORMAL TEXT / NUMBER FIELDS
    // ===============================================

    formData.append(key, String(value));
  });

  return formData;
};

// =====================================================
// COMMON ERROR HANDLER
// =====================================================

const handleRequestError = (error: any): never => {
  console.log('Restaurant Service Error:', error);

  if (error?.name === 'AbortError') {
    throw new Error(
      'Restaurant request timed out. Check that your backend is running.',
    );
  }

  if (
    error?.message === 'Network request failed' ||
    error instanceof TypeError
  ) {
    throw new Error(
      'Unable to connect to FoodE server. Check your Wi-Fi connection and backend IP address.',
    );
  }

  throw error;
};

// =====================================================
// CREATE RESTAURANT
// =====================================================

export const createRestaurant = async (
  token: string,
  restaurantData: RestaurantData,
) => {
  if (!token) {
    throw new Error('Authentication token is missing.');
  }

  try {
    console.log('Creating restaurant...');

    const formData =
      buildRestaurantFormData(restaurantData);

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/restaurants`,
      {
        method: 'POST',

        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,

          // DO NOT manually set Content-Type.
          // Fetch will automatically add the multipart boundary.
        },

        body: formData,
      },
    );

    const data = await parseResponse(response);

    console.log(
      'Create restaurant status:',
      response.status,
    );

    console.log(
      'Create restaurant response:',
      data,
    );

    if (response.status === 401) {
      throw new Error(
        'Authentication expired. Please login again.',
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message || 'Failed to create restaurant.',
      );
    }

    return data;
  } catch (error: any) {
    return handleRequestError(error);
  }
};

// =====================================================
// GET MY RESTAURANT
// =====================================================

export const getMyRestaurant = async (
  token: string,
): Promise<Restaurant | null> => {
  if (!token) {
    throw new Error('Authentication token is missing.');
  }

  try {
    console.log('Fetching my restaurant...');

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/restaurants/my`,
      {
        method: 'GET',

        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await parseResponse(response);

    console.log(
      'Get my restaurant status:',
      response.status,
    );

    console.log(
      'Get my restaurant response:',
      data,
    );

    // Owner has not created a restaurant yet
    if (response.status === 404) {
      return null;
    }

    if (response.status === 401) {
      throw new Error(
        'Authentication expired. Please login again.',
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message || 'Failed to fetch restaurant.',
      );
    }

    return data.restaurant || null;
  } catch (error: any) {
    return handleRequestError(error);
  }
};

// =====================================================
// UPDATE MY RESTAURANT
// =====================================================

export const updateMyRestaurant = async (
  token: string,
  restaurantData: Partial<RestaurantData>,
) => {
  if (!token) {
    throw new Error('Authentication token is missing.');
  }

  try {
    console.log('Updating restaurant...');

    const formData =
      buildRestaurantFormData(restaurantData);

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/restaurants/my`,
      {
        method: 'PUT',

        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,

          // DO NOT manually set Content-Type.
          // Fetch will automatically add the multipart boundary.
        },

        body: formData,
      },
    );

    const data = await parseResponse(response);

    console.log(
      'Update restaurant status:',
      response.status,
    );

    console.log(
      'Update restaurant response:',
      data,
    );

    if (response.status === 401) {
      throw new Error(
        'Authentication expired. Please login again.',
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message || 'Failed to update restaurant.',
      );
    }

    return data;
  } catch (error: any) {
    return handleRequestError(error);
  }
};

// =====================================================
// UPDATE RESTAURANT STATUS
// =====================================================

export const updateRestaurantStatus = async (
  token: string,
  isOpen: boolean,
) => {
  if (!token) {
    throw new Error('Authentication token is missing.');
  }

  try {
    console.log('Updating restaurant status:', isOpen);

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/restaurants/my/status`,
      {
        method: 'PATCH',

        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          isOpen,
        }),
      },
    );

    const data = await parseResponse(response);

    console.log(
      'Update restaurant status response:',
      data,
    );

    if (response.status === 401) {
      throw new Error(
        'Authentication expired. Please login again.',
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          'Failed to update restaurant status.',
      );
    }

    return data;
  } catch (error: any) {
    return handleRequestError(error);
  }
};

// =====================================================
// DEFAULT EXPORT
// =====================================================

export default {
  createRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
  updateRestaurantStatus,
};
