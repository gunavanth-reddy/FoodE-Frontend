// =====================================================
// ADMIN SERVICE
// =====================================================

const API_BASE_URL =
  'https://foode-backend-vn67.onrender.com/api';

// =====================================================
// TYPES
// =====================================================

export interface AdminDashboardStats {
  totalUsers: number;
  totalRestaurantOwners: number;
  totalRestaurants: number;
  pendingRestaurants: number;
  approvedRestaurants: number;
  activeRestaurants: number;
}

export interface AdminOrderStats {
  orders: {
    total: number;
    today: number;
    active: number;
    delivered: number;
    cancelled: number;
  };
  revenue: {
    today: number;
    total: number;
  };
}

interface DashboardResponse {
  success: boolean;
  stats?: AdminDashboardStats;
  message?: string;
}

interface OrderStatsResponse {
  success: boolean;
  stats?: AdminOrderStats;
  message?: string;
}

const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = 15000,
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

const readJson = async (response: Response): Promise<any> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const handleCommonError = (
  response: Response,
  data: any,
  resource: string,
) => {
  if (response.status === 401) {
    throw new Error('Session expired. Please login again.');
  }

  if (response.status === 403) {
    throw new Error(
      `Admin permission required to access ${resource}.`,
    );
  }

  if (response.status === 404) {
    throw new Error(
      `${resource} endpoint was not found on the backend. Check the admin route.`,
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Failed to fetch ${resource} (${response.status}).`,
    );
  }
};

// =====================================================
// DASHBOARD
// =====================================================

export const getAdminDashboardStats = async (
  token: string,
): Promise<AdminDashboardStats> => {
  if (!token) {
    throw new Error('Authentication token is missing.');
  }

  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/dashboard`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data =
      (await readJson(response)) as DashboardResponse;

    handleCommonError(response, data, 'admin dashboard');

    if (!data?.success || !data?.stats) {
      throw new Error(
        data?.message ||
          'The backend returned an invalid admin dashboard response.',
      );
    }

    return data.stats;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error(
        'Dashboard request timed out. Please try again.',
      );
    }

    throw error;
  }
};

// =====================================================
// ORDERS / REVENUE
// =====================================================

export const getAdminOrderStats = async (
  token: string,
): Promise<AdminOrderStats> => {
  if (!token) {
    throw new Error('Authentication token is missing.');
  }

  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/dashboard/orders`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data =
      (await readJson(response)) as OrderStatsResponse;

    // IMPORTANT:
    // Never return fake zero values when the endpoint is missing.
    // The dashboard must always show real backend data.
    handleCommonError(
      response,
      data,
      'admin order statistics',
    );

    if (!data?.success || !data?.stats) {
      throw new Error(
        data?.message ||
          'The backend returned an invalid admin order statistics response.',
      );
    }

    return data.stats;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error(
        'Order statistics request timed out. Please try again.',
      );
    }

    throw error;
  }
};
