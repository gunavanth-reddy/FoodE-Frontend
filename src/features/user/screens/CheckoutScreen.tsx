import {SafeAreaView} from 'react-native-safe-area-context';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {
  Bicycle,
  CalendarBlank,
  Clock,
  MapPin,
  Money,
  Sparkle,
} from 'phosphor-react-native';
import AppBackButton from '../../../components/buttons/AppBackButton';

import {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import {
  RootStackParamList,
} from '../../../navigation/AppNavigator';

import {useAuth} from '../../../context/AuthContext';
import {useCart} from '../../../context/CartContext';
import API_BASE_URL from '../../../config/api';
import {FoodEAlert} from '../../../utils/FoodEAlert';
import {getRestaurantById} from '../services/restaurantService';

import {
  createOrder,
  DeliveryAddress,
} from '../services/orderService';
import SwipeToOrder from '../components/checkout/SwipeToOrder';

// =====================================================
// NAVIGATION
// =====================================================

type CheckoutNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    'Checkout'
  >;

// =====================================================
// API
// =====================================================

// =====================================================
// DELIVERY SLOT
// =====================================================

interface AvailableDeliverySlot {
  _id: string;
  restaurant?: string;
  date?: string;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  isActive: boolean;

  cutoffMinutes?: number;

  cutoffTime?: string;

  etaLabel?: string;

  estimatedDelivery?: {
    minMinutes: number;
    maxMinutes: number;
  };

  deliveryTime?: {
    min: number;
    max: number;
  };

  createdAt?: string;
  updatedAt?: string;
}

// =====================================================
// DELIVERY SLOT RESPONSE
// =====================================================

interface DeliverySlotsResponse {
  success?: boolean;
  message?: string;

  deliverySlots?: AvailableDeliverySlot[];
  slots?: AvailableDeliverySlot[];
  data?: {
    deliverySlots?: AvailableDeliverySlot[];
    slots?: AvailableDeliverySlot[];
    currentIndiaMinutes?: number;
    currentIndiaDate?: string;
  };

  restaurantId?: string;
  restaurantName?: string;

  // Backend provides this.
  // This is preferred over device time.
  currentIndiaMinutes?: number;
  currentIndiaDate?: string;
}

// =====================================================
// CART ITEM
// =====================================================

interface CheckoutCartItem {
  id?: string;
  _id?: string;
  foodId?: string;

  name?: string;

  quantity?: number;

  price?: number;

  discountedPrice?: number | null;

  restaurantId?: string;

  restaurant?:
    | string
    | {
        _id?: string;
        name?: string;
      };
}

// =====================================================
// TIME HELPERS
// =====================================================

const timeToMinutes = (
  time: string,
): number => {
  if (
    typeof time !== 'string' ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(
      time,
    )
  ) {
    return -1;
  }

  const [hours, minutes] =
    time.split(':').map(Number);

  return hours * 60 + minutes;
};

// =====================================================
// CURRENT INDIA TIME
// =====================================================

const getCurrentIndiaMinutes = (): number => {
  try {
    const formatter =
      new Intl.DateTimeFormat(
        'en-IN',
        {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        },
      );

    const parts =
      formatter.formatToParts(
        new Date(),
      );

    let hour = Number(
      parts.find(
        part => part.type === 'hour',
      )?.value || 0,
    );

    const minute = Number(
      parts.find(
        part => part.type === 'minute',
      )?.value || 0,
    );

    if (hour === 24) {
      hour = 0;
    }

    return hour * 60 + minute;
  } catch {
    return -1;
  }
};

// =====================================================
// DELIVERY SLOT NORMALIZATION
// =====================================================
// The backend has existed in more than one slot shape while the
// scheduling feature is being rolled out. Normalize all supported
// shapes here so the customer checkout never silently hides valid slots.

const parseFlexibleTime = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  const raw = value.trim();
  if (!raw) return '';

  // 24-hour HH:mm / HH:mm:ss
  const twentyFour = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (twentyFour) {
    const h = Number(twentyFour[1]);
    const m = Number(twentyFour[2]);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
  }

  // 12-hour values such as 9 AM / 09:30 PM
  const twelve = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (twelve) {
    let h = Number(twelve[1]);
    const m = Number(twelve[2] || 0);
    const period = twelve[3].toUpperCase();
    if (h >= 1 && h <= 12 && m >= 0 && m <= 59) {
      if (period === 'AM') h = h === 12 ? 0 : h;
      else h = h === 12 ? 12 : h + 12;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
  }

  return '';
};

const addDaysToDate = (date: string, days: number): string => {
  const parsed = new Date(`${date}T00:00:00+05:30`);
  if (Number.isNaN(parsed.getTime())) return date;
  parsed.setDate(parsed.getDate() + days);
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
};

const normalizeDeliverySlots = (
  rawSlots: any[],
  currentDate: string,
  currentMinutes: number,
): AvailableDeliverySlot[] => {
  return rawSlots
    .map((raw, index) => {
      if (!raw || typeof raw !== 'object') return null;

      const startTime = parseFlexibleTime(
        raw.startTime ?? raw.start ?? raw.from ?? raw.start_at,
      );
      let endTime = parseFlexibleTime(
        raw.endTime ?? raw.end ?? raw.to ?? raw.end_at,
      );
      if (!startTime) return null;

      // Some older slots only carry a duration.
      const start = timeToMinutes(startTime);
      const suppliedDuration = Number(raw.durationMinutes ?? raw.duration);
      if (!endTime && Number.isFinite(suppliedDuration) && suppliedDuration > 0) {
        const end = Math.min(start + suppliedDuration, 23 * 60 + 59);
        endTime = `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
      }
      if (!endTime) return null;

      const end = timeToMinutes(endTime);
      if (start < 0 || end <= start) return null;

      const cutoffMinutes = Math.max(
        0,
        Number(raw.cutoffMinutes ?? raw.cutoff ?? 10) || 10,
      );

      let date = typeof raw.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.date)
        ? raw.date
        : '';

      // Legacy recurring slots without a date remain useful: show their
      // next occurrence instead of filtering them out after today's cutoff.
      if (!date) {
        date = start - cutoffMinutes > currentMinutes
          ? currentDate
          : addDaysToDate(currentDate, 1);
      }

      const id = String(raw._id ?? raw.id ?? `foode-slot-${date}-${start}-${index}`);
      const durationMinutes = Number(raw.durationMinutes) > 0
        ? Number(raw.durationMinutes)
        : end - start;

      return {
        _id: id,
        restaurant: raw.restaurant?._id ?? raw.restaurant ?? undefined,
        date,
        startTime,
        endTime,
        durationMinutes,
        isActive: raw.isActive !== false,
        cutoffMinutes,
        cutoffTime: raw.cutoffTime,
        etaLabel: raw.etaLabel,
        estimatedDelivery: raw.estimatedDelivery,
        deliveryTime: raw.deliveryTime,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      } as AvailableDeliverySlot;
    })
    .filter(Boolean) as AvailableDeliverySlot[];
};

// =====================================================
// VALID SLOT
// =====================================================

const isValidDeliverySlot = (
  slot: AvailableDeliverySlot,
): boolean => {
  if (!slot) {
    return false;
  }

  if (!slot._id) {
    return false;
  }

  if (!slot.isActive) {
    return false;
  }

  const startMinutes =
    timeToMinutes(
      slot.startTime,
    );

  const endMinutes =
    timeToMinutes(
      slot.endTime,
    );

  if (
    startMinutes < 0 ||
    endMinutes < 0
  ) {
    return false;
  }

  return true;
};

// =====================================================
// CHECK WHETHER SLOT IS BOOKABLE
// =====================================================
//
// Example:
//
// 12:00 - 12:30
// cutoff = 10
//
// 11:49 -> AVAILABLE
// 11:50 -> CLOSED
//
// =====================================================

const getCurrentIndiaDate = (): string => {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
};

const isDeliverySlotBookable = (
  slot: AvailableDeliverySlot,
  currentMinutes: number,
  currentDate = getCurrentIndiaDate(),
): boolean => {
  if (
    !isValidDeliverySlot(slot)
  ) {
    return false;
  }

  if (
    currentMinutes < 0 ||
    currentMinutes >= 24 * 60
  ) {
    return false;
  }

  const startMinutes =
    timeToMinutes(
      slot.startTime,
    );

  if (startMinutes < 0) {
    return false;
  }

  // Backend is configured for 10 minutes.
  // Respect a valid backend value if supplied.
  const cutoffMinutes =
    Number.isFinite(
      Number(slot.cutoffMinutes),
    )
      ? Number(slot.cutoffMinutes)
      : 10;

  // Safety.
  const safeCutoff = Math.max(
    0,
    cutoffMinutes,
  );

  const bookingCloseMinutes =
    startMinutes - safeCutoff;

  const slotDate = slot.date || currentDate;

  // Future bookings are bookable regardless of today's clock.
  if (slotDate > currentDate) return true;

  // Old slots are no longer bookable.
  if (slotDate < currentDate) return false;

  // Same-day slot: respect its cutoff.
  if (bookingCloseMinutes >= 0) {
    return currentMinutes < bookingCloseMinutes;
  }

  return false;
};

// =====================================================
// GET BOOKING CUTOFF TIME
// =====================================================

const getSlotCutoffTime = (
  slot: AvailableDeliverySlot,
): string => {
  const startMinutes =
    timeToMinutes(
      slot.startTime,
    );

  if (startMinutes < 0) {
    return '--';
  }

  const cutoffMinutes =
    Number.isFinite(
      Number(slot.cutoffMinutes),
    )
      ? Number(slot.cutoffMinutes)
      : 10;

  let cutoff =
    startMinutes -
    Math.max(0, cutoffMinutes);

  if (cutoff < 0) {
    cutoff += 24 * 60;
  }

  const hours =
    Math.floor(cutoff / 60);

  const minutes =
    cutoff % 60;

  return `${String(hours).padStart(
    2,
    '0',
  )}:${String(minutes).padStart(
    2,
    '0',
  )}`;
};

// =====================================================
// SCREEN
// =====================================================

const CheckoutScreen = () => {
  const navigation =
    useNavigation<CheckoutNavigationProp>();

  // ===================================================
  // AUTH
  // ===================================================

  const {
    user,
    token,
    isLoggedIn,
  } = useAuth();

  // ===================================================
  // CART
  // ===================================================

  const {
    items,
    subtotal,
    deliveryFee,
    clearCart,
  } = useCart();

  // ===================================================
  // TOTAL
  // ===================================================

  const grandTotal =
    Number(subtotal || 0) +
    Number(deliveryFee || 0);

  // ===================================================
  // STATE
  // ===================================================

  const [
    isPlacingOrder,
    setIsPlacingOrder,
  ] = useState(false);

  const [
    deliverySlots,
    setDeliverySlots,
  ] = useState<
    AvailableDeliverySlot[]
  >([]);

  const [
    selectedDeliverySlot,
    setSelectedDeliverySlot,
  ] =
    useState<
      AvailableDeliverySlot | null
    >(null);

  const [
    loadingSlots,
    setLoadingSlots,
  ] = useState(false);

  const [
    slotError,
    setSlotError,
  ] = useState('');
  const [restaurantClosed, setRestaurantClosed] = useState(false);

  const todayDateStr = useMemo(() => getCurrentIndiaDate(), []);
  const tomorrowDateStr = useMemo(
    () => addDaysToDate(todayDateStr, 1),
    [todayDateStr],
  );

  const isTomorrowSlot = useCallback(
    (slot: AvailableDeliverySlot | null): boolean => {
      if (!slot) return false;
      const today = getCurrentIndiaDate();
      const date = slot.date || today;
      return date > today;
    },
    [],
  );

  const isTomorrowSelected = useMemo(
    () => isTomorrowSlot(selectedDeliverySlot),
    [isTomorrowSlot, selectedDeliverySlot],
  );

  const [dateTab, setDateTab] = useState<'all' | 'today' | 'tomorrow'>('all');

  const todaySlots = useMemo(
    () => deliverySlots.filter(s => (s.date || todayDateStr) === todayDateStr),
    [deliverySlots, todayDateStr],
  );

  const tomorrowSlots = useMemo(
    () => deliverySlots.filter(s => (s.date || todayDateStr) > todayDateStr),
    [deliverySlots, todayDateStr],
  );

  useEffect(() => {
    if (deliverySlots.length === 0) return;
    if (todaySlots.length === 0 && tomorrowSlots.length > 0) {
      setDateTab('tomorrow');
    } else if (todaySlots.length > 0 && tomorrowSlots.length === 0) {
      setDateTab('today');
    }
  }, [deliverySlots, todaySlots.length, tomorrowSlots.length]);

  const visibleSlots = useMemo(() => {
    if (dateTab === 'today') return todaySlots;
    if (dateTab === 'tomorrow') return tomorrowSlots;
    return deliverySlots;
  }, [dateTab, todaySlots, tomorrowSlots, deliverySlots]);

  // ===================================================
  // DELIVERY ADDRESS
  // ===================================================

  const deliveryAddress: DeliveryAddress = {
    name:
      user?.name ||
      'FoodE User',

    phone:
      user?.phone ||
      '',

    addressLine:
      'SRM AP University, Gate Number 3',

    city:
      'Neerukonda',

    state:
      'Andhra Pradesh',

    pincode:
      '',
  };

  // ===================================================
  // GET RESTAURANT ID
  // ===================================================

  const restaurantId =
    useMemo(() => {
      const firstItem =
        items?.[0] as
          | CheckoutCartItem
          | undefined;

      if (!firstItem) {
        return '';
      }

      // -----------------------------------------------
      // restaurantId
      // -----------------------------------------------

      if (
        typeof firstItem.restaurantId ===
          'string' &&
        firstItem.restaurantId.trim()
      ) {
        return firstItem.restaurantId.trim();
      }

      // -----------------------------------------------
      // restaurant._id
      // -----------------------------------------------

      if (
        firstItem.restaurant &&
        typeof firstItem.restaurant ===
          'object' &&
        typeof firstItem.restaurant._id ===
          'string' &&
        firstItem.restaurant._id.trim()
      ) {
        return firstItem.restaurant._id.trim();
      }

      // -----------------------------------------------
      // restaurant string
      // -----------------------------------------------

      if (
        typeof firstItem.restaurant ===
          'string' &&
        firstItem.restaurant.trim()
      ) {
        return firstItem.restaurant.trim();
      }

      return '';
    }, [items]);

  // ===================================================
  // LOAD DELIVERY SLOTS
  // ===================================================

  const loadDeliverySlots =
    useCallback(
      async (
        currentRestaurantId: string,
      ) => {
        if (!currentRestaurantId) {
          setDeliverySlots([]);
          setSelectedDeliverySlot(
            null,
          );

          setSlotError(
            'Restaurant information is missing from your cart.',
          );

          return;
        }

        try {
          setLoadingSlots(true);
          setRestaurantClosed(false);
          setSlotError('');
          setSelectedDeliverySlot(
            null,
          );

          // Refresh restaurant status before showing slots from a potentially stale cart.
          const currentRestaurant = await getRestaurantById(currentRestaurantId);
          if (currentRestaurant.isOpen === false) {
            setRestaurantClosed(true);
            setDeliverySlots([]);
            setSlotError('This restaurant is currently closed. Please try again when it opens.');
            return;
          }

          console.log(
            '====================================',
          );

          console.log(
            'FoodE: Loading delivery slots',
          );

          console.log(
            'Restaurant ID:',
            currentRestaurantId,
          );

          const url =
            `${API_BASE_URL}/delivery-slots/restaurant/${currentRestaurantId}`;

          console.log(
            'Delivery Slot URL:',
            url,
          );

          // =========================================
          // REQUEST
          // =========================================

          const response =
            await fetch(url, {
              method: 'GET',

              headers: {
                Accept:
                  'application/json',
              },
            });

          // =========================================
          // RESPONSE
          // =========================================

          let data:
            DeliverySlotsResponse =
              {};

          try {
            data =
              (await response.json()) as
                DeliverySlotsResponse;
          } catch {
            data = {};
          }

          console.log(
            'Delivery slot status:',
            response.status,
          );

          console.log(
            'Delivery slot response:',
            data,
          );

          // =========================================
          // HTTP ERROR
          // =========================================

          if (!response.ok) {
            throw new Error(
              data.message ||
                `Failed to load delivery slots (${response.status})`,
            );
          }

          // =========================================
          // SUCCESS CHECK
          // =========================================

          if (
            data.success === false
          ) {
            throw new Error(
              data.message ||
                'Unable to load delivery slots.',
            );
          }

          // =========================================
          // NORMALIZED RESPONSE PAYLOAD
          // =========================================

          const responsePayload: any = data.data || data;

          // =========================================
          // RAW SLOTS
          // =========================================

          const rawSlots =
            Array.isArray(responsePayload.deliverySlots)
              ? responsePayload.deliverySlots
              : Array.isArray(responsePayload.slots)
                ? responsePayload.slots
                : [];

          console.log(
            'FoodE: Raw delivery slots:',
            rawSlots,
          );

          // =========================================
          // CURRENT INDIA TIME
          // =========================================
          //
          // Prefer backend time because backend is
          // the final authority.
          //

          const backendCurrentMinutes =
            Number(
              responsePayload.currentIndiaMinutes,
            );

          const currentIndiaDate =
            responsePayload.currentIndiaDate ||
            getCurrentIndiaDate();

          const currentMinutes =
            Number.isFinite(
              backendCurrentMinutes,
            )
              ? backendCurrentMinutes
              : getCurrentIndiaMinutes();

          console.log(
            'FoodE: Current India minutes:',
            currentMinutes,
          );

          // =========================================
          // VALIDATE SLOTS
          // =========================================

          const normalizedSlots = normalizeDeliverySlots(
            rawSlots,
            currentIndiaDate,
            currentMinutes,
          );

          const validSlots = normalizedSlots.filter(
            isValidDeliverySlot,
          );

          console.log(
            'FoodE: Valid slots:',
            validSlots,
          );

          // =========================================
          // FILTER BOOKABLE SLOTS
          // =========================================
          //
          // Backend already filters these.
          // Frontend checks again so stale data
          // cannot be selected.
          //

          const bookableSlots =
            validSlots.filter(
              slot =>
                isDeliverySlotBookable(
                  slot,
                  currentMinutes,
                  currentIndiaDate,
                ),
            );

          console.log(
            'FoodE: Bookable slots:',
            bookableSlots,
          );

          // =========================================
          // SORT
          // =========================================

          const sortedSlots =
            [...bookableSlots].sort(
              (a, b) => {
                const aStart = timeToMinutes(a.startTime);
                const bStart = timeToMinutes(b.startTime);
                const dateCompare = String(a.date || '').localeCompare(String(b.date || ''));
                return dateCompare || aStart - bStart;
              },
            );

          console.log(
            'FoodE: Final slots shown:',
            sortedSlots,
          );

          // =========================================
          // SET STATE
          // =========================================

          setDeliverySlots(
            sortedSlots,
          );

          // =========================================
          // NO SLOTS
          // =========================================

          if (
            sortedSlots.length === 0
          ) {
            setSlotError(
              'No delivery slots are currently available for this restaurant.',
            );
          } else {
            setSlotError('');
          }
        } catch (error: any) {
          console.log(
            'FoodE: Delivery slot error:',
            error,
          );

          setDeliverySlots([]);
          setSelectedDeliverySlot(
            null,
          );

          if (String(error?.message || '').toLowerCase().includes('restaurant is currently closed')) {
            setRestaurantClosed(true);
          }

          setSlotError(
            error?.message ||
              'Unable to load delivery slots.',
          );
        } finally {
          setLoadingSlots(false);

          console.log(
            '====================================',
          );
        }
      },
      [],
    );

  // ===================================================
  // LOAD SLOTS WHEN RESTAURANT CHANGES
  // ===================================================

  useEffect(() => {
    if (
      !items ||
      items.length === 0
    ) {
      setDeliverySlots([]);
      setSelectedDeliverySlot(
        null,
      );
      setSlotError('');

      return;
    }

    if (!restaurantId) {
      setDeliverySlots([]);
      setSelectedDeliverySlot(
        null,
      );

      setSlotError(
        'Unable to identify the restaurant for this cart.',
      );

      return;
    }

    loadDeliverySlots(
      restaurantId,
    );
  }, [
    restaurantId,
    items,
    loadDeliverySlots,
  ]);

  // ===================================================
  // FORMAT TIME
  // ===================================================

  const formatSlotTime = (
    time: string,
  ): string => {
    if (!time) {
      return '--';
    }

    const parts =
      time.split(':');

    if (parts.length < 2) {
      return time;
    }

    const hour =
      Number(parts[0]);

    const minute =
      Number(parts[1]);

    if (
      Number.isNaN(hour) ||
      Number.isNaN(minute)
    ) {
      return time;
    }

    const period =
      hour >= 12
        ? 'PM'
        : 'AM';

    const displayHour =
      hour % 12 || 12;

    return `${displayHour}:${String(
      minute,
    ).padStart(
      2,
      '0',
    )} ${period}`;
  };

  // ===================================================
  // SLOT LABEL
  // ===================================================

  const getSlotLabel = (
    slot: AvailableDeliverySlot,
  ): string => {
    const time = `${formatSlotTime(slot.startTime)} – ${formatSlotTime(slot.endTime)}`;
    if (!slot.date) return time;
    const today = getCurrentIndiaDate();
    const tomorrow = addDaysToDate(today, 1);
    const datePrefix =
      slot.date === today ? 'Today' : slot.date === tomorrow ? 'Tomorrow' : slot.date;
    return `${datePrefix} • ${time}`;
  };

  // ===================================================
  // ETA LABEL
  // ===================================================

  const getEtaLabel = (
    slot: AvailableDeliverySlot,
  ): string => {
    if (slot.etaLabel) {
      return slot.etaLabel;
    }

    if (
      slot.estimatedDelivery
    ) {
      return `Delivery in ${slot.estimatedDelivery.minMinutes}–${slot.estimatedDelivery.maxMinutes} mins`;
    }

    if (slot.deliveryTime) {
      return `Delivery in ${slot.deliveryTime.min}–${slot.deliveryTime.max} mins`;
    }

    return 'Delivery in 20–35 mins';
  };

  // ===================================================
  // SELECT DELIVERY SLOT
  // ===================================================

  const handleSelectDeliverySlot =
    (
      slot: AvailableDeliverySlot,
    ) => {
      const currentMinutes =
        getCurrentIndiaMinutes();

      // -----------------------------------------------
      // FINAL CHECK
      // -----------------------------------------------

      if (
        !isDeliverySlotBookable(
          slot,
          currentMinutes,
        )
      ) {
        setSelectedDeliverySlot(
          null,
        );

        FoodEAlert.alert(
          'Delivery Slot Closed',
          'This delivery slot is no longer available. Please select another slot.',
        );

        if (restaurantId) {
          loadDeliverySlots(
            restaurantId,
          );
        }

        return;
      }

      setSelectedDeliverySlot(
        slot,
      );
    };

  // ===================================================
  // PLACE ORDER
  // ===================================================

  const handlePlaceOrder =
    async () => {
      // -----------------------------------------------
      // LOGIN
      // -----------------------------------------------

      if (
        !isLoggedIn ||
        !token
      ) {
        FoodEAlert.alert(
          'Login Required',
          'Please login before placing your order.',
        );

        return;
      }

      // -----------------------------------------------
      // CART
      // -----------------------------------------------

      if (
        !items ||
        items.length === 0
      ) {
        FoodEAlert.alert(
          'Cart Empty',
          'Please add food to your cart before placing an order.',
        );

        return;
      }

      // -----------------------------------------------
      // PHONE
      // -----------------------------------------------

      if (!user?.phone) {
        FoodEAlert.alert(
          'Phone Number Required',
          'Please add your phone number before placing the order.',
        );

        return;
      }

      // -----------------------------------------------
      // RESTAURANT
      // -----------------------------------------------

      if (!restaurantId) {
        FoodEAlert.alert(
          'Restaurant Error',
          'Unable to identify the restaurant for this order.',
        );

        return;
      }

      // -----------------------------------------------
      // SLOT
      // -----------------------------------------------

      if (
        !selectedDeliverySlot
      ) {
        FoodEAlert.alert(
          'Delivery Slot Required',
          'Please select a delivery time before placing your order.',
        );

        return;
      }

      // -----------------------------------------------
      // PREVENT DOUBLE TAP
      // -----------------------------------------------

      if (isPlacingOrder) {
        return;
      }

      // -----------------------------------------------
      // FINAL CUTOFF CHECK
      // -----------------------------------------------

      const currentMinutes =
        getCurrentIndiaMinutes();

      const slotStillBookable =
        isDeliverySlotBookable(
          selectedDeliverySlot,
          currentMinutes,
        );

      if (
        !slotStillBookable
      ) {
        setSelectedDeliverySlot(
          null,
        );

        FoodEAlert.alert(
          'Delivery Slot Closed',
          'This delivery slot is no longer available. Please select another slot.',
        );

        await loadDeliverySlots(
          restaurantId,
        );

        return;
      }

      try {
        setIsPlacingOrder(true);

        console.log(
          'FoodE: Creating order...',
        );

        console.log(
          'Restaurant:',
          restaurantId,
        );

        console.log(
          'Selected delivery slot:',
          selectedDeliverySlot,
        );

        // =============================================
        // CREATE ORDER
        // =============================================

        const order =
          await createOrder(
            token,
            {
              deliveryAddress,

              deliverySlot: {
                slotId:
                  selectedDeliverySlot._id,

                date:
                  selectedDeliverySlot.date,

                startTime:
                  selectedDeliverySlot.startTime,

                endTime:
                  selectedDeliverySlot.endTime,

                durationMinutes:
                  selectedDeliverySlot.durationMinutes,
              },

              paymentMethod:
                'COD',

              customerNote:
                '',
            },
          );

        console.log(
          'FoodE: Order created:',
          order,
        );

        // =============================================
        // CLEAR CART
        // =============================================

        await clearCart();

        // =============================================
        // SUCCESS
        // =============================================

        navigation.replace(
          'OrderSuccess',
          {
            order,
          },
        );
      } catch (error: any) {
        console.log(
          'FoodE: Place order error:',
          error,
        );

        if (String(error?.message || '').toLowerCase().includes('restaurant is currently closed')) {
          setRestaurantClosed(true);
          setDeliverySlots([]);
          setSelectedDeliverySlot(null);
          setSlotError('This restaurant is currently closed. Please try again when it opens.');
          FoodEAlert.alert(
            'Restaurant Closed',
            'The restaurant closed before your order was placed. Your order was not submitted.',
          );
          return;
        }

        FoodEAlert.alert(
          'Order Failed',
          error?.message ||
            'Unable to place your order. Please try again.',
        );
      } finally {
        setIsPlacingOrder(false);
      }
    };

  // ===================================================
  // LOGIN REQUIRED
  // ===================================================

  if (!isLoggedIn) {
    return (
      <SafeAreaView
        style={styles.container} edges={['top', 'left', 'right']}>
        <View
          style={
            styles.centerContainer
          }>
          <Text
            style={
              styles.centerTitle
            }>
            Login Required
          </Text>

          <Text
            style={
              styles.centerDescription
            }>
            Please login to continue
            with your order.
          </Text>

          <Pressable
            style={
              styles.primaryButton
            }
            onPress={() =>
              navigation.goBack()
            }>
            <Text
              style={
                styles.primaryButtonText
              }>
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ===================================================
  // EMPTY CART
  // ===================================================

  if (
    !items ||
    items.length === 0
  ) {
    return (
      <SafeAreaView
        style={styles.container} edges={['top', 'left', 'right']}>
        <View
          style={
            styles.centerContainer
          }>
          <Text
            style={
              styles.centerTitle
            }>
            Your Cart is Empty
          </Text>

          <Text
            style={
              styles.centerDescription
            }>
            Add some delicious food
            before checking out.
          </Text>

          <Pressable
            style={
              styles.primaryButton
            }
            onPress={() =>
              navigation.goBack()
            }>
            <Text
              style={
                styles.primaryButtonText
              }>
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ===================================================
  // MAIN UI
  // ===================================================

  return (
    <SafeAreaView
      style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#FF7A00" barStyle="light-content" hidden={false} translucent={false} />
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }>

        {/* HEADER */}

        <View
          style={styles.header}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
            {navigation.canGoBack() && (
              <AppBackButton />
            )}
            <View>
              <Text
                style={
                  styles.headerTitle
                }>
                Checkout
              </Text>

              <Text
                style={
                  styles.headerSubtitle
                }>
                Review your order before placing it
              </Text>
            </View>
          </View>
        </View>

        {/* DELIVERY ADDRESS */}

        <View
          style={styles.section}>
          <Text
            style={
              styles.sectionTitle
            }>
            Delivery Address
          </Text>

          <View
            style={styles.card}>
            <View
              style={
                styles.addressHeader
              }>
              <View
                style={
                  styles.locationIcon
                }>
                <MapPin size={20} color="#FF7A00" weight="duotone" />
              </View>

              <View
                style={
                  styles.addressHeaderText
                }>
                <Text
                  style={
                    styles.addressTitle
                  }>
                  SRM AP University
                </Text>

                <Text
                  style={
                    styles.addressSubtitle
                  }>
                  Gate Number 3
                </Text>
              </View>
            </View>

            <View
              style={styles.divider}
            />

            <Text
              style={
                styles.addressName
              }>
              {user?.name ||
                'FoodE User'}
            </Text>

            <Text
              style={
                styles.addressDetail
              }>
              {user?.phone ||
                'Phone number unavailable'}
            </Text>

            <Text
              style={
                styles.addressDetail
              }>
              SRM AP University,
              {' '}Gate Number 3
            </Text>

            <Text
              style={
                styles.addressDetail
              }>
              Neerukonda,
              {' '}Andhra Pradesh
            </Text>

            <View
              style={
                styles.fixedAddressBadge
              }>
              <Text
                style={
                  styles.fixedAddressBadgeText
                }>
                Fixed delivery location
              </Text>
            </View>
          </View>
        </View>

        {/* DELIVERY TIME */}

        <View
          style={styles.section}>
          <View
            style={
              styles.slotTitleRow
            }>
            <View
              style={
                styles.slotTitleContainer
              }>
              <Text
                style={
                  styles.sectionTitle
                }>
                Delivery Time
              </Text>

              <Text
                style={
                  styles.slotSubtitle
                }>
                Choose when you want your
                order delivered
              </Text>
            </View>

            {loadingSlots && (
              <ActivityIndicator
                size="small"
                color="#FF5A00"
              />
            )}
          </View>

          {/* DATE FILTER TABS */}
          {deliverySlots.length > 0 && (todaySlots.length > 0 || tomorrowSlots.length > 0) && (
            <View style={styles.dateTabsRow}>
              {todaySlots.length > 0 && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setDateTab('today')}
                  style={[
                    styles.dateTabPill,
                    dateTab === 'today' && styles.dateTabPillActive,
                  ]}>
                  <Clock
                    size={14}
                    color={dateTab === 'today' ? '#FF7A00' : '#6B7280'}
                    weight={dateTab === 'today' ? 'bold' : 'regular'}
                  />
                  <Text
                    style={[
                      styles.dateTabText,
                      dateTab === 'today' && styles.dateTabTextActive,
                    ]}>
                    Today ({todaySlots.length})
                  </Text>
                </TouchableOpacity>
              )}

              {tomorrowSlots.length > 0 && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setDateTab('tomorrow')}
                  style={[
                    styles.dateTabPill,
                    styles.dateTabPillTomorrow,
                    dateTab === 'tomorrow' && styles.dateTabPillActiveTomorrow,
                  ]}>
                  <Sparkle
                    size={14}
                    color={dateTab === 'tomorrow' ? '#7C3AED' : '#6D28D9'}
                    weight="fill"
                  />
                  <Text
                    style={[
                      styles.dateTabText,
                      styles.dateTabTextTomorrow,
                      dateTab === 'tomorrow' && styles.dateTabTextActiveTomorrow,
                    ]}>
                    Tomorrow • Pre-Book ({tomorrowSlots.length})
                  </Text>
                </TouchableOpacity>
              )}

              {todaySlots.length > 0 && tomorrowSlots.length > 0 && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setDateTab('all')}
                  style={[
                    styles.dateTabPill,
                    dateTab === 'all' && styles.dateTabPillActiveNeutral,
                  ]}>
                  <Text
                    style={[
                      styles.dateTabText,
                      dateTab === 'all' && styles.dateTabTextActiveNeutral,
                    ]}>
                    All ({deliverySlots.length})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* TODAY SLOTS CLOSED NOTICE */}
          {todaySlots.length === 0 && tomorrowSlots.length > 0 && (
            <View style={styles.preBookingNoticeCard}>
              <View style={styles.preBookingNoticeIconWrap}>
                <Sparkle size={18} color="#7C3AED" weight="fill" />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.preBookingNoticeTitle}>
                  Pre-Booking Available for Tomorrow
                </Text>
                <Text style={styles.preBookingNoticeText}>
                  Today's delivery slots are closed. You can pre-book your order for delivery tomorrow!
                </Text>
              </View>
            </View>
          )}

          {/* LOADING */}

          {restaurantClosed ? (
            <View style={styles.slotEmptyCard}>
              <Clock size={28} color="#FF7A00" weight="duotone" />
              <Text style={styles.slotEmptyTitle}>Restaurant is closed</Text>
              <Text style={styles.slotEmptyText}>
                You can keep your cart and place the order when this restaurant opens.
              </Text>
            </View>
          ) : loadingSlots ? (
            <View
              style={
                styles.slotLoadingCard
              }>
              <ActivityIndicator
                size="small"
                color="#FF5A00"
              />

              <Text
                style={
                  styles.slotLoadingText
                }>
                Loading available
                delivery times...
              </Text>
            </View>
          ) : visibleSlots.length >
            0 ? (
            <View>
              {visibleSlots.map(
                slot => {
                  const isSelected =
                    selectedDeliverySlot?._id ===
                    slot._id;

                  const isTomorrow = isTomorrowSlot(slot);

                  const cutoffTime =
                    getSlotCutoffTime(
                      slot,
                    );

                  return (
                    <Pressable
                      key={slot._id}
                      style={[
                        styles.slotCard,
                        isTomorrow && styles.slotCardTomorrow,
                        isSelected &&
                          (isTomorrow
                            ? styles.slotCardSelectedTomorrow
                            : styles.slotCardSelected),
                      ]}
                      onPress={() =>
                        handleSelectDeliverySlot(
                          slot,
                        )
                      }>

                      <View
                        style={[
                          styles.slotIcon,
                          isTomorrow && styles.slotIconTomorrow,
                        ]}>
                        {isTomorrow ? (
                          <CalendarBlank
                            size={20}
                            color="#7C3AED"
                            weight="duotone"
                          />
                        ) : (
                          <Bicycle
                            size={20}
                            color="#FF7A00"
                            weight="duotone"
                          />
                        )}
                      </View>

                      <View
                        style={
                          styles.slotInfo
                        }>

                        <View style={styles.slotHeaderRow}>
                          <Text
                            style={[
                              styles.etaText,
                              isTomorrow && styles.etaTextTomorrow,
                              isSelected &&
                                (isTomorrow
                                  ? styles.etaTextSelectedTomorrow
                                  : styles.etaTextSelected),
                            ]}>
                            {isTomorrow ? 'Pre-Booking Slot' : getEtaLabel(slot)}
                          </Text>

                          {isTomorrow && (
                            <View style={styles.preBookingBadge}>
                              <Sparkle size={10} color="#7C3AED" weight="fill" />
                              <Text style={styles.preBookingBadgeText}>
                                PRE-BOOKING
                              </Text>
                            </View>
                          )}
                        </View>

                        <Text
                          style={[
                            styles.slotTime,
                            isSelected &&
                              (isTomorrow
                                ? styles.slotTimeSelectedTomorrow
                                : styles.slotTimeSelected),
                          ]}>
                          {getSlotLabel(
                            slot,
                          )}
                        </Text>

                        <Text
                          style={[
                            styles.slotAvailableText,
                            isTomorrow && styles.slotAvailableTextTomorrow,
                          ]}>
                          {isTomorrow
                            ? '⚡ Pre-book now • Delivered tomorrow'
                            : `Book until ${formatSlotTime(cutoffTime)}`}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.slotRadio,
                          isTomorrow && styles.slotRadioTomorrow,
                          isSelected &&
                            (isTomorrow
                              ? styles.slotRadioSelectedTomorrow
                              : styles.slotRadioSelected),
                        ]}>
                        {isSelected && (
                          <View
                            style={[
                              styles.slotRadioDot,
                              isTomorrow && styles.slotRadioDotTomorrow,
                            ]}
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                },
              )}
            </View>
          ) : (
            <View
              style={
                styles.slotEmptyCard
              }>
              <Clock size={28} color="#FF7A00" weight="duotone" />

              <Text
                style={
                  styles.slotEmptyTitle
                }>
                No delivery slots
                available
              </Text>

              <Text
                style={
                  styles.slotEmptyText
                }>
                {slotError ||
                  'Please try again later.'}
              </Text>

              {restaurantId && (
                <Pressable
                  style={
                    styles.retryButton
                  }
                  onPress={() =>
                    loadDeliverySlots(
                      restaurantId,
                    )
                  }>
                  <Text
                    style={
                      styles.retryButtonText
                    }>
                    Try Again
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* SELECTED SLOT OR PRE-BOOKING BANNER */}

          {selectedDeliverySlot && (
            isTomorrowSelected ? (
              <View style={styles.preBookingBanner}>
                <View style={styles.preBookingBannerHeader}>
                  <View style={styles.preBookingBannerIcon}>
                    <CalendarBlank size={22} color="#7C3AED" weight="duotone" />
                  </View>
                  <View style={{flex: 1}}>
                    <View style={styles.preBookingBannerTitleRow}>
                      <Text style={styles.preBookingBannerTitle}>
                        PRE-BOOKING FOR TOMORROW
                      </Text>
                      <View style={styles.preBookingLiveTag}>
                        <Text style={styles.preBookingLiveTagText}>SCHEDULED</Text>
                      </View>
                    </View>
                    <Text style={styles.preBookingBannerSlot}>
                      Delivery Tomorrow: {formatSlotTime(selectedDeliverySlot.startTime)} – {formatSlotTime(selectedDeliverySlot.endTime)}
                    </Text>
                  </View>
                </View>
                <View style={styles.preBookingBannerDivider} />
                <View style={styles.preBookingBannerFooter}>
                  <Sparkle size={14} color="#7C3AED" weight="fill" />
                  <Text style={styles.preBookingBannerFooterText}>
                    The restaurant will prepare this fresh tomorrow on time for delivery.
                  </Text>
                </View>
              </View>
            ) : (
              <View
                style={
                  styles.selectedSlotBadge
                }>
                <Text
                  style={
                    styles.selectedSlotBadgeText
                  }>
                  ✓{' '}
                  {getEtaLabel(
                    selectedDeliverySlot,
                  )}
                </Text>

                <Text
                  style={
                    styles.selectedSlotTime
                  }>
                  {getSlotLabel(
                    selectedDeliverySlot,
                  )}
                </Text>
              </View>
            )
          )}
        </View>

        {/* PAYMENT */}

        <View
          style={styles.section}>
          <Text
            style={
              styles.sectionTitle
            }>
            Payment Method
          </Text>

          <View
            style={styles.card}>
            <View
              style={
                styles.paymentRow
              }>
              <View
                style={
                  styles.paymentIcon
                }>
                <Money size={20} color="#FF7A00" weight="duotone" />
              </View>

              <View
                style={
                  styles.paymentInfo
                }>
                <Text
                  style={
                    styles.paymentTitle
                  }>
                  Cash on Delivery
                </Text>

                <Text
                  style={
                    styles.paymentSubtitle
                  }>
                  Pay when your order
                  arrives
                </Text>
              </View>

              <View
                style={
                  styles.paymentRadio
                }>
                <View
                  style={
                    styles.paymentRadioDot
                  }
                />
              </View>
            </View>
          </View>
        </View>

        {/* ORDER ITEMS */}

        <View
          style={styles.section}>
          <Text
            style={
              styles.sectionTitle
            }>
            Order Items
          </Text>

          <View
            style={styles.card}>
            {items.map(
              (rawItem, index) => {
                const item =
                  rawItem as CheckoutCartItem;

                const quantity =
                  Number(
                    item.quantity || 1,
                  );

                const originalPrice =
                  Number(
                    item.price || 0,
                  );

                const discountedPrice =
                  item.discountedPrice !==
                    null &&
                  item.discountedPrice !==
                    undefined
                    ? Number(
                        item.discountedPrice,
                      )
                    : null;

                const price =
                  discountedPrice !==
                    null &&
                  Number.isFinite(
                    discountedPrice,
                  ) &&
                  discountedPrice >= 0
                    ? discountedPrice
                    : originalPrice;

                const itemTotal =
                  price * quantity;

                return (
                  <View
                    key={String(
                      item.foodId ||
                        item.id ||
                        item._id ||
                        index,
                    )}
                    style={[
                      styles.itemRow,
                      index ===
                        items.length - 1 &&
                        styles.lastItemRow,
                    ]}>

                    <View
                      style={
                        styles.itemLeft
                      }>
                      <View
                        style={
                          styles.quantityBadge
                        }>
                        <Text
                          style={
                            styles.quantityText
                          }>
                          {quantity}x
                        </Text>
                      </View>

                      <View
                        style={
                          styles.itemInfo
                        }>
                        <Text
                          style={
                            styles.itemName
                          }
                          numberOfLines={2}>
                          {item.name ||
                            'Food Item'}
                        </Text>

                        <Text
                          style={
                            styles.itemUnitPrice
                          }>
                          ₹
                          {price.toFixed(
                            2,
                          )}{' '}
                          each
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={
                        styles.itemTotal
                      }>
                      ₹
                      {itemTotal.toFixed(
                        2,
                      )}
                    </Text>
                  </View>
                );
              },
            )}
          </View>
        </View>

        {/* PRICE DETAILS */}

        <View
          style={styles.section}>
          <Text
            style={
              styles.sectionTitle
            }>
            Price Details
          </Text>

          <View
            style={styles.card}>
            <View
              style={styles.priceRow}>
              <Text
                style={
                  styles.priceLabel
                }>
                Subtotal
              </Text>

              <Text
                style={
                  styles.priceValue
                }>
                ₹
                {Number(
                  subtotal || 0,
                ).toFixed(2)}
              </Text>
            </View>

            <View
              style={styles.priceRow}>
              <Text
                style={
                  styles.priceLabel
                }>
                Delivery Fee
              </Text>

              <Text
                style={
                  styles.priceValue
                }>
                ₹
                {Number(
                  deliveryFee || 0,
                ).toFixed(2)}
              </Text>
            </View>

            <View
              style={styles.divider}
            />

            <View
              style={styles.totalRow}>
              <Text
                style={
                  styles.totalLabel
                }>
                Total
              </Text>

              <Text
                style={
                  styles.totalValue
                }>
                ₹
                {grandTotal.toFixed(
                  2,
                )}
              </Text>
            </View>
          </View>
        </View>

        <Text
          style={
            styles.footerNote
          }>
          Your order will be delivered
          to SRM AP University, Gate
          Number 3.
        </Text>
      </ScrollView>

      {/* FIXED BOTTOM SWIPE TO ORDER */}
      <View style={styles.fixedBottomContainer}>
        {isTomorrowSelected && selectedDeliverySlot && (
          <View style={styles.bottomPreBookingHighlight}>
            <View style={styles.bottomPreBookingBadge}>
              <Sparkle size={12} color="#7C3AED" weight="fill" />
              <Text style={styles.bottomPreBookingBadgeText}>
                PRE-BOOKING ORDER
              </Text>
            </View>
            <Text style={styles.bottomPreBookingDateText} numberOfLines={1}>
              Delivers Tomorrow ({formatSlotTime(selectedDeliverySlot.startTime)} – {formatSlotTime(selectedDeliverySlot.endTime)})
            </Text>
          </View>
        )}

        <SwipeToOrder
          disabled={
            isPlacingOrder ||
            loadingSlots ||
            restaurantClosed ||
            !selectedDeliverySlot
          }
          loading={isPlacingOrder}
          label={
            restaurantClosed
              ? 'Restaurant Closed'
              : !selectedDeliverySlot
              ? 'Select Delivery Time'
              : isTomorrowSelected
              ? `Swipe to Pre-Book • ₹${grandTotal.toFixed(2)}`
              : `Swipe to Order • ₹${grandTotal.toFixed(2)}`
          }
          onSwipeComplete={handlePlaceOrder}
          onDisabledPress={() => {
            if (restaurantClosed) {
              FoodEAlert.alert(
                'Restaurant Closed',
                'This restaurant is currently closed. Please try again when it opens.',
              );
            } else if (!selectedDeliverySlot) {
              FoodEAlert.alert(
                'Select Delivery Time',
                'Please choose an available delivery time slot above before swiping to order.',
              );
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F7F7F7',
    },

    scrollContent: {
      paddingBottom: 40,
    },

    // ================================================
    // HEADER
    // ================================================

    header: {
      backgroundColor: '#FFFCF8',
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 18,
      borderBottomWidth: 1,
      borderBottomColor: '#EEEEEE',
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },

    headerTitle: {
      fontSize: 25,
      fontWeight: '800',
      color: '#111111',
    },

    headerSubtitle: {
      marginTop: 5,
      fontSize: 13,
      color: '#777777',
    },

    // ================================================
    // SECTION
    // ================================================

    section: {
      marginTop: 18,
      paddingHorizontal: 16,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#111111',
      marginBottom: 10,
    },

    // ================================================
    // CARD
    // ================================================

    card: {
      backgroundColor: '#FFFCF8',
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: '#EEEEEE',
    },

    // ================================================
    // ADDRESS
    // ================================================

    addressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    locationIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: '#FFF2EA',
      alignItems: 'center',
      justifyContent: 'center',
    },

    iconText: {
      fontSize: 20,
    },

    addressHeaderText: {
      flex: 1,
      marginLeft: 12,
    },

    addressTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#111111',
    },

    addressSubtitle: {
      marginTop: 3,
      fontSize: 13,
      color: '#FF5A00',
      fontWeight: '600',
    },

    addressName: {
      fontSize: 15,
      fontWeight: '700',
      color: '#222222',
      marginBottom: 5,
    },

    addressDetail: {
      fontSize: 14,
      color: '#666666',
      lineHeight: 21,
    },

    fixedAddressBadge: {
      alignSelf: 'flex-start',
      marginTop: 12,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 7,
      backgroundColor: '#F3F8F4',
    },

    fixedAddressBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#3A7D44',
    },

    divider: {
      height: 1,
      backgroundColor: '#EEEEEE',
      marginVertical: 12,
    },

    // ================================================
    // DELIVERY SLOT
    // ================================================

    slotTitleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },

    slotTitleContainer: {
      flex: 1,
      paddingRight: 12,
    },

    slotSubtitle: {
      marginTop: -5,
      marginBottom: 10,
      fontSize: 12,
      color: '#888888',
      lineHeight: 18,
    },

    slotLoadingCard: {
      minHeight: 80,
      backgroundColor: '#FFFCF8',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#EEEEEE',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      flexDirection: 'row',
    },

    slotLoadingText: {
      marginLeft: 10,
      fontSize: 13,
      color: '#777777',
    },

    slotCard: {
      minHeight: 82,
      backgroundColor: '#FFFCF8',
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: '#EEEEEE',
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },

    slotCardSelected: {
      borderColor: '#FF5A00',
      backgroundColor: '#FFF8F4',
    },

    slotIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: '#FFF2EA',
      alignItems: 'center',
      justifyContent: 'center',
    },

    slotInfo: {
      flex: 1,
      marginLeft: 12,
    },

    etaText: {
      fontSize: 15,
      fontWeight: '800',
      color: '#FF5A00',
      marginBottom: 3,
    },

    etaTextSelected: {
      color: '#FF5A00',
    },

    slotTime: {
      fontSize: 13,
      fontWeight: '600',
      color: '#333333',
    },

    slotTimeSelected: {
      color: '#FF5A00',
    },

    slotAvailableText: {
      marginTop: 4,
      fontSize: 12,
      color: '#3A7D44',
      fontWeight: '600',
    },

    slotRadio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: '#CCCCCC',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 10,
    },

    slotRadioSelected: {
      borderColor: '#FF5A00',
    },

    slotRadioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#FF5A00',
    },

    slotEmptyCard: {
      backgroundColor: '#FFFCF8',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#EEEEEE',
      paddingHorizontal: 20,
      paddingVertical: 24,
      alignItems: 'center',
    },

    slotEmptyIcon: {
      fontSize: 30,
      marginBottom: 8,
    },

    slotEmptyTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: '#222222',
      textAlign: 'center',
    },

    slotEmptyText: {
      marginTop: 6,
      fontSize: 12,
      lineHeight: 18,
      color: '#888888',
      textAlign: 'center',
    },

    retryButton: {
      marginTop: 14,
      paddingHorizontal: 18,
      paddingVertical: 9,
      borderRadius: 9,
      backgroundColor: '#FFF2EA',
    },

    retryButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FF5A00',
    },

    selectedSlotBadge: {
      marginTop: 2,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 9,
      backgroundColor: '#F3F8F4',
      borderWidth: 1,
      borderColor: '#DDEBDD',
    },

    selectedSlotBadgeText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#3A7D44',
    },

    selectedSlotTime: {
      marginTop: 3,
      fontSize: 12,
      fontWeight: '600',
      color: '#5D765F',
    },

    // ================================================
    // PRE-BOOKING HIGHLIGHT STYLES
    // ================================================

    dateTabsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
      flexWrap: 'wrap',
    },

    dateTabPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 13,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: '#F3F4F6',
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },

    dateTabPillActive: {
      backgroundColor: '#FFF2EA',
      borderColor: '#FF7A00',
    },

    dateTabPillTomorrow: {
      backgroundColor: '#FAF5FF',
      borderColor: '#E9D5FF',
    },

    dateTabPillActiveTomorrow: {
      backgroundColor: '#EDE9FE',
      borderColor: '#7C3AED',
    },

    dateTabPillActiveNeutral: {
      backgroundColor: '#1E232C',
      borderColor: '#1E232C',
    },

    dateTabText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#6B7280',
    },

    dateTabTextActive: {
      color: '#FF7A00',
      fontWeight: '700',
    },

    dateTabTextTomorrow: {
      color: '#7C3AED',
    },

    dateTabTextActiveTomorrow: {
      color: '#7C3AED',
      fontWeight: '700',
    },

    dateTabTextActiveNeutral: {
      color: '#FFFFFF',
      fontWeight: '700',
    },

    preBookingNoticeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: '#FAF5FF',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E9D5FF',
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 12,
    },

    preBookingNoticeIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#EDE9FE',
      alignItems: 'center',
      justifyContent: 'center',
    },

    preBookingNoticeTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: '#6D28D9',
    },

    preBookingNoticeText: {
      fontSize: 11,
      color: '#7C3AED',
      marginTop: 2,
      lineHeight: 16,
    },

    slotHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 3,
    },

    slotCardTomorrow: {
      backgroundColor: '#FDFAFF',
      borderColor: '#E9D5FF',
    },

    slotCardSelectedTomorrow: {
      borderColor: '#7C3AED',
      backgroundColor: '#FAF5FF',
      borderWidth: 2,
    },

    slotIconTomorrow: {
      backgroundColor: '#EDE9FE',
    },

    etaTextTomorrow: {
      color: '#7C3AED',
    },

    etaTextSelectedTomorrow: {
      color: '#7C3AED',
    },

    slotTimeSelectedTomorrow: {
      color: '#7C3AED',
    },

    slotAvailableTextTomorrow: {
      color: '#6D28D9',
      fontWeight: '600',
    },

    slotRadioTomorrow: {
      borderColor: '#DDD6FE',
    },

    slotRadioSelectedTomorrow: {
      borderColor: '#7C3AED',
    },

    slotRadioDotTomorrow: {
      backgroundColor: '#7C3AED',
    },

    preBookingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      backgroundColor: '#EDE9FE',
    },

    preBookingBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#7C3AED',
      letterSpacing: 0.5,
    },

    preBookingBanner: {
      marginTop: 6,
      borderRadius: 12,
      backgroundColor: '#FAF5FF',
      borderWidth: 1.5,
      borderColor: '#C4B5FD',
      padding: 14,
    },

    preBookingBannerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    preBookingBannerIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#EDE9FE',
      alignItems: 'center',
      justifyContent: 'center',
    },

    preBookingBannerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    preBookingBannerTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: '#6D28D9',
      letterSpacing: 0.5,
    },

    preBookingLiveTag: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: '#7C3AED',
    },

    preBookingLiveTagText: {
      fontSize: 9,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    preBookingBannerSlot: {
      fontSize: 13,
      fontWeight: '700',
      color: '#1F2937',
      marginTop: 3,
    },

    preBookingBannerDivider: {
      height: 1,
      backgroundColor: '#E9D5FF',
      marginVertical: 10,
    },

    preBookingBannerFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    preBookingBannerFooterText: {
      fontSize: 11,
      fontWeight: '500',
      color: '#6D28D9',
      flex: 1,
    },

    bottomPreBookingHighlight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 8,
      backgroundColor: '#FAF5FF',
      borderWidth: 1,
      borderColor: '#E9D5FF',
    },

    bottomPreBookingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: '#EDE9FE',
    },

    bottomPreBookingBadgeText: {
      fontSize: 9,
      fontWeight: '800',
      color: '#7C3AED',
    },

    bottomPreBookingDateText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#4B5563',
      flex: 1,
    },

    // ================================================
    // PAYMENT
    // ================================================

    paymentRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    paymentIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: '#F3F8F4',
      alignItems: 'center',
      justifyContent: 'center',
    },

    paymentInfo: {
      flex: 1,
      marginLeft: 12,
    },

    paymentTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: '#111111',
    },

    paymentSubtitle: {
      marginTop: 4,
      fontSize: 13,
      color: '#777777',
    },

    paymentRadio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: '#FF5A00',
      alignItems: 'center',
      justifyContent: 'center',
    },

    paymentRadioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#FF5A00',
    },

    // ================================================
    // ITEMS
    // ================================================

    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#EEEEEE',
    },

    lastItemRow: {
      borderBottomWidth: 0,
    },

    itemLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: 12,
    },

    quantityBadge: {
      minWidth: 38,
      height: 30,
      borderRadius: 8,
      backgroundColor: '#FFF2EA',
      alignItems: 'center',
      justifyContent: 'center',
    },

    quantityText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FF5A00',
    },

    itemInfo: {
      flex: 1,
      marginLeft: 10,
    },

    itemName: {
      fontSize: 14,
      fontWeight: '600',
      color: '#222222',
    },

    itemUnitPrice: {
      marginTop: 4,
      fontSize: 12,
      color: '#888888',
    },

    itemTotal: {
      fontSize: 14,
      fontWeight: '700',
      color: '#111111',
    },

    // ================================================
    // PRICE
    // ================================================

    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 13,
    },

    priceLabel: {
      fontSize: 14,
      color: '#666666',
    },

    priceValue: {
      fontSize: 14,
      fontWeight: '600',
      color: '#222222',
    },

    totalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
    },

    totalLabel: {
      fontSize: 18,
      fontWeight: '800',
      color: '#111111',
    },

    totalValue: {
      fontSize: 20,
      fontWeight: '800',
      color: '#FF5A00',
    },

    fixedBottomContainer: {
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      borderTopWidth: 1,
      borderTopColor: '#EEEEEE',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: -3},
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 8,
    },

    // ================================================
    // FOOTER
    // ================================================

    footerNote: {
      marginHorizontal: 30,
      marginTop: 12,
      textAlign: 'center',
      fontSize: 12,
      lineHeight: 18,
      color: '#888888',
    },

    // ================================================
    // CENTER STATES
    // ================================================

    centerContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 30,
    },

    centerTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: '#111111',
      textAlign: 'center',
    },

    centerDescription: {
      marginTop: 8,
      marginBottom: 25,
      fontSize: 15,
      lineHeight: 22,
      color: '#666666',
      textAlign: 'center',
    },

    primaryButton: {
      paddingHorizontal: 30,
      paddingVertical: 13,
      borderRadius: 10,
      backgroundColor: '#FF5A00',
    },

    primaryButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });

export default CheckoutScreen;
