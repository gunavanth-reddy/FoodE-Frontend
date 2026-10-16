import React from 'react';
import {ChefHat} from 'phosphor-react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';

import {RootStackParamList} from '../../../navigation/AppNavigator';

import FloatingParticles from '../components/orders/FloatingParticles';
import SuccessAnimation from '../components/orders/SuccessAnimation';
import OrderInfoCard from '../components/orders/OrderInfoCard';
import SuccessButtons from '../components/orders/SuccessButtons';

import useSuccessAnimation from '../hooks/useSuccessAnimation';

// =====================================================
// NAVIGATION
// =====================================================

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    'OrderSuccess'
  >;

// =====================================================
// ROUTE
// =====================================================

type OrderSuccessRouteProp =
  RouteProp<
    RootStackParamList,
    'OrderSuccess'
  >;

// =====================================================
// HELPERS
// =====================================================

const getRestaurantName = (
  restaurant: any,
): string => {
  if (!restaurant) {
    return 'Restaurant';
  }

  if (typeof restaurant === 'string') {
    return restaurant;
  }

  return (
    restaurant.name ||
    restaurant.restaurantName ||
    'Restaurant'
  );
};

// =====================================================
// PAYMENT METHOD
// =====================================================

const getPaymentMethod = (
  paymentMethod?: string,
): string => {
  if (!paymentMethod) {
    return 'Cash on Delivery';
  }

  if (paymentMethod === 'COD') {
    return 'Cash on Delivery';
  }

  if (paymentMethod === 'ONLINE') {
    return 'Online Payment';
  }

  return paymentMethod;
};

// =====================================================
// FORMAT TIME
// =====================================================

const formatTime = (
  time?: string,
): string => {
  if (!time) {
    return '';
  }

  const [hours, minutes] =
    time.split(':').map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return time;
  }

  const date = new Date();

  date.setHours(
    hours,
    minutes,
    0,
    0,
  );

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
};

// =====================================================
// ESTIMATED DELIVERY
// =====================================================

const getEstimatedDelivery = (
  deliverySlot: any,
): string => {
  if (
    deliverySlot?.startTime &&
    deliverySlot?.endTime
  ) {
    const startTime = formatTime(
      deliverySlot.startTime,
    );

    const endTime = formatTime(
      deliverySlot.endTime,
    );

    return `${startTime} – ${endTime}`;
  }

  return 'Delivery time unavailable';
};

// =====================================================
// CALCULATE ITEMS TOTAL
// =====================================================

const getItemsTotal = (
  items: any[],
): number => {
  if (!Array.isArray(items)) {
    return 0;
  }

  return items.reduce(
    (sum: number, item: any) => {
      const quantity =
        Number(item?.quantity || 1);

      // Always use the original food price
      // saved in the order.
      const price =
        Number(item?.price || 0);

      return sum + price * quantity;
    },
    0,
  );
};

// =====================================================
// SCREEN
// =====================================================

