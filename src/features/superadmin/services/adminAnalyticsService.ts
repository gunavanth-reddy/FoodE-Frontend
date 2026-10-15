import API_BASE_URL from '../../../config/api';

export interface AnalyticsSummary {
  orders: number;
  sales: number;
  foodEarnings: number;
}

export interface AdminOverview {
  success: boolean;
  commissionPerOrder: number;
  overview: {
    totalRestaurants: number;
    allTime: AnalyticsSummary;
    thisWeek: AnalyticsSummary;
    thisMonth: AnalyticsSummary;
  };
}

export interface RestaurantOwner {id: string; name: string; phone: string}

export interface RestaurantAnalytics {
  restaurant: {id: string; name: string; logo?: string};
  owner: RestaurantOwner;
  thisWeek: AnalyticsSummary;
  thisMonth: AnalyticsSummary;
}

export interface WeeklyAnalytics extends AnalyticsSummary {week: number; from: string; to: string}

export interface SingleRestaurantAnalytics {
  success: boolean;
  commissionPerOrder: number;
  restaurant: {id: string; name: string; logo?: string};
  owner: RestaurantOwner;
  monthly: AnalyticsSummary;
  weeks: WeeklyAnalytics[];
  days?: Array<{date: string; orders: number; sales: number; foodEarnings?: number}>;
}

const makeRequest = async <T>(endpoint: string, token: string): Promise<T> => {
  if (!token) throw new Error('Authentication token is missing.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {Accept: 'application/json', Authorization: `Bearer ${token}`},
      signal: controller.signal,
    });

    let data: any = null;
    try { data = await response.json(); } catch { data = null; }

    if (response.status === 401) throw new Error('Session expired. Please login again.');
    if (response.status === 403) throw new Error('Access denied. Admin permission required.');
    if (!response.ok) throw new Error(data?.message || `Request failed (${response.status}).`);
    return data as T;
  } catch (error: any) {
    if (error?.name === 'AbortError') throw new Error('Request timed out. Please try again.');
    if (String(error?.message || '').includes('Network request failed')) throw new Error('Unable to connect to FoodE server.');
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

export const getAdminOverview = (token: string) =>
  makeRequest<AdminOverview>('/admin/analytics/overview', token);

export const getRestaurantAnalytics = async (token: string): Promise<RestaurantAnalytics[]> => {
  const response = await makeRequest<any>('/admin/analytics/restaurants', token);
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.restaurants)) return response.restaurants;
  return [];
};

export const getSingleRestaurantAnalytics = (token: string, restaurantId: string) => {
  if (!restaurantId) throw new Error('Restaurant ID is required.');
  return makeRequest<SingleRestaurantAnalytics>(
    `/admin/analytics/restaurant/${restaurantId}?period=month&includeDaily=true`,
    token,
  );
};

export default {getAdminOverview, getRestaurantAnalytics, getSingleRestaurantAnalytics};
