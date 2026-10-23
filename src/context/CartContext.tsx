import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
} from 'react-native';

import {useAuth} from './AuthContext';
import {navigationRef} from '../navigation/navigationRef';

// =====================================================
// API
// =====================================================

import API_BASE_URL from '../config/api';

// =====================================================
// CONSTANTS
// =====================================================

const PLATFORM_CHARGE = 0; // FoodE does not charge a platform fee.

// =====================================================
// TYPES
// =====================================================

export interface CartFood {
  _id: string;

  name: string;

  description?: string;

  image?: string;

  price: number;

  discountedPrice?: number | null;

  isAvailable?: boolean;

  rating?: number;
}

export interface CartRestaurant {
  _id: string;

  name: string;

  logo?: string;

  deliveryFee?: number;
}

export interface CartItem {
  id: string;

  foodId: string;

  name: string;

  image?: string;

  price: number;

  originalPrice?: number;

  description?: string;

  quantity: number;

  restaurantId: string;

  restaurantName?: string;

  rating?: number;
}

// =====================================================
// BACKEND TYPES
// =====================================================

interface BackendCartItem {
  food:
    | CartFood
    | string;

  quantity: number;

  price: number;

  discountedPrice?:
    | number
    | null;
}

interface BackendCart {
  _id: string;

  restaurant:
    | CartRestaurant
    | string;

  items: BackendCartItem[];

  subtotal: number;

  deliveryFee: number;

  platformCharge?: number;

  total: number;
}

interface CartResponse {
  success: boolean;

  message?: string;

  cart?: BackendCart | null;
}

// =====================================================
// CONTEXT TYPE
// =====================================================

interface CartContextType {
  items: CartItem[];

  totalAmount: number;

  subtotal: number;

  deliveryFee: number;

  platformCharge: number;

  restaurant:
    | CartRestaurant
    | null;

  loading: boolean;

  error: string | null;

  refreshCart: () => Promise<void>;

  addItem: (
    item: any,
    quantity?: number,
    force?: boolean,
  ) => Promise<boolean>;

  increase: (
    foodId: string,
  ) => Promise<void>;

  decrease: (
    foodId: string,
  ) => Promise<void>;

  removeItem: (
    foodId: string,
  ) => Promise<void>;

  clearCart: () => Promise<boolean>;

  getQuantity: (
    foodId: string,
  ) => number;

  isInCart: (
    foodId: string,
  ) => boolean;
}

// =====================================================
// CONTEXT
// =====================================================

const CartContext =
  createContext<CartContextType | null>(
    null,
  );

// =====================================================
// PROVIDER
// =====================================================

