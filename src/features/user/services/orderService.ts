// =====================================================
// USER ORDER SERVICE
// =====================================================

const API_BASE_URL =
  'https://foode.site/api';

// =====================================================
// TYPES
// =====================================================

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'DELIVERED';

// =====================================================
// ORDER ITEM
// =====================================================

export interface OrderItem {
  food:
    | string
    | {
        _id: string;
        name?: string;
        image?: string;
        price?: number;
        discountedPrice?: number;
      };

  name: string;

  quantity: number;

  price: number;

  discountedPrice?: number | null;

  total: number;
}

// =====================================================
// RESTAURANT
// =====================================================

export interface Restaurant {
  _id: string;
  name?: string;
  logo?: string;
  phone?: string;
  address?: string;
}

// =====================================================
// DELIVERY ADDRESS
// =====================================================

export interface DeliveryAddress {
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  state?: string;
  pincode?: string;
}

// =====================================================
// AVAILABLE DELIVERY SLOT
// =====================================================

export interface AvailableDeliverySlot {
  _id: string;
  restaurant?: string;
  date?: string;
  durationMinutes?: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  cutoffMinutes?: number;
  cutoffTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

// =====================================================
// SAVED ORDER DELIVERY SLOT
// =====================================================

export interface OrderDeliverySlot {
  slotId: string;
  date?: string;
  durationMinutes?: number;
  startTime: string;
  endTime: string;
}

// =====================================================
// USER ORDER
// =====================================================

export interface UserOrder {
  _id: string;

  orderNumber: string;

  user: string;

  restaurant:
    | string
    | Restaurant;

  items: OrderItem[];

  deliveryAddress: DeliveryAddress;

  deliverySlot: OrderDeliverySlot;

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
// CREATE ORDER
// =====================================================

export interface CreateOrderData {
  deliveryAddress: DeliveryAddress;

  deliverySlot: OrderDeliverySlot;

  paymentMethod?: 'COD' | 'ONLINE';

  customerNote?: string;
}

// =====================================================
// CREATE ORDER RESPONSE
// =====================================================

interface CreateOrderResponse {
  success: boolean;

  message?: string;

  order?: UserOrder;
}

// =====================================================
// ORDERS RESPONSE
// =====================================================

interface OrdersResponse {
  success: boolean;

  count?: number;

