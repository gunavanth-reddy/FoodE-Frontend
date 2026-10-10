// =====================================================
// CATEGORY SERVICE
// =====================================================

const API_BASE_URL =
  'https://foode-backend-vn67.onrender.com/api';

// =====================================================
// TYPES
// =====================================================

export interface CategoryData {
  name: string;
  description?: string;
  image?: string;
  displayOrder?: number;
}

export interface Category {
  _id: string;

  restaurant: string;

  name: string;

  description?: string;

  image?: string;

  isActive: boolean;

  displayOrder: number;

  createdAt?: string;

  updatedAt?: string;
}

// =====================================================
// RESPONSE TYPES
// =====================================================

interface CategoriesResponse {
  success: boolean;

  count?: number;

  categories?: Category[];

  message?: string;
}

interface CategoryResponse {
  success: boolean;

  category?: Category;

  message?: string;
}

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
    setTimeout(() => {
      controller.abort();
    }, timeout);

  try {
    return await fetch(
      url,
      {
        ...options,
        signal:
          controller.signal,
      },
    );
  } finally {
    clearTimeout(
      timeoutId,
    );
  }
};

// =====================================================
// GET MY RESTAURANT CATEGORIES
// =====================================================

export const getMyCategories =
  async (
    token: string,
  ): Promise<Category[]> => {
    if (!token) {
      throw new Error(
        'Authentication token is missing',
      );
    }

    try {
      console.log(
        'Fetching owner categories...',
      );

      const response =
        await fetchWithTimeout(
          `${API_BASE_URL}/categories/my`,
          {
            method: 'GET',

            headers: {
              Accept:
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },
          },
        );

      console.log(
        'Categories API status:',
        response.status,
      );

      const data =
        (await response.json()) as
          CategoriesResponse;

      console.log(
        'Categories response:',
        data,
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to fetch categories',
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            'Failed to fetch categories',
        );
      }

      return data.categories || [];

    } catch (error: any) {
      console.log(
        'getMyCategories error:',
        error,
      );

      if (
        error?.name ===
        'AbortError'
      ) {
        throw new Error(
          'Category request timed out. Make sure the backend is running.',
        );
      }

      throw error;
    }
  };

// =====================================================
// CREATE CATEGORY
// =====================================================

export const createCategory =
  async (
    token: string,
    categoryData: CategoryData,
  ): Promise<Category> => {
    if (!token) {
      throw new Error(
        'Authentication token is missing',
      );
    }

    if (
      !categoryData.name?.trim()
    ) {
      throw new Error(
        'Category name is required',
      );
    }

    try {
      console.log(
        'Creating category:',
        categoryData,
      );

      const response =
        await fetchWithTimeout(
          `${API_BASE_URL}/categories`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Accept:
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(
                categoryData,
              ),
          },
        );

      console.log(
        'Create category status:',
        response.status,
      );

      const data =
        (await response.json()) as
          CategoryResponse;

      console.log(
        'Create category response:',
        data,
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to create category',
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            'Failed to create category',
        );
      }

      if (!data.category) {
        throw new Error(
          'Category was created but no category data was returned.',
        );
      }

      return data.category;

    } catch (error: any) {
      console.log(
        'createCategory error:',
        error,
      );

      if (
        error?.name ===
        'AbortError'
      ) {
        throw new Error(
          'Category request timed out.',
        );
      }

      throw error;
    }
  };

// =====================================================
// UPDATE CATEGORY
// =====================================================

export const updateCategory =
  async (
    token: string,
    categoryId: string,
    categoryData:
      Partial<CategoryData>,
  ): Promise<Category> => {
    if (!token) {
      throw new Error(
        'Authentication token is missing',
      );
    }

    if (!categoryId) {
      throw new Error(
        'Category ID is required',
      );
    }

    try {
      const response =
        await fetchWithTimeout(
          `${API_BASE_URL}/categories/${categoryId}`,
          {
            method: 'PUT',

            headers: {
              'Content-Type':
                'application/json',

              Accept:
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(
                categoryData,
              ),
          },
        );

      const data =
        (await response.json()) as
          CategoryResponse;

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to update category',
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            'Failed to update category',
        );
      }

      if (!data.category) {
        throw new Error(
          'Updated category data was not returned.',
        );
      }

      return data.category;

    } catch (error: any) {
      console.log(
        'updateCategory error:',
        error,
      );

      if (
        error?.name ===
        'AbortError'
      ) {
        throw new Error(
          'Category request timed out.',
        );
      }

      throw error;
    }
  };

// =====================================================
// DELETE CATEGORY
// =====================================================

export const deleteCategory =
  async (
    token: string,
    categoryId: string,
  ): Promise<void> => {
    if (!token) {
      throw new Error(
        'Authentication token is missing',
      );
    }

    if (!categoryId) {
      throw new Error(
        'Category ID is required',
      );
    }

    try {
      const response =
        await fetchWithTimeout(
          `${API_BASE_URL}/categories/${categoryId}`,
          {
            method: 'DELETE',

            headers: {
              Accept:
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },
          },
        );

      const data =
        (await response.json()) as {
          success: boolean;
          message?: string;
        };

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to delete category',
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            'Failed to delete category',
        );
      }

    } catch (error: any) {
      console.log(
        'deleteCategory error:',
        error,
      );

      if (
        error?.name ===
        'AbortError'
      ) {
        throw new Error(
          'Category request timed out.',
        );
      }

      throw error;
    }
  };

// =====================================================
// TOGGLE CATEGORY STATUS
// =====================================================

export const updateCategoryStatus =
  async (
    token: string,
    categoryId: string,
    isActive: boolean,
  ): Promise<Category> => {
    if (!token) {
      throw new Error(
        'Authentication token is missing',
      );
    }

    if (!categoryId) {
      throw new Error(
        'Category ID is required',
      );
    }

    try {
      const response =
        await fetchWithTimeout(
          `${API_BASE_URL}/categories/${categoryId}/status`,
          {
            method: 'PATCH',

            headers: {
              'Content-Type':
                'application/json',

              Accept:
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                isActive,
              }),
          },
        );

      const data =
        (await response.json()) as
          CategoryResponse;

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to update category status',
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            'Failed to update category status',
        );
      }

      if (!data.category) {
        throw new Error(
          'Updated category data was not returned.',
        );
      }

      return data.category;

    } catch (error: any) {
      console.log(
        'updateCategoryStatus error:',
        error,
      );

      if (
        error?.name ===
        'AbortError'
      ) {
        throw new Error(
          'Category request timed out.',
        );
      }

      throw error;
    }
  };
