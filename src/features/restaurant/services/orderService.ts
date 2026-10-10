// =====================================================
// RESTAURANT OWNER ORDER SERVICE
// =====================================================

const API_BASE_URL = 'https://foode-backend-vn67.onrender.com/api';

// =====================================================
// ORDER STATUS
// =====================================================

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'DELIVERED';

// =====================================================
// FOOD
// =====================================================

export interface RestaurantOrderFood {
  _id: string;
  name?: string;
  image?: string;
  price?: number;
}

// =====================================================
// ORDER ITEM
// =====================================================

export interface RestaurantOrderItem {
  food:
    | string
    | RestaurantOrderFood;

  name: string;

  quantity: number;

  price: number;

  discountedPrice?: number | null;

  total: number;
}

// =====================================================
// CUSTOMER
// =====================================================

export interface RestaurantOrderUser {
  _id: string;

  name?: string;

  username?: string;

  phone?: string;

  email?: string;
}

// =====================================================
// DELIVERY ADDRESS
// =====================================================

export interface RestaurantOrderDeliveryAddress {
  name: string;

  phone: string;

  addressLine: string;

  city: string;

  state?: string;

  pincode?: string;
}

// =====================================================
// DELIVERY SLOT
// =====================================================

export interface RestaurantOrderDeliverySlot {
  slotId:
    | string
    | {
        _id?: string;
        startTime?: string;
        endTime?: string;
      };

  startTime: string;

  endTime: string;
}

// =====================================================
// RESTAURANT
// =====================================================

export interface RestaurantOrderRestaurant {
  _id: string;

  name?: string;

  logo?: string;

  phone?: string;

  address?: string;

  deliveryFee?: number;
}

// =====================================================
// RESTAURANT ORDER
// =====================================================

export interface RestaurantOrder {
  _id: string;

  orderNumber: string;

  user:
    | string
    | RestaurantOrderUser;

  restaurant:
    | string
    | RestaurantOrderRestaurant;

  items: RestaurantOrderItem[];

  deliveryAddress: RestaurantOrderDeliveryAddress;

  deliverySlot: RestaurantOrderDeliverySlot;

  subtotal: number;

  deliveryFee: number;

  discount: number;

  total: number;

  paymentMethod:
    | 'COD'
    | 'ONLINE';

  paymentStatus:
    | 'PENDING'
    | 'PAID'
    | 'FAILED'
    | 'REFUNDED';

  status: OrderStatus;

  customerNote?: string;

  confirmedAt?: string | null;

  deliveredAt?: string | null;

  createdAt: string;

  updatedAt: string;
}

// =====================================================
// API RESPONSE
// =====================================================

interface OrdersResponse {
  success: boolean;

  count?: number;

  orders?: RestaurantOrder[];

  message?: string;
}

interface UpdateOrderResponse {
  success: boolean;

  message?: string;

  order?: RestaurantOrder;
}

// =====================================================
// FETCH WITH TIMEOUT
// =====================================================

const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = 10000,
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
// NORMALIZE ORDER ITEM
// =====================================================

const normalizeOrderItem = (
  item: any,
): RestaurantOrderItem => {
  const quantity = Number(item?.quantity ?? 0);

  const price = Number(
    item?.price ??
      item?.food?.price ??
      0,
  );

  const discountedPrice =
    item?.discountedPrice !== null &&
    item?.discountedPrice !== undefined
      ? Number(item.discountedPrice)
      : null;

  const effectivePrice =
    discountedPrice !== null &&
    Number.isFinite(discountedPrice)
      ? discountedPrice
      : price;

  // Always calculate from the unit price and quantity.
  // Do not trust a stale/missing item.total from the API.
  const total =
    Math.max(0, effectivePrice) *
    Math.max(0, quantity);

  const foodName =
    typeof item?.food === 'object'
      ? item.food?.name
      : undefined;

  return {
    food: item?.food ?? '',

    name:
      item?.name ||
      foodName ||
      'Food Item',

    quantity,

    price,

    discountedPrice,

    total,
  };
};

// =====================================================
// NORMALIZE ORDER
// =====================================================

const normalizeOrder = (
  order: any,
): RestaurantOrder => {
  const items = Array.isArray(order?.items)
    ? order.items.map(normalizeOrderItem)
    : [];

  // Calculate the subtotal from the actual order items.
  // This guarantees the owner screen receives a valid subtotal.
 const calculatedSubtotal = items.reduce(
  (sum: number, item: any) =>
    sum +
    Number(item.price || 0) *
      Number(item.quantity || 0),
  0,
);
  const deliveryFeeValue = Number(
    order?.deliveryFee ?? 0,
  );

  const discountValue = Number(
    order?.discount ?? 0,
  );

  const subtotal =
    Number.isFinite(calculatedSubtotal)
      ? Math.max(0, calculatedSubtotal)
      : 0;

  const deliveryFee =
    Number.isFinite(deliveryFeeValue)
      ? Math.max(0, deliveryFeeValue)
      : 0;

  const discount =
    Number.isFinite(discountValue)
      ? Math.max(0, discountValue)
      : 0;

  // FoodE total = subtotal + delivery fee - discount.
  const total = Math.max(
    0,
    subtotal + deliveryFee - discount,
  );

  return {
    ...order,

    items,

    subtotal,

    deliveryFee,

    discount,

    total,

    status:
      order?.status === 'CONFIRMED'
        ? 'CONFIRMED'
        : order?.status === 'DELIVERED'
          ? 'DELIVERED'
          : 'PLACED',
  };
};

