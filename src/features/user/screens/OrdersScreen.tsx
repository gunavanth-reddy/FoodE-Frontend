import React, {useCallback, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  ArrowLeft,
  Storefront,
  CalendarBlank,
  Star,
  CaretRight,
  Receipt,
  XCircle,
} from 'phosphor-react-native';

import {useAuth} from '../../../context/AuthContext';

import {
  getMyOrders,
  cancelOrder,
  UserOrder,
  OrderItem,
} from '../services/orderService';

import EmptyOrders from '../components/orders/EmptyOrders';
import DateFilterCalendar, {
  getLocalDateKey,
} from '../../../components/common/DateFilterCalendar';

const ORANGE = '#FF6B00';

const uniqueOrdersById = <T extends {_id: string}>(
  orders: T[],
): T[] => {
  const seenIds = new Set<string>();
  return orders.filter(order => {
    if (seenIds.has(order._id)) {
      return false;
    }
    seenIds.add(order._id);
    return true;
  });
};

const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const {token, isLoggedIn, user} = useAuth();

  const {width, height} = useWindowDimensions();

  const isCompactWidth = width < 360;
  const isShortScreen = height < 700;

  const horizontalPadding =
    isCompactWidth
      ? 12
      : width >= 600
        ? 28
        : 18;

  const cardPadding = isCompactWidth ? 12 : 16;

  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [selectedDate, setSelectedDate] = useState(getLocalDateKey);
  const selectedDateRef = useRef(selectedDate);
  const loadedPages = useRef(1);
  const loadingMoreRef = useRef(false);
  const loadRequestId = useRef(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [cancellingOrderId, setCancellingOrderId] =
    useState<string | null>(null);

  // =====================================================
  // LOAD ORDERS
  // =====================================================

  const loadOrders = useCallback(
    async (showLoader = true, targetPageCount?: number) => {
      const requestId = ++loadRequestId.current;

      if (!isLoggedIn || !token) {
        setOrders([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        if (showLoader) {
          setLoading(true);
        }

        const dateStorageKey =
          `foode.customer-orders.date.${user?.id || 'account'}`;

        const savedDate = await AsyncStorage.getItem(dateStorageKey);

        if (savedDate && targetPageCount === undefined) {
          selectedDateRef.current = savedDate;
          setSelectedDate(savedDate);
        }

        const requestDate = selectedDateRef.current;

        const storageKey =
          `foode.customer-orders.pages.${user?.id || 'account'}.${requestDate}`;

        const storedPageCount = Number(
          await AsyncStorage.getItem(storageKey),
        );

        const savedPageCount =
          targetPageCount ??
          (Number.isSafeInteger(storedPageCount) && storedPageCount > 0
            ? Math.min(storedPageCount, 10000)
            : 1);

        const loadedOrders: UserOrder[] = [];
        let nextHasMore = true;
        let pagesLoaded = 0;

        for (let page = 1; page <= savedPageCount; page += 1) {
          const result = await getMyOrders(
            token,
            page,
            requestDate,
          );

          loadedOrders.push(...result.orders);
          pagesLoaded = page;
          nextHasMore = result.hasMore;

          if (!nextHasMore) {
            break;
          }
        }

        if (requestId !== loadRequestId.current) {
          return;
        }

        console.log(
          'FOODE ORDERS SCREEN:',
          loadedOrders.length,
        );

        loadedPages.current = Math.max(1, pagesLoaded);

        await AsyncStorage.setItem(
          storageKey,
          String(loadedPages.current),
        );

        setOrders(uniqueOrdersById(loadedOrders));
        setHasMore(nextHasMore);
      } catch (error: any) {
        if (requestId !== loadRequestId.current) {
          return;
        }

        console.log('Orders screen error:', error);

        Alert.alert(
          'Unable to Load Orders',
          error?.message ||
            'Something went wrong while loading your orders.',
        );
      } finally {
        if (requestId === loadRequestId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [token, isLoggedIn, user?.id],
  );

  // =====================================================
  // REFRESH ON SCREEN FOCUS
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

  // =====================================================
  // PULL TO REFRESH
  // =====================================================

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders(false);
  }, [loadOrders]);

  const handleDateChange = useCallback(
    async (date: string) => {
      selectedDateRef.current = date;
      loadRequestId.current += 1;
      loadedPages.current = 1;

      setOrders([]);
      setHasMore(true);
      setSelectedDate(date);

      await AsyncStorage.setItem(
        `foode.customer-orders.date.${user?.id || 'account'}`,
        date,
      );

      if (user?.id) {
        await AsyncStorage.setItem(
          `foode.customer-orders.pages.${user.id}.${date}`,
          '1',
        );
      }

      await loadOrders(true, 1);
    },
    [loadOrders, user?.id],
  );

  const loadNextPage = useCallback(async () => {
    if (!token || !hasMore || loadingMoreRef.current) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const requestDate = selectedDateRef.current;
      const requestId = loadRequestId.current;
      const nextPage = loadedPages.current + 1;

      const result = await getMyOrders(
        token,
        nextPage,
        requestDate,
      );

      if (
        requestDate !== selectedDateRef.current ||
        requestId !== loadRequestId.current
      ) {
        return;
      }

      loadedPages.current = nextPage;

      setOrders(current =>
        uniqueOrdersById([...current, ...result.orders]),
      );

      setHasMore(result.hasMore);

      await AsyncStorage.setItem(
        `foode.customer-orders.pages.${user?.id || 'account'}.${selectedDateRef.current}`,
        String(nextPage),
      );
    } catch (error: any) {
      console.error('Load more customer orders error:', error);

      Alert.alert(
        'Unable to Load More Orders',
        error?.message || 'Please try again.',
      );
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, token, user?.id]);

  // =====================================================
  // RESTAURANT NAME
  // =====================================================

  const getRestaurantName = (order: UserOrder) => {
    if (
      typeof order.restaurant === 'object' &&
      order.restaurant
    ) {
      return order.restaurant.name || 'Restaurant';
    }

    return 'Restaurant';
  };

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // =====================================================
  // SAFE NUMBER
  // =====================================================

  const toNumber = (value: any): number => {
    const result = Number(value);

    return Number.isFinite(result) ? result : 0;
  };

  // =====================================================
  // GET UNIT PRICE
  // =====================================================

  const getUnitPrice = (food: OrderItem): number => {
    const originalPrice = toNumber(food.price);

    const discountedPrice =
      food.discountedPrice !== null &&
      food.discountedPrice !== undefined
        ? toNumber(food.discountedPrice)
        : 0;

    if (
      discountedPrice > 0 &&
      discountedPrice < originalPrice
    ) {
      return discountedPrice;
    }

    return originalPrice;
  };

  // =====================================================
  // GET ITEM TOTAL
  // =====================================================

  const getItemTotal = (food: OrderItem): number => {
    const quantity = Math.max(
      1,
      toNumber(food.quantity),
    );

    const unitPrice = getUnitPrice(food);

    return unitPrice * quantity;
  };

  // =====================================================
  // GET SUBTOTAL
  // =====================================================

  const getSubtotal = (order: UserOrder): number => {
    const backendSubtotal = toNumber(order.subtotal);

    if (backendSubtotal > 0) {
      return backendSubtotal;
    }

    return order.items.reduce(
      (sum, food) => sum + getItemTotal(food),
      0,
    );
  };

  // =====================================================
  // GET ORDER TOTAL
  // =====================================================

  const getOrderTotal = (order: UserOrder): number => {
    const subtotal = getSubtotal(order);
    const deliveryFee = toNumber(order.deliveryFee);
    const discount = toNumber(order.discount);

    return Math.max(
      0,
      subtotal + deliveryFee - discount,
    );
  };

  // =====================================================
  // STATUS COLOR
  // =====================================================

  const getStatusColor = (status: UserOrder['status']) => {
    switch (status) {
      case 'DELIVERED':
        return '#15803D';

      case 'READY_FOR_DELIVERY':
        return '#7C3AED';

      case 'CONFIRMED':
        return '#2563EB';

      case 'CANCELLED':
        return '#DC2626';

      case 'PLACED':
      default:
        return '#D97706';
    }
  };

  // =====================================================
  // STATUS LABEL
  // =====================================================

  const getStatusLabel = (status: UserOrder['status']) => {
    switch (status) {
      case 'DELIVERED':
        return 'Delivered';

      case 'READY_FOR_DELIVERY':
        return 'Ready for Delivery';

      case 'CONFIRMED':
        return 'Confirmed';

      case 'CANCELLED':
        return 'Cancelled';

      case 'PLACED':
      default:
        return 'Placed';
    }
  };

  // =====================================================
  // CANCEL ORDER
  // =====================================================

  const handleCancelOrder = (order: UserOrder) => {
    if (order.status !== 'PLACED') {
      Alert.alert(
        'Cannot Cancel',
        'This order has already been confirmed by the restaurant and cannot be cancelled.',
      );
      return;
    }

    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel order #${order.orderNumber}?`,
      [
        {
          text: 'Keep Order',
          style: 'cancel',
        },
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: async () => {
            if (!token) {
              return;
            }

            try {
              setCancellingOrderId(order._id);

              const updated = await cancelOrder(
                token,
                order._id,
              );

              setOrders(prev =>
                prev.map(o =>
                  o._id === order._id ? updated : o,
                ),
              );

              Alert.alert(
                'Order Cancelled',
                'Your order has been cancelled.',
              );
            } catch (err: any) {
              Alert.alert(
                'Unable to Cancel',
                err?.message || 'Please try again.',
              );
            } finally {
              setCancellingOrderId(null);
            }
          },
        },
      ],
    );
  };

  // =====================================================
  // REVIEW
  // =====================================================

  const handleReview = (order: UserOrder) => {
    if (order.status !== 'DELIVERED') {
      return;
    }

    navigation.navigate('Review', {order});
  };

  // =====================================================
  // ORDER CARD
  // =====================================================

  const renderOrder = ({item}: {item: UserOrder}) => {
    const statusColor = getStatusColor(item.status);

    const itemCount = item.items.reduce(
      (total, food) =>
        total + toNumber(food.quantity),
      0,
    );

    const subtotal = getSubtotal(item);
    const deliveryFee = toNumber(item.deliveryFee);
    const discount = toNumber(item.discount);
    const orderTotal = getOrderTotal(item);

    return (
      <View
        style={[
          styles.orderCard,
          {
            padding: cardPadding,
          },
        ]}>
        {/* HEADER */}

        <View style={styles.orderHeader}>
          <View style={styles.restaurantSection}>
            <View style={styles.restaurantIcon}>
              <Storefront
                size={23}
                color={ORANGE}
                weight="duotone"
              />
            </View>

            <View style={styles.restaurantInfo}>
              <Text
                style={styles.restaurantName}
                numberOfLines={1}>
                {getRestaurantName(item)}
              </Text>

              <Text
                style={styles.orderNumber}
                numberOfLines={1}>
                Order #{item.orderNumber}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: `${statusColor}14`,
              },
            ]}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: statusColor,
                },
              ]}
            />

            <Text
              style={[
                styles.statusText,
                {
                  color: statusColor,
                },
              ]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        {/* META */}

        <View style={styles.metaRow}>
          <CalendarBlank
            size={14}
            color="#8A8F98"
            weight="regular"
          />

          <Text style={styles.orderDate}>
            {formatDate(item.createdAt)}
          </Text>

          <View style={styles.metaDot} />

          <Text style={styles.itemCount}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {/* ITEMS */}

        <View style={styles.itemsContainer}>
          {item.items.map((food, index) => {
            const quantity = Math.max(
              1,
              toNumber(food.quantity),
            );

            const unitPrice = getUnitPrice(food);
            const itemTotal = getItemTotal(food);

            return (
              <View
                key={`${item._id}-${index}`}
                style={styles.itemBlock}>
                <View style={styles.itemRow}>
                  <View style={styles.quantityPill}>
                    <Text style={styles.itemQuantity}>
                      {quantity}×
                    </Text>
                  </View>

                  <Text
                    style={styles.itemName}
                    numberOfLines={2}>
                    {food.name || 'Food Item'}
                  </Text>

                  <Text style={styles.itemTotal}>
                    ₹{itemTotal.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.itemPriceDetails}>
                  <Text style={styles.unitPriceText}>
                    ₹{unitPrice.toFixed(2)} × {quantity}
                  </Text>

                  <Text style={styles.itemCalculation}>
                    = ₹{itemTotal.toFixed(2)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* PRICE BREAKDOWN
            Hidden for cancelled orders.
        */}

        {item.status !== 'CANCELLED' && (
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                Subtotal
              </Text>

              <Text style={styles.priceValue}>
                ₹{subtotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                Delivery fee
              </Text>

              <Text style={styles.priceValue}>
                ₹{deliveryFee.toFixed(2)}
              </Text>
            </View>

            {discount > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.discountLabel}>
                  Discount
                </Text>

                <Text style={styles.discountValue}>
                  -₹{discount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.priceDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                To be paid
              </Text>

              <Text style={styles.totalValue}>
                ₹{orderTotal.toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* REVIEW */}

        {item.status === 'DELIVERED' && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleReview(item)}
            style={styles.reviewButton}>
            <Star
              size={16}
              color="#FFFFFF"
              weight="fill"
            />

            <Text style={styles.reviewButtonText}>
              Rate & Review
            </Text>

            <CaretRight
              size={16}
              color="#FFFFFF"
              weight="bold"
              style={styles.reviewChevron}
            />
          </TouchableOpacity>
        )}

        {/* CANCEL ORDER — ONLY WHEN PLACED */}

        {item.status === 'PLACED' && (
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={cancellingOrderId === item._id}
            onPress={() => handleCancelOrder(item)}
            style={styles.cancelOrderButton}>
            {cancellingOrderId === item._id ? (
              <ActivityIndicator
                size="small"
                color="#DC2626"
              />
            ) : (
              <>
                <XCircle
                  size={16}
                  color="#DC2626"
                  weight="bold"
                />

                <Text style={styles.cancelOrderText}>
                  Cancel Order
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // =====================================================
  // SCREEN
  // =====================================================

  return (
    <SafeAreaView
      style={styles.container}
      edges={['left', 'right']}>
      <StatusBar
        backgroundColor="#FF7A00"
        barStyle="light-content"
        hidden={false}
        translucent={false}
      />

      {/* HEADER */}

      <View
        style={[
          styles.pageHeader,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop: isShortScreen ? 12 : 16,
            paddingBottom: isShortScreen ? 12 : 16,
          },
        ]}>
        {navigation.canGoBack() ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            activeOpacity={0.75}
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <ArrowLeft
              size={22}
              color="#1E232C"
              weight="bold"
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerIcon}>
            <Receipt
              size={23}
              color={ORANGE}
              weight="duotone"
            />
          </View>
        )}

        <View style={styles.headerTextContainer}>
          <Text
            style={[
              styles.title,
              {
                fontSize: isCompactWidth ? 22 : 25,
              },
            ]}>
            My Orders
          </Text>

          <Text style={styles.subtitle}>
            Your FoodE order history
          </Text>
        </View>

        {!loading && orders.length > 0 && (
          <View style={styles.orderCountBadge}>
            <Text style={styles.orderCountText}>
              {orders.length}
            </Text>
          </View>
        )}
      </View>

      <DateFilterCalendar
        value={selectedDate}
        onChange={handleDateChange}
      />

      {/* LOADING */}

      {loading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator
              size="large"
              color={ORANGE}
            />
          </View>

          <Text style={styles.loadingTitle}>
            Loading your orders
          </Text>

          <Text style={styles.loadingText}>
            Just a moment...
          </Text>
        </View>
      ) : orders.length === 0 ? (
        /* EMPTY */
        <ScrollView
          contentContainerStyle={styles.emptyContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[ORANGE]}
              tintColor={ORANGE}
            />
          }>
          <EmptyOrders />
        </ScrollView>
      ) : (
        /* ORDERS */
        <FlatList
          data={orders}
          keyExtractor={item => item._id}
          renderItem={renderOrder}
          onEndReached={loadNextPage}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                style={styles.loadingMore}
                color={ORANGE}
              />
            ) : null
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingHorizontal: horizontalPadding,
            },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[ORANGE]}
              tintColor={ORANGE}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default OrdersScreen;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  // HEADER

  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFCF8',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FFF2E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  headerTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#7B8190',
  },

  orderCountBadge: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 15,
    backgroundColor: '#FFF0E5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  orderCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: ORANGE,
  },

  // LIST

  listContent: {
    paddingTop: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },

  loadingMore: {
    paddingVertical: 18,
  },

  // ORDER CARD

  orderCard: {
    backgroundColor: '#FFFCF8',
    borderRadius: 20,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: 8,
  },

  restaurantSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },

  restaurantIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FFF2E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  restaurantInfo: {
    flex: 1,
    marginLeft: 11,
  },

  restaurantName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#171923',
  },

  orderNumber: {
    marginTop: 4,
    fontSize: 11,
    color: '#9297A2',
  },

  // STATUS

  statusBadge: {
    flexDirection: 'row',
    flexShrink: 0,
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 9,
    maxWidth: 118,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  // META

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },

  orderDate: {
    marginLeft: 6,
    fontSize: 11,
    color: '#858B96',
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#C2C6CE',
    marginHorizontal: 9,
  },

  itemCount: {
    fontSize: 11,
    color: '#858B96',
  },

  // ITEMS

  itemsContainer: {
    marginTop: 14,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
  },

  itemBlock: {
    paddingBottom: 11,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F3F4',
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  quantityPill: {
    minWidth: 34,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: '#FFF3E9',
    alignItems: 'center',
    marginRight: 9,
  },

  itemQuantity: {
    fontSize: 11,
    fontWeight: '800',
    color: ORANGE,
  },

  itemName: {
    flex: 1,
    fontSize: 13,
    color: '#454B56',
    lineHeight: 18,
  },

  itemTotal: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '800',
    color: '#171923',
  },

  itemPriceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 43,
    marginTop: 5,
  },

  unitPriceText: {
    fontSize: 11,
    color: '#858B96',
  },

  itemCalculation: {
    marginLeft: 8,
    fontSize: 11,
    fontWeight: '700',
    color: '#454B56',
  },

  // PRICE BREAKDOWN

  priceBreakdown: {
    marginTop: 4,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  priceLabel: {
    fontSize: 12,
    color: '#737986',
  },

  priceValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#454B56',
  },

  discountLabel: {
    fontSize: 12,
    color: '#15803D',
  },

  discountValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },

  priceDivider: {
    height: 1,
    backgroundColor: '#F0F1F3',
    marginVertical: 5,
  },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },

  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#737986',
  },

  totalValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#171923',
  },

  // REVIEW

  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    backgroundColor: ORANGE,
    borderRadius: 12,
    paddingVertical: 13,
  },

  reviewButtonText: {
    marginLeft: 7,
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  reviewChevron: {
    position: 'absolute',
    right: 13,
  },

  // CANCEL ORDER

  cancelOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingVertical: 11,
  },

  cancelOrderText: {
    marginLeft: 7,
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },

  // LOADING

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  loadingIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#FFFCF8',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },

  loadingTitle: {
    marginTop: 18,
    fontSize: 16,
    fontWeight: '700',
    color: '#20232B',
  },

  loadingText: {
    marginTop: 6,
    fontSize: 13,
    color: '#858B96',
  },

  // EMPTY

  emptyContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
});
