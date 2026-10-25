import React, {useCallback, useRef, useState} from 'react';
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
  Storefront,
  CalendarBlank,
  Star,
  CaretRight,
  Receipt,
  XCircle,
  Bicycle,
  ChatCircleDots,
} from 'phosphor-react-native';
import AppBackButton from '../../../components/buttons/AppBackButton';

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
import {formatTime12} from '../../../utils/time';

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

  const {token, isLoggedIn} = useAuth();
  const {width} = useWindowDimensions();

  const isCompactWidth = width < 360;
  const horizontalPadding = isCompactWidth ? 12 : 16;

  // Requirement 4: Always default to today's date
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateKey);
  const selectedDateRef = useRef<string>(getLocalDateKey());

  const loadedPages = useRef(1);
  const loadingMoreRef = useRef(false);
  const loadRequestId = useRef(0);

  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  // =====================================================
  // LOAD ORDERS
  // =====================================================

  const loadOrders = useCallback(
    async (showLoader = true, targetDate?: string, targetPage = 1) => {
      const requestId = ++loadRequestId.current;

      if (!isLoggedIn || !token) {
        setOrders([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const requestDate = targetDate || selectedDateRef.current;

      try {
        if (showLoader) {
          setLoading(true);
        }

        const result = await getMyOrders(token, targetPage, requestDate);

        if (requestId !== loadRequestId.current) {
          return;
        }

        loadedPages.current = targetPage;
        setOrders(uniqueOrdersById(result.orders));
        setHasMore(result.hasMore);
      } catch (error: any) {
        if (requestId !== loadRequestId.current) {
          return;
        }

        console.log('Orders screen error:', error);
        Alert.alert(
          'Unable to Load Orders',
          error?.message || 'Something went wrong while loading your orders.',
        );
      } finally {
        if (requestId === loadRequestId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [token, isLoggedIn],
  );

  // =====================================================
  // REFRESH ON SCREEN FOCUS — ALWAYS DEFAULT TO TODAY
  // Requirement 4: make sure order screen is displaying todays orders
  // as default when user change the date also after coming to same screen
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      const today = getLocalDateKey();
      selectedDateRef.current = today;
      setSelectedDate(today);
      loadedPages.current = 1;
      loadOrders(true, today, 1);
    }, [loadOrders]),
  );

  // =====================================================
  // PULL TO REFRESH
  // =====================================================

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders(false, selectedDateRef.current, 1);
  }, [loadOrders]);

  // =====================================================
  // DATE FILTER CHANGE
  // =====================================================

  const handleDateChange = useCallback(
    (date: string) => {
      selectedDateRef.current = date;
      setSelectedDate(date);
      loadedPages.current = 1;
      setOrders([]);
      setHasMore(true);
      loadOrders(true, date, 1);
    },
    [loadOrders],
  );

  // =====================================================
  // PAGINATION
  // =====================================================

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

      const result = await getMyOrders(token, nextPage, requestDate);

      if (
        requestDate !== selectedDateRef.current ||
        requestId !== loadRequestId.current
      ) {
        return;
      }

      loadedPages.current = nextPage;
      setOrders(current => uniqueOrdersById([...current, ...result.orders]));
      setHasMore(result.hasMore);
    } catch (error: any) {
      console.error('Load more customer orders error:', error);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, token]);

  // =====================================================
  // HELPERS
  // =====================================================

  const getRestaurantName = (order: UserOrder) => {
    if (typeof order.restaurant === 'object' && order.restaurant) {
      return order.restaurant.name || 'Restaurant';
    }
    return 'Restaurant';
  };

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

  const toNumber = (value: any): number => {
    const result = Number(value);
    return Number.isFinite(result) ? result : 0;
  };

  const getUnitPrice = (food: OrderItem): number => {
    const originalPrice = toNumber(food.price);
    const discountedPrice =
      food.discountedPrice !== null && food.discountedPrice !== undefined
        ? toNumber(food.discountedPrice)
        : 0;

    if (discountedPrice > 0 && discountedPrice < originalPrice) {
      return discountedPrice;
    }
    return originalPrice;
  };

  const getItemTotal = (food: OrderItem): number => {
    const quantity = Math.max(1, toNumber(food.quantity));
    const unitPrice = getUnitPrice(food);
    return unitPrice * quantity;
  };

  const getSubtotal = (order: UserOrder): number => {
    const backendSubtotal = toNumber(order.subtotal);
    if (backendSubtotal > 0) {
      return backendSubtotal;
    }
    return order.items.reduce((sum, food) => sum + getItemTotal(food), 0);
  };

  const getOrderTotal = (order: UserOrder): number => {
    const subtotal = getSubtotal(order);
    const deliveryFee = toNumber(order.deliveryFee);
    const discount = toNumber(order.discount);
    return Math.max(0, subtotal + deliveryFee - discount);
  };

  const getStatusConfig = (status: UserOrder['status']) => {
    switch (status) {
      case 'DELIVERED':
        return {
          label: 'Delivered',
          color: '#15803D',
          bg: '#DCFCE7',
          borderColor: '#BBF7D0',
        };
      case 'READY_FOR_DELIVERY':
        return {
          label: 'Ready for Delivery',
          color: '#7C3AED',
          bg: '#F3E8FF',
          borderColor: '#E9D5FF',
        };
      case 'CONFIRMED':
        return {
          label: 'Confirmed',
          color: '#2563EB',
          bg: '#DBEAFE',
          borderColor: '#BFDBFE',
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          color: '#DC2626',
          bg: '#FEE2E2',
          borderColor: '#FECACA',
        };
      case 'PLACED':
      default:
        return {
          label: 'Placed',
          color: '#D97706',
          bg: '#FEF3C7',
          borderColor: '#FDE68A',
        };
    }
  };

  const formatDeliverySlot = (slot?: UserOrder['deliverySlot']) => {
    if (!slot || !slot.startTime || !slot.endTime) return null;
    const start = formatTime12(slot.startTime);
    const end = formatTime12(slot.endTime);

    const today = getLocalDateKey();
    let datePrefix = '';
    if (slot.date) {
      if (slot.date === today) {
        datePrefix = 'Today';
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = `${tomorrow.getFullYear()}-${String(
          tomorrow.getMonth() + 1,
        ).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
        if (slot.date === tomorrowStr) {
          datePrefix = 'Tomorrow (Pre-Booked)';
        } else {
          datePrefix = `${slot.date} (Pre-Booked)`;
        }
      }
    }

    return datePrefix ? `${datePrefix}, ${start} – ${end}` : `${start} – ${end}`;
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
        {text: 'Keep Order', style: 'cancel'},
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: async () => {
            if (!token) return;

            try {
              setCancellingOrderId(order._id);
              const updated = await cancelOrder(token, order._id);
              setOrders(prev =>
                prev.map(o => (o._id === order._id ? updated : o)),
              );
              Alert.alert('Order Cancelled', 'Your order has been cancelled.');
            } catch (err: any) {
              Alert.alert('Unable to Cancel', err?.message || 'Please try again.');
            } finally {
              setCancellingOrderId(null);
            }
          },
        },
      ],
    );
  };

  // =====================================================
  // RATE & REVIEW HANDLER
  // =====================================================

  const handleReview = (order: UserOrder) => {
    if (order.status !== 'DELIVERED') return;
    navigation.navigate('Review', {order});
  };

  // =====================================================
  // RENDER ORDER CARD (SUPER CLEAN, LIKE CART SCREEN)
  // =====================================================

  const renderOrder = ({item}: {item: UserOrder}) => {
    const status = getStatusConfig(item.status);
    const itemCount = item.items.reduce(
      (total, food) => total + toNumber(food.quantity),
      0,
    );
    const subtotal = getSubtotal(item);
    const deliveryFee = toNumber(item.deliveryFee);
    const discount = toNumber(item.discount);
    const orderTotal = getOrderTotal(item);
    const slotLabel = formatDeliverySlot(item.deliverySlot);
    const review = item.review;

    return (
      <View style={styles.orderCard}>
        {/* RESTAURANT TOP HEADER */}
        <View style={styles.orderTopHeader}>
          <View style={styles.restaurantSection}>
            <View style={styles.restaurantIcon}>
              <Storefront size={20} color={ORANGE} weight="duotone" />
            </View>

            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName} numberOfLines={1}>
                {getRestaurantName(item)}
              </Text>
              <Text style={styles.orderMetaText} numberOfLines={1}>
                #{item.orderNumber} • {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>

          {/* STATUS BADGE */}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: status.bg,
                borderColor: status.borderColor,
              },
            ]}>
            <View
              style={[
                styles.statusDot,
                {backgroundColor: status.color},
              ]}
            />
            <Text style={[styles.statusText, {color: status.color}]}>
              {status.label}
            </Text>
          </View>
        </View>

        {/* ITEMS LIST */}
        <View style={styles.itemsSection}>
          {item.items.map((food, index) => {
            const quantity = Math.max(1, toNumber(food.quantity));
            const itemTotal = getItemTotal(food);

            return (
              <View
                key={`${item._id}-food-${index}`}
                style={[
                  styles.itemRow,
                  index === item.items.length - 1 && styles.itemRowLast,
                ]}>
                <View style={styles.itemQuantityBadge}>
                  <Text style={styles.itemQuantityText}>{quantity}x</Text>
                </View>

                <Text style={styles.itemName} numberOfLines={2}>
                  {food.name || 'Food Item'}
                </Text>

                <Text style={styles.itemPrice}>
                  ₹{itemTotal.toFixed(2)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* DELIVERY SLOT (IF PROVIDED) */}
        {slotLabel ? (
          <View style={styles.slotRow}>
            <Bicycle size={16} color={ORANGE} weight="duotone" />
            <Text style={styles.slotText}>
              Delivery slot: <Text style={styles.slotValue}>{slotLabel}</Text>
            </Text>
          </View>
        ) : null}

        {/* BILL SUMMARY */}
        {item.status !== 'CANCELLED' && (
          <View style={styles.billCard}>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>
                Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </Text>
              <Text style={styles.billValue}>₹{subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery Fee</Text>
              <Text style={styles.billValue}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
              </Text>
            </View>

            {discount > 0 && (
              <View style={styles.billRow}>
                <Text style={styles.discountLabel}>Discount</Text>
                <Text style={styles.discountValue}>-₹{discount.toFixed(2)}</Text>
              </View>
            )}

            <View style={styles.billDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                {String(item.status).toUpperCase() === 'DELIVERED'
                  ? 'Total Paid'
                  : 'To be paid'}
              </Text>
              <Text style={styles.totalValue}>₹{orderTotal.toFixed(2)}</Text>
            </View>
          </View>
        )}

        {/* REQUIREMENT 3: USER REVIEW DISPLAY UNDER ORDER DETAILS */}
        {review ? (
          <View style={styles.userReviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewTitleRow}>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map(starIndex => (
                    <Star
                      key={starIndex}
                      size={15}
                      weight="fill"
                      color={
                        starIndex <= Number(review.rating)
                          ? '#F59E0B'
                          : '#E5E7EB'
                      }
                    />
                  ))}
                </View>
                <Text style={styles.reviewScoreText}>
                  {Number(review.rating).toFixed(1)}
                </Text>
              </View>
            </View>

            {review.comment ? (
              <Text style={styles.reviewComment}>
                "{review.comment}"
              </Text>
            ) : null}

            {review.response ? (
              <View style={styles.restaurantReplyBox}>
                <View style={styles.replyHeader}>
                  <ChatCircleDots size={14} color="#4B5563" weight="bold" />
                  <Text style={styles.replyHeaderText}>
                    Restaurant Response
                  </Text>
                </View>
                <Text style={styles.replyCommentText}>
                  {review.response}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* RATE & REVIEW BUTTON (DELIVERED & NOT YET REVIEWED) */}
        {item.status === 'DELIVERED' && !review && (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => handleReview(item)}
            style={styles.rateButton}>
            <Star size={16} color="#FFFFFF" weight="fill" />
            <Text style={styles.rateButtonText}>Rate & Review Order</Text>
            <CaretRight size={14} color="#FFFFFF" weight="bold" />
          </TouchableOpacity>
        )}

        {/* CANCEL BUTTON (PLACED) */}
        {item.status === 'PLACED' && (
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={cancellingOrderId === item._id}
            onPress={() => handleCancelOrder(item)}
            style={styles.cancelButton}>
            {cancellingOrderId === item._id ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <>
                <XCircle size={16} color="#DC2626" weight="bold" />
                <Text style={styles.cancelButtonText}>Cancel Order</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // =====================================================
  // SCREEN RENDER
  // =====================================================

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar
        backgroundColor="#FF7A00"
        barStyle="light-content"
        hidden={false}
        translucent={false}
      />

      {/* HEADER (MATCHING CART SCREEN) */}
      <View style={[styles.header, {paddingHorizontal: horizontalPadding}]}>
        <View style={styles.headerLeft}>
          {navigation.canGoBack() && (
            <AppBackButton />
          )}

          <View>
            <Text style={styles.heading}>My Orders</Text>
            <Text style={styles.subheading}>
              {loading
                ? 'Checking orders...'
                : `${orders.length} ${
                    orders.length === 1 ? 'order' : 'orders'
                  } on this date`}
            </Text>
          </View>
        </View>

        {!loading && orders.length > 0 && (
          <View style={styles.orderBadge}>
            <Text style={styles.orderBadgeText}>{orders.length}</Text>
          </View>
        )}
      </View>

      {/* DATE FILTER CALENDAR BAR */}
      <View style={styles.calendarContainer}>
        <DateFilterCalendar
          value={selectedDate}
          onChange={handleDateChange}
        />
      </View>

      {/* BODY CONTENT */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      ) : orders.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
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
        <FlatList
          data={orders}
          keyExtractor={item => item._id}
          renderItem={renderOrder}
          onEndReached={loadNextPage}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={styles.loadingMore} color={ORANGE} />
            ) : (
              <View style={styles.footerSpacing} />
            )
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            {paddingHorizontal: horizontalPadding},
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
// STYLES (MATCHING CART SCREEN DESIGN LANGUAGE)
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBackButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E232C',
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 13,
    color: '#8A92A0',
    fontWeight: '500',
    marginTop: 2,
  },
  orderBadge: {
    backgroundColor: '#FFF2E6',
    borderWidth: 1,
    borderColor: '#FFE0C2',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  orderBadgeText: {
    color: ORANGE,
    fontSize: 13,
    fontWeight: '700',
  },
  calendarContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F2',
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  listContent: {
    paddingTop: 14,
    paddingBottom: 28,
  },
  loadingMore: {
    paddingVertical: 16,
  },
  footerSpacing: {
    height: 24,
  },

  // ORDER CARD STYLES
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECECEC',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  orderTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F5F7',
  },
  restaurantSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  restaurantIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF4EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E232C',
    letterSpacing: -0.2,
  },
  orderMetaText: {
    fontSize: 12,
    color: '#8A92A0',
    marginTop: 2,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ITEMS LIST
  itemsSection: {
    paddingVertical: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  itemRowLast: {
    paddingBottom: 2,
  },
  itemQuantityBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 10,
  },
  itemQuantityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '600',
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E232C',
  },

  // DELIVERY SLOT
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF8F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 10,
  },
  slotText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  slotValue: {
    color: '#1E232C',
    fontWeight: '700',
  },

  // BILL SUMMARY
  billCard: {
    backgroundColor: '#FAFAFB',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  billLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  billValue: {
    fontSize: 12,
    color: '#1E232C',
    fontWeight: '600',
  },
  discountLabel: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '600',
  },
  discountValue: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '700',
  },
  billDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E232C',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E232C',
  },

  // REQUIREMENT 3: USER REVIEW DISPLAY
  userReviewCard: {
    backgroundColor: '#FFFBF5',
    borderWidth: 1,
    borderColor: '#FFE8D6',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewScoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
    marginLeft: 2,
  },
  editReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFE0C2',
  },
  editReviewText: {
    fontSize: 11,
    fontWeight: '700',
    color: ORANGE,
  },
  reviewComment: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: 2,
  },
  restaurantReplyBox: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 3,
    borderLeftColor: ORANGE,
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  replyHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  replyCommentText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
  },

  // BUTTONS
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORANGE,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10,
    gap: 6,
    shadowColor: ORANGE,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  rateButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingVertical: 9,
    marginTop: 10,
    gap: 6,
  },
  cancelButtonText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
});