// =====================================================
// NORMALIZE ORDERS
// =====================================================

const normalizeOrders = (
  orders: any[],
): RestaurantOrder[] => {
  if (!Array.isArray(orders)) {
    return [];
  }

  return orders.map(normalizeOrder);
};

// =====================================================
// GET RESTAURANT ORDERS
// =====================================================

export const getRestaurantOrders = async (
  token: string,
): Promise<RestaurantOrder[]> => {
  if (!token) {
    throw new Error(
      'Authentication token is missing.',
    );
  }

  try {
    console.log(
      'FoodE: Fetching restaurant orders...',
    );

    const response =
      await fetchWithTimeout(
        `${API_BASE_URL}/orders/restaurant/my`,
        {
          method: 'GET',

          headers: {
            Accept: 'application/json',

            Authorization:
              `Bearer ${token}`,
          },
        },
      );

    const data =
      (await response.json()) as OrdersResponse;

    console.log(
      'Restaurant orders status:',
      response.status,
    );

    console.log(
      'Restaurant orders response:',
      data,
    );

    if (response.status === 401) {
      throw new Error(
        'Authentication expired. Please login again.',
      );
    }

    if (response.status === 403) {
      throw new Error(
        'You are not authorized to access restaurant orders.',
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          'Failed to fetch restaurant orders.',
      );
    }

    if (!data.success) {
      throw new Error(
        data.message ||
          'Failed to fetch restaurant orders.',
      );
    }

    // IMPORTANT:
    // Normalize every item before sending
    // data to the owner screen.
    return normalizeOrders(
      data.orders || [],
    );
  } catch (error: any) {
    console.log(
      'getRestaurantOrders error:',
      error,
    );

    if (
      error?.name === 'AbortError'
    ) {
      throw new Error(
        'Orders request timed out. Make sure the backend is running.',
      );
    }

    throw error;
  }
};

// =====================================================
// UPDATE ORDER STATUS
//
// OWNER FLOW:
//
// PLACED
//    ↓
// CONFIRMED
//    ↓
// DELIVERED
// =====================================================

export const updateOrderStatus = async (
  token: string,
  orderId: string,
  status: OrderStatus,
): Promise<RestaurantOrder> => {
  if (!token) {
    throw new Error(
      'Authentication token is missing.',
    );
  }

  if (!orderId) {
    throw new Error(
      'Order ID is required.',
    );
  }

  if (!status) {
    throw new Error(
      'Order status is required.',
    );
  }

  // Only these statuses can be set
  // by restaurant owner.
  const allowedStatuses: OrderStatus[] = [
    'CONFIRMED',
    'DELIVERED',
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error(
      'Invalid order status.',
    );
  }

  try {
    console.log(
      'FoodE: Updating order status...',
      {
        orderId,
        status,
      },
    );

    const response =
      await fetchWithTimeout(
        `${API_BASE_URL}/orders/restaurant/${orderId}/status`,
        {
          method: 'PATCH',

          headers: {
            Accept:
              'application/json',

            'Content-Type':
              'application/json',

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            status,
          }),
        },
      );

    const data =
      (await response.json()) as
        UpdateOrderResponse;

    console.log(
      'Update order status:',
      response.status,
    );

    console.log(
      'Update order response:',
      data,
    );

    if (response.status === 401) {
      throw new Error(
        'Authentication expired. Please login again.',
      );
    }

    if (response.status === 403) {
      throw new Error(
        'You are not authorized to update restaurant orders.',
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          'Failed to update order status.',
      );
    }

    if (!data.success) {
      throw new Error(
        data.message ||
          'Failed to update order status.',
      );
    }

    if (!data.order) {
      throw new Error(
        'Order status was updated but no order details were returned.',
      );
    }

    // Normalize returned order too.
    return normalizeOrder(
      data.order,
    );
  } catch (error: any) {
    console.log(
      'updateOrderStatus error:',
      error,
    );

    if (
      error?.name === 'AbortError'
    ) {
      throw new Error(
        'Update request timed out. Make sure the backend is running.',
      );
    }

    throw error;
  }
};

// =====================================================
// CONFIRM ORDER
// PLACED → CONFIRMED
// =====================================================

export const confirmOrder = async (
  token: string,
  orderId: string,
): Promise<RestaurantOrder> => {
  return updateOrderStatus(
    token,
    orderId,
    'CONFIRMED',
  );
};

// =====================================================
// MARK ORDER DELIVERED
// CONFIRMED → DELIVERED
// =====================================================

export const markOrderDelivered =
  async (
    token: string,
    orderId: string,
  ): Promise<RestaurantOrder> => {
    return updateOrderStatus(
      token,
      orderId,
      'DELIVERED',
    );
  };