const OrderSuccessScreen: React.FC = () => {
  const navigation =
    useNavigation<NavigationProp>();

  const route =
    useRoute<OrderSuccessRouteProp>();

  const order = route.params?.order;

  const {
    titleOpacity,
    cardOpacity,
    cardTranslateY,
    buttonsOpacity,
    buttonsTranslateY,
  } = useSuccessAnimation();

  // ===================================================
  // BASIC ORDER DATA
  // ===================================================

  const restaurantName =
    getRestaurantName(
      order?.restaurant,
    );

  const paymentMethod =
    getPaymentMethod(
      order?.paymentMethod,
    );

  // ===================================================
  // DELIVERY SLOT
  // ===================================================

  const deliverySlot =
    order?.deliverySlot;

  // ===================================================
  // ITEMS
  // ===================================================

  const orderItems: any[] =
    Array.isArray(order?.items)
      ? order.items
      : [];

  // ===================================================
  // ITEM TOTAL
  // ===================================================

  /*
   * IMPORTANT:
   * Use backend subtotal when available.
   * This is the actual food/item cost saved
   * when the order was created.
   */

  const calculatedItemTotal =
    getItemsTotal(orderItems);

  const itemTotal =
  Number(order?.subtotal || 0) > 0
    ? Number(order?.subtotal || 0)
    : calculatedItemTotal;

  // ===================================================
  // DELIVERY FEE
  // ===================================================

  const deliveryFee =
    Number(
      order?.deliveryFee || 0,
    );

  // ===================================================
  // TOTAL
  // ===================================================

  /*
   * No discount.
   *
   * Total Amount =
   * Item Total + Delivery Charges
   */

  const calculatedTotal =
    Math.max(
      0,
      itemTotal +
        deliveryFee,
    );

  /*
   * Prefer backend total when it is
   * available and valid.
   *
   * Otherwise calculate it locally.
   */

  const backendTotal =
    Number(order?.total || 0);

  const total =
    backendTotal > 0
      ? backendTotal
      : calculatedTotal;

  // ===================================================
  // ESTIMATED DELIVERY
  // ===================================================

  const estimatedDelivery =
    getEstimatedDelivery(
      deliverySlot,
    );

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#FF7A00" barStyle="light-content" hidden={false} translucent={false} />
      {/* =========================================
          BACKGROUND
      ========================================= */}

      <FloatingParticles />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {/* =========================================
            SUCCESS ANIMATION
        ========================================= */}

        <SuccessAnimation />

        {/* =========================================
            SUCCESS TITLE
        ========================================= */}

        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity:
                titleOpacity,
            },
          ]}
        >
          <View
            style={
              styles.successBadge
            }
          >
            <Text
              style={
                styles.successBadgeText
              }
            >
              ✓ ORDER CONFIRMED
            </Text>
          </View>

          <Text style={styles.title}>
            Order placed
            {'\n'}
            successfully
          </Text>

          <Text style={styles.subtitle}>
            Your food is on its way
            {'\n'}
            to becoming your next meal.
          </Text>
        </Animated.View>

        {/* =========================================
            ORDER INFO CARD
        ========================================= */}

        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity:
                cardOpacity,

              transform: [
                {
                  translateY:
                    cardTranslateY,
                },
              ],
            },
          ]}
        >
          <OrderInfoCard
            orderId={
              order?.orderNumber ||
              order?._id ||
              '—'
            }

            restaurantName={
              restaurantName
            }

            paymentMethod={
              paymentMethod
            }

            deliveryStartTime={
              deliverySlot?.startTime
            }

            deliveryEndTime={
              deliverySlot?.endTime
            }

            estimatedDelivery={
              estimatedDelivery
            }

            subtotal={
              itemTotal
            }

            deliveryFee={
              deliveryFee
            }

            total={
              total
            }

            items={
              orderItems
            }
          />
        </Animated.View>

        {/* =========================================
            PREPARING MESSAGE
        ========================================= */}

        <Animated.View
          style={[
            styles.preparingCard,
            {
              opacity:
                cardOpacity,
            },
          ]}
        >
          <View
            style={
              styles.preparingIcon
            }
          >
            <ChefHat size={30} color="#FF7A00" weight="duotone" />
          </View>

          <View
            style={
              styles.preparingContent
            }
          >
            <Text
              style={
                styles.preparingTitle
              }
            >
              Your order is being prepared
            </Text>

            <Text
              style={
                styles.preparingSubtitle
              }
            >
              We'll notify you when it's
              {' '}
              out for delivery.
            </Text>
          </View>
        </Animated.View>

        {/* =========================================
            HOME BUTTON
        ========================================= */}

        <Animated.View
          style={[
            styles.buttonsContainer,
            {
              opacity:
                buttonsOpacity,

              transform: [
                {
                  translateY:
                    buttonsTranslateY,
                },
              ],
            },
          ]}
        >
          <SuccessButtons
            onBackHome={() =>
              navigation.navigate(
                'Main',
              )
            }
          />
        </Animated.View>

        {/* =========================================
            FOOTER
        ========================================= */}

        <Text
          style={styles.footerText}
        >
          Thank you for choosing FoodE ❤️
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderSuccessScreen;

// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFCF8',
    },

    content: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 34,
      paddingBottom: 45,
      alignItems: 'center',
    },

    // ===============================================
    // TITLE
    // ===============================================

    titleContainer: {
      width: '100%',
      alignItems: 'center',
      marginTop: 22,
    },

    successBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: '#ECFDF3',
    },

    successBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.7,
      color: '#16A34A',
    },

    title: {
      marginTop: 14,
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '800',
      color: '#111827',
      textAlign: 'center',
    },

    subtitle: {
      marginTop: 10,
      fontSize: 15,
      lineHeight: 22,
      color: '#6B7280',
      textAlign: 'center',
    },

    // ===============================================
    // CARD
    // ===============================================

    cardContainer: {
      width: '100%',
    },

    // ===============================================
    // PREPARING
    // ===============================================

    preparingCard: {
      width: '100%',
      marginTop: 16,
      padding: 15,
      borderRadius: 18,
      backgroundColor: '#FFF8F3',
      borderWidth: 1,
      borderColor: '#FFE7D5',
      flexDirection: 'row',
      alignItems: 'center',
    },

    preparingIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#FFFCF8',
      alignItems: 'center',
      justifyContent: 'center',
    },

    preparingEmoji: {
      fontSize: 22,
    },

    preparingContent: {
      flex: 1,
      marginLeft: 12,
    },

    preparingTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: '#222222',
    },

    preparingSubtitle: {
      marginTop: 3,
      fontSize: 12,
      lineHeight: 18,
      color: '#777777',
    },

    // ===============================================
    // BUTTONS
    // ===============================================

    buttonsContainer: {
      width: '100%',
    },

    // ===============================================
    // FOOTER
    // ===============================================

    footerText: {
      marginTop: 18,
      fontSize: 12,
      color: '#A0A0A0',
      textAlign: 'center',
    },
  });
