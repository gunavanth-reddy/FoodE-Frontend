import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  CheckCircle,
  ChefHat,
  Clock,
  MapPin,
} from 'phosphor-react-native';
import {
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {RootStackParamList} from '../../../navigation/AppNavigator';
import SuccessButtons from '../components/orders/SuccessButtons';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OrderSuccess'
>;

type OrderSuccessRouteProp = RouteProp<
  RootStackParamList,
  'OrderSuccess'
>;

const ORANGE = '#FF7A00';
const DARK = '#171717';
const MUTED = '#737373';
const BORDER = '#F0EDE9';
const GREEN = '#16A34A';

const getRestaurantName = (restaurant: any): string => {
  if (!restaurant) {
    return 'Restaurant';
  }

  if (typeof restaurant === 'string') {
    return restaurant;
  }

  return restaurant.name || restaurant.restaurantName || 'Restaurant';
};

const getPaymentMethod = (method?: string): string => {
  if (!method || method === 'COD') {
    return 'Cash on Delivery';
  }

  if (method === 'ONLINE') {
    return 'Online Payment';
  }

  return method;
};

const formatTime = (time?: string): string => {
  if (!time) {
    return '';
  }

  const [hours, minutes] = time.split(':').map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return time;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

const getQuantity = (item: any): number => {
  const quantity = Number(item?.quantity ?? 1);

  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
};

const getItemPrice = (item: any): number => {
  const price = Number(item?.price ?? 0);

  return Number.isFinite(price) && price >= 0 ? price : 0;
};

const getItemName = (item: any): string => {
  if (typeof item?.food === 'object' && item.food !== null) {
    return (
      item.food.name ||
      item.food.foodName ||
      item.name ||
      'Food item'
    );
  }

  return (
    item?.foodName ||
    item?.name ||
    (typeof item?.food === 'string' ? item.food : '') ||
    'Food item'
  );
};

/* Animated section wrapper */
const AnimatedSection: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({children, delay = 0}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [opacity, translateY, delay]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{translateY}],
      }}>
      {children}
    </Animated.View>
  );
};

/* Animated success icon */
const AnimatedSuccessIcon: React.FC = () => {
  const scale = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(0.85)).current;
  const pulseOpacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    entrance.start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1.45,
            duration: 1100,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1100,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 0.85,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.5,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    const timeout = setTimeout(() => {
      pulse.start();
    }, 400);

    return () => {
      clearTimeout(timeout);
      entrance.stop();
      pulse.stop();
    };
  }, [scale, opacity, pulseScale, pulseOpacity]);

  return (
    <View style={styles.successIconWrapper}>
      <Animated.View
        style={[
          styles.pulseRing,
          {
            opacity: pulseOpacity,
            transform: [{scale: pulseScale}],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.successIcon,
          {
            opacity,
            transform: [{scale}],
          },
        ]}>
        <CheckCircle size={52} color={GREEN} weight="fill" />
      </Animated.View>
    </View>
  );
};

const OrderSuccessScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OrderSuccessRouteProp>();

  const order = route.params?.order;

  const restaurantName = getRestaurantName(order?.restaurant);
  const paymentMethod = getPaymentMethod(order?.paymentMethod);

  const items: any[] = Array.isArray(order?.items)
    ? order.items
    : [];

  const calculatedSubtotal = items.reduce(
    (sum: number, item: any) =>
      sum + getItemPrice(item) * getQuantity(item),
    0,
  );

  const savedSubtotal = Number(order?.subtotal);

  const subtotal =
    Number.isFinite(savedSubtotal) && savedSubtotal >= 0
      ? savedSubtotal
      : calculatedSubtotal;

  const savedDeliveryFee = Number(order?.deliveryFee ?? 0);

  const deliveryFee =
    Number.isFinite(savedDeliveryFee) && savedDeliveryFee >= 0
      ? savedDeliveryFee
      : 0;

  const savedTotal = Number(order?.total);

  const total =
    Number.isFinite(savedTotal) && savedTotal >= 0
      ? savedTotal
      : subtotal + deliveryFee;

  const deliverySlot = order?.deliverySlot;

  const deliveryTime =
    deliverySlot?.startTime && deliverySlot?.endTime
      ? `${formatTime(deliverySlot.startTime)} – ${formatTime(
          deliverySlot.endTime,
        )}`
      : 'To be confirmed';

  const orderStatus = order?.status || 'Confirmed';

  const deliveryAddress = order?.deliveryAddress;

  const address =
    typeof deliveryAddress === 'string'
      ? deliveryAddress
      : deliveryAddress && typeof deliveryAddress === 'object'
        ? (deliveryAddress as any)?.address ||
          (deliveryAddress as any)?.fullAddress ||
          ''
        : '';

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
        translucent={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {/* SUCCESS HEADER */}
        <AnimatedSection>
          <View style={styles.successHeader}>
            <AnimatedSuccessIcon />

            <Text style={styles.successTitle}>Order placed!</Text>

            <Text style={styles.successSubtitle}>
              Your order has been confirmed successfully.
            </Text>

            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />

              <Text style={styles.statusText}>
                {String(orderStatus).toUpperCase()}
              </Text>
            </View>
          </View>
        </AnimatedSection>

        {/* RESTAURANT AND DELIVERY DETAILS */}
        <AnimatedSection delay={100}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Order details</Text>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <ChefHat
                  size={22}
                  color={ORANGE}
                  weight="duotone"
                />
              </View>

              <View style={styles.detailContent}>
                <Text style={styles.label}>RESTAURANT</Text>

                <Text style={styles.detailValue}>
                  {restaurantName}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Clock
                  size={22}
                  color={ORANGE}
                  weight="duotone"
                />
              </View>

              <View style={styles.detailContent}>
                <Text style={styles.label}>DELIVERY TIME</Text>

                <Text style={styles.detailValue}>
                  {deliveryTime}
                </Text>
              </View>
            </View>

            {address ? (
              <>
                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <MapPin
                      size={22}
                      color={ORANGE}
                      weight="duotone"
                    />
                  </View>

                  <View style={styles.detailContent}>
                    <Text style={styles.label}>
                      DELIVERY ADDRESS
                    </Text>

                    <Text style={styles.detailValue}>
                      {address}
                    </Text>
                  </View>
                </View>
              </>
            ) : null}

            <View style={styles.divider} />

            <View style={styles.paymentRow}>
              <Text style={styles.label}>PAYMENT METHOD</Text>

              <Text style={styles.paymentValue}>
                {paymentMethod}
              </Text>
            </View>
          </View>
        </AnimatedSection>

        {/* ORDERED ITEMS AND BILL */}
        <AnimatedSection delay={170}>
          <View style={styles.card}>
            <View style={styles.itemsHeader}>
              <Text style={styles.sectionTitle}>Your items</Text>

              <Text style={styles.itemCount}>
                {items.reduce(
                  (sum: number, item: any) =>
                    sum + getQuantity(item),
                  0,
                )}{' '}
                items
              </Text>
            </View>

            {items.length > 0 ? (
              items.map((item: any, index: number) => {
                const quantity = getQuantity(item);
                const price = getItemPrice(item);

                return (
                  <View
                    key={String(
                      item?._id || item?.food?._id || index,
                    )}
                    style={[
                      styles.itemRow,
                      index !== items.length - 1 &&
                        styles.itemBorder,
                    ]}>
                    <View style={styles.quantityBadge}>
                      <Text style={styles.quantityText}>
                        {quantity}×
                      </Text>
                    </View>

                    <Text style={styles.foodName}>
                      {getItemName(item)}
                    </Text>

                    <Text style={styles.foodPrice}>
                      {formatCurrency(price * quantity)}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>
                Item details are unavailable.
              </Text>
            )}

            {/* BILL SUMMARY */}
            <View style={styles.billDivider} />

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Item total</Text>

              <Text style={styles.billValue}>
                {formatCurrency(subtotal)}
              </Text>
            </View>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>
                Delivery charges
              </Text>

              <Text style={styles.billValue}>
                {deliveryFee === 0
                  ? 'Free'
                  : formatCurrency(deliveryFee)}
              </Text>
            </View>

            <View style={styles.totalDivider} />

            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>
                  Total amount
                </Text>

                <Text style={styles.totalCaption}>
                  Inclusive of shown charges
                </Text>
              </View>

              <Text style={styles.totalAmount}>
                {formatCurrency(total)}
              </Text>
            </View>
          </View>
        </AnimatedSection>

        {/* WHAT'S NEXT */}
        <AnimatedSection delay={240}>
          <View style={styles.preparingCard}>
            <View style={styles.preparingIcon}>
              <ChefHat
                size={25}
                color={ORANGE}
                weight="duotone"
              />
            </View>

            <View style={styles.preparingContent}>
              <Text style={styles.preparingTitle}>
                What's next?
              </Text>

              <Text style={styles.preparingText}>
                Your restaurant will prepare your order. You can
                check its progress in your orders section.
              </Text>
            </View>
          </View>
        </AnimatedSection>

        {/* BACK TO HOME — CLOSE TO WHAT'S NEXT */}
        <AnimatedSection delay={300}>
          <View style={styles.buttonsContainer}>
            <SuccessButtons
              onBackHome={() => navigation.navigate('Main')}
            />
          </View>
        </AnimatedSection>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },

  /* SUCCESS HEADER */
  successHeader: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 18,
  },

  successIconWrapper: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  pulseRing: {
    position: 'absolute',
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#D1FAE5',
  },

  successIcon: {
    width: 65,
    height: 65,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAFBF0',
  },

  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: DARK,
    textAlign: 'center',
  },

  successSubtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: MUTED,
    textAlign: 'center',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#ECFDF3',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: GREEN,
    marginRight: 6,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: GREEN,
    letterSpacing: 0.6,
  },

  /* CARDS */
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFE4CC',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    shadowColor: ORANGE,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: DARK,
    marginBottom: 13,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },

  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF3E7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailContent: {
    flex: 1,
    marginLeft: 11,
  },

  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: MUTED,
  },

  detailValue: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: DARK,
  },

  divider: {
    height: 1,
    backgroundColor: '#F3F1EE',
    marginVertical: 12,
  },

  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },

  paymentValue: {
    fontSize: 12,
    fontWeight: '700',
    color: DARK,
  },

  /* ITEMS */
  itemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  itemCount: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '600',
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F1EE',
  },

  quantityBadge: {
    minWidth: 35,
    height: 27,
    paddingHorizontal: 6,
    borderRadius: 7,
    backgroundColor: '#FFF3E7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityText: {
    fontSize: 11,
    fontWeight: '800',
    color: ORANGE,
  },

  foodName: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    color: DARK,
  },

  foodPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: DARK,
  },

  emptyText: {
    fontSize: 13,
    color: MUTED,
    paddingVertical: 8,
  },

  /* BILL */
  billDivider: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E8E4DF',
    marginTop: 4,
    marginBottom: 12,
  },

  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  billLabel: {
    fontSize: 13,
    color: MUTED,
  },

  billValue: {
    fontSize: 13,
    fontWeight: '600',
    color: DARK,
  },

  totalDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 5,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: DARK,
  },

  totalCaption: {
    marginTop: 3,
    fontSize: 10,
    color: MUTED,
  },

  totalAmount: {
    fontSize: 21,
    fontWeight: '900',
    color: ORANGE,
  },

  /* WHAT'S NEXT */
  preparingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderRadius: 14,
    backgroundColor: '#FFF8F1',
    borderWidth: 1,
    borderColor: '#FFE4CC',

    // Reduced space below this card
    marginBottom: 6,
  },

  preparingIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  preparingContent: {
    flex: 1,
    marginLeft: 11,
  },

  preparingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: DARK,
  },

  preparingText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: MUTED,
  },

  /* BACK TO HOME */
  buttonsContainer: {
    width: '100%',
    marginTop: 0,
    marginBottom: 4,
  },
});