  orders?: UserOrder[];

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
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

// =====================================================
// SAFE NUMBER
// =====================================================

const toNumber = (
  value: any,
  fallback = 0,
): number => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

// =====================================================
// NORMALIZE ORDER ITEM
// =====================================================

const normalizeOrderItem = (
  item: any,
): OrderItem => {
  const quantity = Math.max(
    1,
    toNumber(item?.quantity, 1),
  );

  // ---------------------------------------------------
  // FOOD OBJECT
  // ---------------------------------------------------

  const food =
    item?.food &&
    typeof item.food === 'object'
      ? item.food
      : null;

  // ---------------------------------------------------
  // ORIGINAL PRICE
  // ---------------------------------------------------

  const price = toNumber(
    item?.price ??
      item?.foodPrice ??
      food?.price ??
      0,
  );

  // ---------------------------------------------------
  // DISCOUNTED PRICE
  // ---------------------------------------------------

  const rawDiscountedPrice =
    item?.discountedPrice ??
    item?.food?.discountedPrice ??
    null;

  const discountedPrice =
    rawDiscountedPrice !== null &&
    rawDiscountedPrice !== undefined &&
    Number.isFinite(
      Number(rawDiscountedPrice),
    )
      ? Number(rawDiscountedPrice)
      : null;

  // ---------------------------------------------------
  // EFFECTIVE PRICE
  // ---------------------------------------------------

  const effectivePrice =
    discountedPrice !== null &&
    discountedPrice >= 0
      ? discountedPrice
      : price;

  // ---------------------------------------------------
  // ITEM TOTAL
  // ---------------------------------------------------

  const backendTotal =
    Number(item?.total);

  const total =
    Number.isFinite(backendTotal) &&
    backendTotal >= 0
      ? backendTotal
      : effectivePrice * quantity;

  // ---------------------------------------------------
  // FOOD NAME
  // ---------------------------------------------------

  const name =
    item?.name ||
    food?.name ||
    'Food Item';

  return {
    food:
      item?.food ||
      '',

    name,

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
): UserOrder => {
  const items = Array.isArray(
    order?.items,
  )
    ? order.items.map(
        normalizeOrderItem,
      )
    : [];

  // ---------------------------------------------------
  // ITEM SUBTOTAL
  // ---------------------------------------------------

  const calculatedSubtotal = items.reduce(
  (sum: number, item: any): number =>
    sum + Number(item.total || 0),
  0,
);

  // ---------------------------------------------------
  // BACKEND SUBTOTAL
  // ---------------------------------------------------

  const backendSubtotal =
    Number(order?.subtotal);

  const subtotal =
    Number.isFinite(
      backendSubtotal,
    ) &&
    backendSubtotal >= 0
      ? backendSubtotal
      : calculatedSubtotal;

  // ---------------------------------------------------
  // DELIVERY FEE
  // ---------------------------------------------------

  const deliveryFee =
    toNumber(
      order?.deliveryFee,
      0,
    );

  // ---------------------------------------------------
  // DISCOUNT
  // ---------------------------------------------------

  const discount =
    toNumber(
      order?.discount,
      0,
    );

  // ---------------------------------------------------
  // TOTAL
  // ---------------------------------------------------

  const backendTotal =
    Number(order?.total);

  const calculatedTotal =
    subtotal +
    deliveryFee -
    discount;

  const total =
    Number.isFinite(
      backendTotal,
    ) &&
    backendTotal >= 0
      ? backendTotal
      : calculatedTotal;

  return {
    ...order,

    items,

    subtotal,

    deliveryFee,

    discount,

    total,

    status:
      order?.status ===
      'CONFIRMED'
        ? 'CONFIRMED'
        : order?.status ===
          'DELIVERED'
          ? 'DELIVERED'
          : 'PLACED',
  };
};

// =====================================================
// CREATE ORDER
// =====================================================

export const createOrder = async (
  token: string,
  orderData: CreateOrderData,
): Promise<UserOrder> => {
  if (!token) {
    throw new Error(
      'Authentication token is missing.',
    );
  }

  if (!orderData?.deliveryAddress) {
    throw new Error(
      'Delivery address is required.',
    );
  }

  if (!orderData?.deliverySlot) {
    throw new Error(
      'Delivery slot is required.',
    );
  }

  if (
    !orderData.deliverySlot.slotId
  ) {
    throw new Error(
      'Delivery slot ID is required.',
    );
  }

  try {
    console.log(
      'Creating FoodE order...',
    );

    const response =
      await fetchWithTimeout(
        `${API_BASE_URL}/orders`,
        {
          method: 'POST',

          headers: {
            Accept:
              'application/json',

            'Content-Type':
              'application/json',

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            deliveryAddress:
              orderData.deliveryAddress,

            deliverySlot: {
              slotId: orderData.deliverySlot.slotId,
              date: orderData.deliverySlot.date,
              startTime: orderData.deliverySlot.startTime,
              endTime: orderData.deliverySlot.endTime,
              durationMinutes: orderData.deliverySlot.durationMinutes,
            },

            paymentMethod:
              orderData.paymentMethod ||
              'COD',

            customerNote:
              orderData.customerNote ||
              '',
          }),
        },
      );

    const data =
      (await response.json()) as
        CreateOrderResponse;

    console.log(
      'Create order response:',
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
          'Failed to place order.',
      );
    }

    if (!data.success) {
      throw new Error(
        data.message ||
          'Failed to place order.',
      );
    }

    if (!data.order) {
      throw new Error(
        'Order was created but no order details were returned.',
      );
    }

    return normalizeOrder(
      data.order,
    );
  } catch (error: any) {
    console.log(
      'createOrder error:',
      error,
    );

    if (
      error?.name ===
      'AbortError'
    ) {
      throw new Error(
        'Order request timed out. Make sure the backend is running.',
      );
    }

    throw error;
  }
};

// =====================================================
// GET MY ORDERS
// =====================================================

export const getMyOrders = async (
  token: string,
): Promise<UserOrder[]> => {
  if (!token) {
    throw new Error(
      'Authentication token is missing.',
    );
  }

  try {
    const response =
      await fetchWithTimeout(
        `${API_BASE_URL}/orders/my`,
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

    const data =
      (await response.json()) as
        OrdersResponse;

    console.log(
      'My orders response:',
      JSON.stringify(
        data,
        null,
        2,
      ),
    );

    if (response.status === 401) {
      throw new Error(
        'Authentication expired. Please login again.',
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          'Failed to fetch orders.',
      );
    }

    if (!data.success) {
      throw new Error(
        data.message ||
          'Failed to fetch orders.',
      );
    }

    const orders =
      Array.isArray(data.orders)
        ? data.orders.map(
            normalizeOrder,
          )
        : [];

    console.log(
      'Normalized orders:',
      JSON.stringify(
        orders,
        null,
        2,
      ),
    );

    return orders;
  } catch (error: any) {
    console.log(
      'getMyOrders error:',
      error,
    );

    if (
      error?.name ===
      'AbortError'
    ) {
      throw new Error(
        'Orders request timed out. Make sure the backend is running.',
      );
    }

    throw error;
  }
};

// =====================================================
// GET SINGLE ORDER
// =====================================================

export const getMyOrderById =
  async (
    token: string,
    orderId: string,
  ): Promise<UserOrder> => {
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

    try {
      const response =
        await fetchWithTimeout(
          `${API_BASE_URL}/orders/${orderId}`,
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

      const data =
        (await response.json()) as {
          success: boolean;
          order?: UserOrder;
          message?: string;
        };

      if (
        response.status === 401
      ) {
        throw new Error(
          'Authentication expired. Please login again.',
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to fetch order.',
        );
      }

      if (!data.order) {
        throw new Error(
          'Order not found.',
        );
      }

      return normalizeOrder(
        data.order,
      );
    } catch (error: any) {
      console.log(
        'getMyOrderById error:',
        error,
      );

      if (
        error?.name ===
        'AbortError'
      ) {
        throw new Error(
          'Order request timed out.',
        );
      }

      throw error;
    }
  };