export const CartProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const {
    token,
    isLoggedIn,
    loading: authLoading,
  } = useAuth();

  // ===================================================
  // STATE
  // ===================================================

  const [
    items,
    setItems,
  ] = useState<CartItem[]>([]);

  const [
    subtotal,
    setSubtotal,
  ] = useState(0);

  const [
    deliveryFee,
    setDeliveryFee,
  ] = useState(0);

  const [
    platformCharge,
    setPlatformCharge,
  ] = useState(PLATFORM_CHARGE);

  const [
    totalAmount,
    setTotalAmount,
  ] = useState(0);

  const [
    restaurant,
    setRestaurant,
  ] = useState<CartRestaurant | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  // ===================================================
  // AUTH HEADERS
  // ===================================================

  const getHeaders =
    useCallback(() => {
      const headers: Record<
        string,
        string
      > = {
        Accept:
          'application/json',

        'Content-Type':
          'application/json',
      };

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      return headers;
    }, [token]);

  // ===================================================
  // NORMALIZE CART
  // ===================================================

  const normalizeCart = useCallback(
    (
      cart:
        | BackendCart
        | null
        | undefined,
    ) => {

      // ===============================================
      // EMPTY CART
      // ===============================================

      if (!cart) {
        setItems([]);

        setSubtotal(0);

        setDeliveryFee(0);

        setPlatformCharge(
          PLATFORM_CHARGE,
        );

        setTotalAmount(0);

        setRestaurant(null);

        return;
      }

      // ===============================================
      // RESTAURANT
      // ===============================================

      const backendRestaurant =
        typeof cart.restaurant ===
        'object'
          ? cart.restaurant
          : null;

      const restaurantId =
        typeof cart.restaurant ===
        'string'
          ? cart.restaurant
          : backendRestaurant?._id || '';

      // ===============================================
      // ITEMS
      // ===============================================

      const normalizedItems: CartItem[] =
        (Array.isArray(cart.items) ? cart.items : []).map(item => {
          const food: any =
            item.food && typeof item.food === 'object'
              ? item.food
              : null;

          const foodId =
            typeof item.food === 'string'
              ? item.food
              : String(food?._id || '');

          // Support common backend/Cloudinary image field names.
          const rawImage =
            food?.image ??
            food?.imageUrl ??
            food?.photo ??
            food?.images?.[0] ??
            '';

          const image =
            typeof rawImage === 'string'
              ? rawImage
              : typeof rawImage?.url === 'string'
                ? rawImage.url
                : typeof rawImage?.secure_url === 'string'
                  ? rawImage.secure_url
                  : '';

          // Prefer the cart's saved price, then the food's current price.
          const savedDiscount = Number(item.discountedPrice) || 0;
          const savedPrice = Number(item.price) || 0;
          const foodDiscount = Number(food?.discountedPrice) || 0;
          const foodPrice = Number(food?.price) || 0;

          const finalPrice =
            savedDiscount > 0
              ? savedDiscount
              : savedPrice > 0
                ? savedPrice
                : foodDiscount > 0
                  ? foodDiscount
                  : foodPrice;

          const quantity = Math.max(0, Number(item.quantity) || 0);
          const originalPrice = foodPrice || savedPrice;

          return {
            id: foodId,
            foodId,
            name: food?.name || food?.title || 'Food Item',
            image,
            price: finalPrice,
            originalPrice:
              originalPrice > finalPrice ? originalPrice : undefined,
            description: food?.description || '',
            quantity,
            restaurantId,
            restaurantName: backendRestaurant?.name,
            rating: Number(food?.rating) || 0,
          };
        });

      // ===============================================
      // SAVE ITEMS
      // ===============================================

      setItems(
        normalizedItems,
      );

      // ===============================================
      // SUBTOTAL
      // ===============================================

      // Calculate from cart lines instead of trusting a possibly stale
      // or missing subtotal returned by the backend.
      const calculatedSubtotal = normalizedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      setSubtotal(calculatedSubtotal);

      // ===============================================
      // DELIVERY FEE
      // ===============================================

      const calculatedDeliveryFee = Number(
        cart.deliveryFee ?? backendRestaurant?.deliveryFee ?? 0,
      ) || 0;

      setDeliveryFee(calculatedDeliveryFee);

      // ===============================================
      // PLATFORM CHARGE
      // ===============================================

      // Platform charges are disabled in FoodE.
      setPlatformCharge(0);

      // ===============================================
      // TOTAL
      // ===============================================

      // Total is item subtotal + delivery fee only.
      setTotalAmount(calculatedSubtotal + calculatedDeliveryFee);

      // ===============================================
      // RESTAURANT
      // ===============================================

      setRestaurant(
        backendRestaurant,
      );
    },
    [],
  );

  // ===================================================
  // GET CART
  // ===================================================

  const refreshCart =
    useCallback(async () => {

      if (
        authLoading ||
        !isLoggedIn ||
        !token
      ) {
        setItems([]);

        setSubtotal(0);

        setDeliveryFee(0);

        setPlatformCharge(
          PLATFORM_CHARGE,
        );

        setTotalAmount(0);

        setRestaurant(null);

        return;
      }

      try {

        setLoading(true);

        setError(null);

        const response =
          await fetch(
            `${API_BASE_URL}/cart`,
            {
              method: 'GET',

              headers:
                getHeaders(),
            },
          );

        const data =
          (await response.json()) as
            CartResponse;

        if (!response.ok) {
          throw new Error(
            data.message ||
              'Unable to load cart.',
          );
        }

        if (!data.success) {
          throw new Error(
            data.message ||
              'Unable to load cart.',
          );
        }

        normalizeCart(
          data.cart,
        );

      } catch (err: any) {

        console.log(
          'FoodE get cart error:',
          err,
        );

        setError(
          err?.message ||
            'Unable to load cart.',
        );

      } finally {

        setLoading(false);
      }

    }, [
      authLoading,
      isLoggedIn,
      token,
      getHeaders,
      normalizeCart,
    ]);

  // ===================================================
  // LOAD CART AFTER LOGIN
  // ===================================================

  useEffect(() => {

    if (
      !authLoading &&
      isLoggedIn &&
      token
    ) {
      refreshCart();
    }

    if (
      !authLoading &&
      !isLoggedIn
    ) {

      setItems([]);

      setSubtotal(0);

      setDeliveryFee(0);

      setPlatformCharge(
        PLATFORM_CHARGE,
      );

      setTotalAmount(0);

      setRestaurant(null);

      setError(null);
    }

  }, [
    authLoading,
    isLoggedIn,
    token,
    refreshCart,
  ]);

  // ===================================================
  // ADD ITEM
  // ===================================================

  const addItem = async (
    item: any,
    quantity = 1,
    force = false,
  ): Promise<boolean> => {

    if (
      !isLoggedIn ||
      !token
    ) {

      Alert.alert(
        'Login Required',
        'Please login to add food to your cart.',
        [
          {
            text: 'Login Now',
            onPress: () => navigationRef.navigate('Login'),
          },
        ],
      );

      return false;
    }

    // ===============================================
    // FOOD ID
    // ===============================================

    const foodId =
      String(
        item?._id ||
          item?.id ||
          '',
      );

    if (!foodId) {

      Alert.alert(
        'Unable to Add',
        'Food ID is missing.',
      );

      return false;
    }

    // ===============================================
    // RESTAURANT ID
    // ===============================================

    const newRestaurantId =
      String(
        item?.restaurant?._id ||
          item?.restaurantId ||
          item?.restaurant ||
          '',
      );

    // ===============================================
    // ONE RESTAURANT PER CART
    // ===============================================

    if (
      !force &&
      restaurant &&
      items.length > 0 &&
      newRestaurantId &&
      restaurant._id !==
        newRestaurantId
    ) {

      Alert.alert(
        'Your cart is from another restaurant',
        `Your cart already has items from ${restaurant.name}. FoodE keeps one restaurant per cart.`,
        [
          {text: 'Keep Cart', style: 'cancel'},
          {
            text: 'Clear & Add',
            onPress: async () => {
              const cleared = await clearCart();
              if (cleared !== false) {
                await addItem(item, quantity, true);
              }
            },
          },
        ],
      );

      return false;
    }

    try {

      setLoading(true);

      setError(null);

      const response =
        await fetch(
          `${API_BASE_URL}/cart/add`,
          {
            method: 'POST',

            headers:
              getHeaders(),

            body:
              JSON.stringify({
                foodId,

                quantity:
                  Math.max(
                    1,
                    Number(quantity),
                  ),
              }),
          },
        );

      const data =
        (await response.json()) as
          CartResponse;

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Unable to add food to cart.',
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            'Unable to add food to cart.',
        );
      }

      normalizeCart(
        data.cart,
      );

      return true;

    } catch (err: any) {

      console.log(
        'FoodE add cart error:',
        err,
      );

      const message =
        err?.message ||
        'Unable to add food to cart.';

      setError(message);

      if (
        message
          .toLowerCase()
          .includes(
            'another restaurant',
          )
      ) {

        Alert.alert(
          'Your cart is from another restaurant',
          'Clear the current cart to add this food?',
          [
            {text: 'Keep Cart', style: 'cancel'},
            {
              text: 'Clear & Add',
              onPress: async () => {
                const cleared = await clearCart();
                if (cleared !== false) {
                  await addItem(item, quantity, true);
                }
              },
            },
          ],
        );

        return false;
      }

      Alert.alert(
        'Unable to Add',
        message,
      );

      return false;

    } finally {

      setLoading(false);
    }
  };

  // ===================================================
  // UPDATE QUANTITY
  // ===================================================

  const updateQuantity =
    async (
      foodId: string,
      quantity: number,
    ) => {

      if (
        !isLoggedIn ||
        !token
      ) {
        return;
      }

      if (quantity < 1) {

        await removeItem(
          foodId,
        );

        return;
      }

      try {

        setLoading(true);

        setError(null);

        const response =
          await fetch(
            `${API_BASE_URL}/cart/item/${foodId}`,
            {
              method: 'PUT',

              headers:
                getHeaders(),

              body:
                JSON.stringify({
                  quantity,
                }),
            },
          );

        const data =
          (await response.json()) as
            CartResponse;

        if (!response.ok) {
          throw new Error(
            data.message ||
              'Unable to update quantity.',
          );
        }

        if (!data.success) {
          throw new Error(
            data.message ||
              'Unable to update quantity.',
          );
        }

        normalizeCart(
          data.cart,
        );

      } catch (err: any) {

        console.log(
          'FoodE update cart error:',
          err,
        );

        setError(
          err?.message ||
            'Unable to update quantity.',
        );

        Alert.alert(
          'Unable to Update',
          err?.message ||
            'Please try again.',
        );

      } finally {

        setLoading(false);
      }
    };

  // ===================================================
  // INCREASE
  // ===================================================

  const increase = async (
    foodId: string,
  ) => {

    const currentQuantity =
      getQuantity(foodId);

    await updateQuantity(
      foodId,
      currentQuantity + 1,
    );
  };

  // ===================================================
  // DECREASE
  // ===================================================

  const decrease = async (
    foodId: string,
  ) => {

    const currentQuantity =
      getQuantity(foodId);

    if (
      currentQuantity <= 1
    ) {

      await removeItem(
        foodId,
      );

      return;
    }

    await updateQuantity(
      foodId,
      currentQuantity - 1,
    );
  };

  // ===================================================
  // REMOVE ITEM
  // ===================================================

  const removeItem = async (
    foodId: string,
  ) => {

    if (
      !isLoggedIn ||
      !token
    ) {
      return;
    }

    try {

      setLoading(true);

      setError(null);

      const response =
        await fetch(
          `${API_BASE_URL}/cart/item/${foodId}`,
          {
            method: 'DELETE',

            headers:
              getHeaders(),
          },
        );

      const data =
        (await response.json()) as
          CartResponse;

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Unable to remove item.',
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            'Unable to remove item.',
        );
      }

      normalizeCart(
        data.cart,
      );

    } catch (err: any) {

      console.log(
        'FoodE remove cart item error:',
        err,
      );

      setError(
        err?.message ||
          'Unable to remove item.',
      );

      Alert.alert(
        'Unable to Remove',
        err?.message ||
          'Please try again.',
      );

    } finally {

      setLoading(false);
    }
  };

  // ===================================================
  // CLEAR CART
  // ===================================================

  async function clearCart(): Promise<boolean> {

    if (
      !isLoggedIn ||
      !token
    ) {
      return false;
    }

    try {

      setLoading(true);

      setError(null);

      const response =
        await fetch(
          `${API_BASE_URL}/cart/clear`,
          {
            method: 'DELETE',

            headers:
              getHeaders(),
          },
        );

      const data =
        (await response.json()) as
          CartResponse;

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Unable to clear cart.',
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            'Unable to clear cart.',
        );
      }

      setItems([]);

      setSubtotal(0);

      setDeliveryFee(0);

      setPlatformCharge(
        PLATFORM_CHARGE,
      );

      setTotalAmount(0);

      setRestaurant(null);

      return true;

    } catch (err: any) {

      console.log(
        'FoodE clear cart error:',
        err,
      );

      setError(
        err?.message ||
          'Unable to clear cart.',
      );

      Alert.alert(
        'Unable to Clear Cart',
        err?.message ||
          'Please try again.',
      );

      return false;

    } finally {

      setLoading(false);
    }
  };

  // ===================================================
  // GET QUANTITY
  // ===================================================

  const getQuantity = (
    foodId: string,
  ): number => {

    const item =
      items.find(
        cartItem =>
          cartItem.foodId ===
            foodId ||
          cartItem.id ===
            foodId,
      );

    return item?.quantity || 0;
  };

  // ===================================================
  // IS IN CART
  // ===================================================

  const isInCart = (
    foodId: string,
  ): boolean => {

    return (
      getQuantity(
        foodId,
      ) > 0
    );
  };

  // ===================================================
  // CONTEXT VALUE
  // ===================================================

  const value =
    useMemo<CartContextType>(
      () => ({
        items,

        totalAmount,

        subtotal,

        deliveryFee,

        platformCharge,

        restaurant,

        loading,

        error,

        refreshCart,

        addItem,

        increase,

        decrease,

        removeItem,

        clearCart,

        getQuantity,

        isInCart,
      }),
      [
        items,
        totalAmount,
        subtotal,
        deliveryFee,
        platformCharge,
        restaurant,
        loading,
        error,
        refreshCart,
      ],
    );

  // ===================================================
  // PROVIDER
  // ===================================================

  return (
    <CartContext.Provider
      value={value}>
      {children}
    </CartContext.Provider>
  );
};

// =====================================================
// HOOK
// =====================================================

export const useCart = () => {

  const context =
    useContext(
      CartContext,
    );

  if (!context) {
    throw new Error(
      'useCart must be used inside CartProvider',
    );
  }

  return context;
};
