// =====================================================
// REVIEW SERVICE
// =====================================================

import API_BASE_URL from '../../../config/api';

type ApiHeaders = Record<string, string>;

// =====================================================
// TYPES
// =====================================================

export interface CreateReviewData {
  orderId: string;
  restaurantId: string;
  foodId?: string;
  rating: number;
  comment?: string;
}

export interface ReviewUser {
  _id: string;
  name?: string;
  profileImage?: string;
}

export interface ReviewRestaurant {
  _id: string;
  name?: string;
  image?: string;
  rating?: number;
  totalReviews?: number;
}

export interface ReviewFood {
  _id: string;
  name?: string;
  image?: string;
  price?: number;
  rating?: number;
  totalReviews?: number;
}

export interface ReviewOrder {
  _id: string;
  orderNumber?: string;
}

export interface Review {
  _id: string;

  user: string | ReviewUser;

  restaurant: string | ReviewRestaurant;

  food?: string | ReviewFood | null;

  order: string | ReviewOrder;

  rating: number;

  comment: string;

  response?: string;

  isVisible?: boolean;

  createdAt: string;

  updatedAt?: string;
}

export type OwnerReview = Review;

// =====================================================
// RESPONSE TYPES
// =====================================================

interface ReviewsResponse {
  success: boolean;
  message?: string;
  count?: number;
  reviews?: Review[];
  page?: number;
  pageSize?: number;
  total?: number;
  hasMore?: boolean;
  summary?: {
    averageRating: number;
    countsByRating: Record<number, number>;
  };
}

export interface OwnerReviewsPage {
  reviews: OwnerReview[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  summary: {
    averageRating: number;
    countsByRating: Record<number, number>;
  };
}

interface ReviewResponse {
  success: boolean;
  message?: string;
  review?: Review;
}

// =====================================================
// FETCH WITH TIMEOUT
// =====================================================

const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = 15000
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
// CREATE REVIEW
// =====================================================

export const createReview = async (
  token: string,
  reviewData: CreateReviewData
): Promise<Review> => {
  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  if (!reviewData.orderId) {
    throw new Error("Order ID is required.");
  }

  if (!reviewData.restaurantId) {
    throw new Error("Restaurant ID is required.");
  }

  if (
    !reviewData.rating ||
    reviewData.rating < 1 ||
    reviewData.rating > 5
  ) {
    throw new Error("Rating must be between 1 and 5.");
  }

  const response = await fetchWithTimeout(
    `${API_BASE_URL}/reviews`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        orderId: reviewData.orderId,
        restaurantId: reviewData.restaurantId,

        ...(reviewData.foodId
          ? {
              foodId: reviewData.foodId,
            }
          : {}),

        rating: reviewData.rating,
        comment: reviewData.comment?.trim() || "",
      }),
    }
  );

  const data = (await response.json()) as ReviewResponse;

  console.log("========== CREATE REVIEW ==========");
  console.log("Status:", response.status);
  console.log("Data:", data);

  if (response.status === 401) {
    throw new Error(
      "Authentication expired. Please login again."
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create review."
    );
  }

  if (!data.success || !data.review) {
    throw new Error(
      data.message || "Failed to create review."
    );
  }

  return data.review;
};

// =====================================================
// GET RESTAURANT REVIEWS
// =====================================================

export const getRestaurantReviews = async (
  restaurantId: string,
  token?: string
): Promise<Review[]> => {
  if (!restaurantId) {
    throw new Error("Restaurant ID is required.");
  }

  const headers: ApiHeaders = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetchWithTimeout(
    `${API_BASE_URL}/reviews/restaurant/${restaurantId}`,
    {
      method: "GET",
      headers,
    }
  );

  const data = (await response.json()) as ReviewsResponse;

  if (response.status === 401) {
    throw new Error(
      "Authentication expired. Please login again."
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load restaurant reviews."
    );
  }

  if (!data.success) {
    throw new Error(
      data.message || "Failed to load restaurant reviews."
    );
  }

  return data.reviews || [];
};

// =====================================================
// GET FOOD REVIEWS
// =====================================================

export const getFoodReviews = async (
  foodId: string,
  token?: string
): Promise<Review[]> => {
  if (!foodId) {
    throw new Error("Food ID is required.");
  }

  const headers: ApiHeaders = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetchWithTimeout(
    `${API_BASE_URL}/reviews/food/${foodId}`,
    {
      method: "GET",
      headers,
    }
  );

  const data = (await response.json()) as ReviewsResponse;

  if (response.status === 401) {
    throw new Error(
      "Authentication expired. Please login again."
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load food reviews."
    );
  }

  if (!data.success) {
    throw new Error(
      data.message || "Failed to load food reviews."
    );
  }

  return data.reviews || [];
};

// =====================================================
// GET MY REVIEWS
// RESTAURANT OWNER
// =====================================================

export const getMyReviews = async (
  token: string,
  page = 1,
): Promise<OwnerReviewsPage> => {
  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  const query = new URLSearchParams({page: String(page)});
  const url = `${API_BASE_URL}/reviews/my?${query.toString()}`;

  console.log("========== GET MY REVIEWS ==========");
  console.log("URL:", url);

  const response = await fetchWithTimeout(
    url,
    {
      method: "GET",

      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = (await response.json()) as ReviewsResponse;

  console.log("========== GET MY REVIEWS RESPONSE ==========");
  console.log("Status:", response.status);
  console.log("Data:", data);

  if (response.status === 401) {
    throw new Error(
      "Authentication expired. Please login again."
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load owner reviews."
    );
  }

  if (!data.success) {
    throw new Error(
      data.message || "Failed to load owner reviews."
    );
  }

  if (
    !Array.isArray(data.reviews) ||
    typeof data.page !== "number" ||
    !Number.isSafeInteger(data.page) ||
    typeof data.pageSize !== "number" ||
    !Number.isSafeInteger(data.pageSize) ||
    typeof data.total !== "number" ||
    !Number.isSafeInteger(data.total) ||
    typeof data.hasMore !== "boolean" ||
    !data.summary ||
    !Number.isFinite(data.summary.averageRating) ||
    !data.summary.countsByRating
  ) {
    throw new Error("The owner reviews response is incomplete.");
  }

  return {
    reviews: data.reviews,
    page: data.page,
    pageSize: data.pageSize,
    total: data.total,
    hasMore: data.hasMore,
    summary: data.summary,
  };
};

// =====================================================
// OWNER RESPONSE
// =====================================================

export const respondToReview = async (
  token: string,
  reviewId: string,
  responseText: string
): Promise<Review> => {
  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  if (!reviewId) {
    throw new Error("Review ID is required.");
  }

  if (!responseText.trim()) {
    throw new Error("Response cannot be empty.");
  }

  const response = await fetchWithTimeout(
    `${API_BASE_URL}/reviews/${reviewId}/response`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        response: responseText.trim(),
      }),
    }
  );

  const data = (await response.json()) as ReviewResponse;

  console.log("========== RESPOND TO REVIEW ==========");
  console.log("Status:", response.status);
  console.log("Data:", data);

  if (response.status === 401) {
    throw new Error(
      "Authentication expired. Please login again."
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to respond to review."
    );
  }

  if (!data.success || !data.review) {
    throw new Error(
      data.message || "Failed to respond to review."
    );
  }

  return data.review;
};
