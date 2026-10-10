import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useAuth} from '../../../context/AuthContext';

import {
  ArrowClockwise,
  Receipt,
  Storefront,
  CheckCircle,
  Check,
  MapPin,
  Phone,
  CreditCard,
  Note,
  Package,
} from 'phosphor-react-native';

import {
  getRestaurantOrders,
  updateOrderStatus,
  RestaurantOrder,
  OrderStatus,
} from '../services/orderService';

// =====================================================
// CONSTANTS
// =====================================================

const ORANGE = '#FF7A00';

// =====================================================
// FILTER TYPES
// =====================================================

type FilterType =
  | 'ALL'
  | 'NEW'
  | 'ACTIVE'
  | 'COMPLETED';

// =====================================================
// SCREEN
// =====================================================

const RestaurantOrdersScreen: React.FC = () => {
  const {token} = useAuth();

  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [activeFilter, setActiveFilter] =
    useState<FilterType>('ALL');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] =
    useState<string | null>(null);

  const knownOrderIds = useRef<Set<string>>(new Set());
  const hasLoadedOrders = useRef(false);

  // =====================================================
  // LOAD ORDERS
  // =====================================================

  const loadOrders = useCallback(
    async (showLoader = true) => {
      if (!token) {
        setOrders([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        if (showLoader) {
          setLoading(true);
        }

        const data = await getRestaurantOrders(token);
        const nextOrders = Array.isArray(data) ? data : [];

        if (hasLoadedOrders.current) {
          const freshOrder = nextOrders.find(order => order.status === 'PLACED' && !knownOrderIds.current.has(order._id));
          if (freshOrder) {
            Alert.alert(
              'New FoodE Order 🎉',
              `A new order${freshOrder.orderNumber ? ` #${freshOrder.orderNumber}` : ''} is waiting for confirmation.`,
              [
                {text: 'Later', style: 'cancel'},
                {text: 'View Details', onPress: () => loadOrders(false)},
              ],
            );
          }
        }

        nextOrders.forEach(order => knownOrderIds.current.add(order._id));
        hasLoadedOrders.current = true;
        setOrders(nextOrders);
      } catch (error: any) {
        console.log(
          'Restaurant orders error:',
          error,
        );

        Alert.alert(
          'Unable to Load Orders',
          error?.message ||
            'Something went wrong while loading orders.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const interval = setInterval(() => loadOrders(false), 15000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders(false);
  };

  // =====================================================
  // FILTER ORDERS
  // =====================================================

  const filteredOrders = useMemo(() => {
    switch (activeFilter) {
      case 'NEW':
        return orders.filter(
          order => order.status === 'PLACED',
        );

      case 'ACTIVE':
        return orders.filter(
          order => order.status === 'CONFIRMED',
        );

      case 'COMPLETED':
        return orders.filter(
          order => order.status === 'DELIVERED',
        );

      default:
        return orders;
    }
  }, [orders, activeFilter]);

  // =====================================================
  // COUNTS
  // =====================================================

  const newOrders = orders.filter(
    order => order.status === 'PLACED',
  ).length;

  const activeOrders = orders.filter(
    order => order.status === 'CONFIRMED',
  ).length;

  const completedOrders = orders.filter(
    order => order.status === 'DELIVERED',
  ).length;

  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

  const handleUpdateStatus = async (
    order: RestaurantOrder,
    status: OrderStatus,
  ) => {
    if (!token) {
      Alert.alert(
        'Login Required',
        'Please login again.',
      );
      return;
    }

    const actionText =
      status === 'CONFIRMED'
        ? 'confirm this order'
        : 'mark this order as delivered';

    Alert.alert(
      'Update Order',
      `Are you sure you want to ${actionText}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              setUpdatingOrderId(order._id);

              const updatedOrder =
                await updateOrderStatus(
                  token,
                  order._id,
                  status,
                );

              setOrders(previousOrders =>
                previousOrders.map(currentOrder =>
                  currentOrder._id === order._id
                    ? updatedOrder
                    : currentOrder,
                ),
              );
            } catch (error: any) {
              console.log(
                'Update order status error:',
                error,
              );

              Alert.alert(
                'Unable to Update Order',
                error?.message ||
                  'Something went wrong.',
              );
            } finally {
              setUpdatingOrderId(null);
            }
          },
        },
      ],
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#F8F8FA"
        />

        <ActivityIndicator
          size="large"
          color={ORANGE}
        />

        <Text style={styles.loadingText}>
          Loading orders...
        </Text>
      </SafeAreaView>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <SafeAreaView
      style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F8FA"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={ORANGE}
            colors={[ORANGE]}
          />
        }
        contentContainerStyle={styles.scrollContent}>

        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>
          <View>
            <Text style={styles.smallText}>
              Restaurant
            </Text>

            <Text style={styles.title}>
              Orders
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.refreshButton}
            onPress={() => loadOrders(false)}>

            <ArrowClockwise
              size={23}
              color={ORANGE}
              weight="bold"
            />
          </TouchableOpacity>
        </View>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {newOrders}
            </Text>

            <Text style={styles.summaryLabel}>
              New
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {activeOrders}
            </Text>

            <Text style={styles.summaryLabel}>
              Active
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {completedOrders}
            </Text>

            <Text style={styles.summaryLabel}>
              Delivered
            </Text>
          </View>
        </View>

        {/* =================================================
            FILTERS
        ================================================= */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.filterContainer
          }>

          <FilterButton
            title="All"
            active={activeFilter === 'ALL'}
            onPress={() => setActiveFilter('ALL')}
          />

          <FilterButton
            title="New"
            active={activeFilter === 'NEW'}
            onPress={() => setActiveFilter('NEW')}
          />

          <FilterButton
            title="Active"
            active={activeFilter === 'ACTIVE'}
            onPress={() => setActiveFilter('ACTIVE')}
          />

          <FilterButton
            title="Delivered"
            active={activeFilter === 'COMPLETED'}
            onPress={() =>
              setActiveFilter('COMPLETED')
            }
          />
        </ScrollView>

        {/* =================================================
            SECTION HEADER
        ================================================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeFilter === 'ALL'
              ? 'All Orders'
              : activeFilter === 'NEW'
              ? 'New Orders'
              : activeFilter === 'ACTIVE'
              ? 'Active Orders'
              : 'Delivered Orders'}
          </Text>

          <Text style={styles.orderCount}>
            {filteredOrders.length} orders
          </Text>
        </View>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {filteredOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Receipt
                size={36}
                color={ORANGE}
                weight="duotone"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No orders here
            </Text>

            <Text style={styles.emptyText}>
              {orders.length === 0
                ? 'When customers order from your restaurant, they will appear here.'
                : 'Orders matching this filter will appear here.'}
            </Text>
          </View>
        ) : (
          <View style={styles.ordersContainer}>
            {filteredOrders.map(order => (
              <OrderCard
                key={order._id}
                order={order}
                updating={
                  updatingOrderId === order._id
                }
                onUpdateStatus={
                  handleUpdateStatus
                }
              />
            ))}
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

// =====================================================
// FILTER BUTTON
// =====================================================

interface FilterButtonProps {
  title: string;
  active: boolean;
  onPress: () => void;
}

const FilterButton: React.FC<
  FilterButtonProps
> = ({
  title,
  active,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.filterButton,
        active && styles.activeFilterButton,
      ]}>

      <Text
        style={[
          styles.filterText,
          active && styles.activeFilterText,
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// =====================================================
// ORDER CARD
// =====================================================

interface OrderCardProps {
  order: RestaurantOrder;
  updating: boolean;
  onUpdateStatus: (
    order: RestaurantOrder,
    status: OrderStatus,
  ) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  updating,
  onUpdateStatus,
}) => {
  console.log(
    'RESTAURANT ORDER PRICE:',
    JSON.stringify({
      orderId: order._id,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      discount: order.discount,
      total: order.total,
      items: order.items?.map(
        item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          discountedPrice:
            item.discountedPrice,
          itemTotal: item.total,
        }),
      ),
    }),
  );
  // =====================================================
  // CUSTOMER
  // =====================================================

  const customerName =
    typeof order.user === 'object'
      ? order.user?.name || 'Customer'
      : 'Customer';

  const customerPhone =
    typeof order.user === 'object'
      ? order.user?.phone
      : undefined;

  // =====================================================
  // PRICE HELPERS
  // =====================================================

  const getItemUnitPrice = (
    item: RestaurantOrder['items'][number],
  ): number => {
    const discountedPrice = Number(
      item.discountedPrice,
    );

    const originalPrice = Number(item.price);

    if (
      item.discountedPrice !== null &&
      item.discountedPrice !== undefined &&
      Number.isFinite(discountedPrice)
    ) {
      return Math.max(0, discountedPrice);
    }

    if (Number.isFinite(originalPrice)) {
      return Math.max(0, originalPrice);
    }

    return 0;
  };

  const getItemQuantity = (
    item: RestaurantOrder['items'][number],
  ): number => {
    const quantity = Number(item.quantity);

    if (Number.isFinite(quantity) && quantity > 0) {
      return quantity;
    }

    return 1;
  };

  const getItemTotal = (
    item: RestaurantOrder['items'][number],
  ): number => {
    return (
      getItemUnitPrice(item) *
      getItemQuantity(item)
    );
  };

  // Always calculate subtotal from the actual order items.
  // This prevents the owner screen from showing 0 when
  // subtotal/total fields are missing or stale in the response.
  const calculatedSubtotal =
    order.items.reduce(
      (
        sum: number,
        item: RestaurantOrder['items'][number],
      ): number => {
        return sum + getItemTotal(item);
      },
      0,
    );

  // Prefer the subtotal saved by the backend.
  // Older orders may have valid subtotal but missing
  // item price fields, so using only item prices can
  // incorrectly produce ₹0.
  const backendSubtotal = Number(
    order.subtotal,
  );

  const subtotal =
    Number.isFinite(backendSubtotal) &&
    backendSubtotal > 0
      ? backendSubtotal
      : calculatedSubtotal;

  const deliveryFeeValue = Number(
    order.deliveryFee,
  );

  const safeDeliveryFee =
    Number.isFinite(deliveryFeeValue)
      ? Math.max(0, deliveryFeeValue)
      : 0;

  const discountValue = Number(
    order.discount,
  );

  const safeDiscount =
    Number.isFinite(discountValue)
      ? Math.max(0, discountValue)
      : 0;

  // FoodE total:
  // subtotal + delivery fee - discount.
  const calculatedOrderTotal =
    Math.max(
      0,
      subtotal +
        safeDeliveryFee -
        safeDiscount,
    );

  // Prefer the backend total when it exists.
  // Otherwise calculate it safely on the screen.
  const backendTotal = Number(
    order.total,
  );

  const total =
    Number.isFinite(backendTotal) &&
    backendTotal > 0
      ? backendTotal
      : calculatedOrderTotal;

  const deliveryFee =
    safeDeliveryFee;

  const discount =
    safeDiscount;

  // =====================================================
  // TIME
  // =====================================================

  const orderTime = formatOrderTime(
    order.createdAt,
  );

  // =====================================================
  // UI
  // =====================================================

  return (
    <View style={styles.orderCard}>

      {/* =================================================
          TOP
      ================================================= */}

      <View style={styles.orderTop}>
        <View style={styles.orderIcon}>
          <Storefront
            size={23}
            color={ORANGE}
            weight="duotone"
          />
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>
            #{order.orderNumber}
          </Text>

          <Text style={styles.customer}>
            {customerName}
          </Text>

          {customerPhone ? (
            <View style={styles.phoneRow}>
              <Phone
                size={12}
                color="#AAAAAF"
                weight="regular"
              />
              <Text style={styles.phone}>
                {customerPhone}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amount}>
            ₹{total.toFixed(2)}
          </Text>

          <Text style={styles.time}>
            {orderTime}
          </Text>
        </View>
      </View>

      {/* =================================================
          ITEMS
      ================================================= */}

      <View style={styles.itemsContainer}>
        <Text style={styles.itemsTitle}>
          Items
        </Text>

        {order.items.map((item, index) => (
          <View
            key={`${order._id}-${index}`}
            style={styles.itemRow}>

            <View style={styles.quantityPill}>
              <Text style={styles.quantityText}>
                {item.quantity}×
              </Text>
            </View>

            <Text
              style={styles.itemName}
              numberOfLines={2}>
              {item.name}
            </Text>

            <Text style={styles.itemPrice}>
              ₹{getItemTotal(item).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      {/* =================================================
          ORDER TOTAL
      ================================================= */}

      <View style={styles.orderTotalOnly}>
        <Text style={styles.ownerTotalLabel}>
          Order Total
        </Text>

        <Text style={styles.ownerTotalValue}>
          ₹{total.toFixed(2)}
        </Text>
      </View>

      {/* =================================================
          DELIVERY ADDRESS
      ================================================= */}

      <View style={styles.addressBox}>
        <View style={styles.infoTitleRow}>
          <MapPin
            size={15}
            color={ORANGE}
            weight="fill"
          />
          <Text style={styles.addressTitle}>
            Delivery Address
          </Text>
        </View>

        <Text style={styles.addressText}>
          {order.deliveryAddress.addressLine}

          {order.deliveryAddress.city
            ? `, ${order.deliveryAddress.city}`
            : ''}

          {order.deliveryAddress.pincode
            ? ` - ${order.deliveryAddress.pincode}`
            : ''}
        </Text>
      </View>

      {/* =================================================
          PAYMENT
      ================================================= */}

      <View style={styles.paymentRow}>
        <View style={styles.paymentBadge}>
          <CreditCard
            size={14}
            color={ORANGE}
            weight="regular"
          />
          <Text style={styles.paymentText}>
            {order.paymentMethod}
          </Text>
        </View>

        <Text style={styles.paymentStatus}>
          Payment: {order.paymentStatus}
        </Text>
      </View>

      {/* =================================================
          CUSTOMER NOTE
      ================================================= */}

      {order.customerNote ? (
        <View style={styles.noteBox}>
          <View style={styles.infoTitleRow}>
            <Note
              size={15}
              color="#6D5B20"
              weight="regular"
            />
            <Text style={styles.noteTitle}>
              Customer Note
            </Text>
          </View>

          <Text style={styles.noteText}>
            {order.customerNote}
          </Text>
        </View>
      ) : null}

      {/* =================================================
          BOTTOM
      ================================================= */}

      <View style={styles.orderBottom}>
        <StatusBadge
          status={order.status}
        />

        {/* ===============================================
            PLACED → CONFIRMED
        =============================================== */}

        {order.status === 'PLACED' && (
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={updating}
            style={[
              styles.confirmButton,
              updating &&
                styles.disabledButton,
            ]}
            onPress={() =>
              onUpdateStatus(
                order,
                'CONFIRMED',
              )
            }>

            {updating ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <View style={styles.buttonContent}>
                <Check
                  size={16}
                  color="#FFFFFF"
                  weight="bold"
                />
                <Text style={styles.confirmButtonText}>
                  Confirm Order
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* ===============================================
            CONFIRMED → DELIVERED
        =============================================== */}

        {order.status === 'CONFIRMED' && (
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={updating}
            style={[
              styles.deliveredButton,
              updating &&
                styles.disabledButton,
            ]}
            onPress={() =>
              onUpdateStatus(
                order,
                'DELIVERED',
              )
            }>

            {updating ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <View style={styles.buttonContent}>
                <CheckCircle
                  size={16}
                  color="#FFFFFF"
                  weight="bold"
                />
                <Text style={styles.deliveredButtonText}>
                  Mark Delivered
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// =====================================================
// STATUS BADGE
// =====================================================

interface StatusBadgeProps {
  status: OrderStatus;
}

const StatusBadge: React.FC<
  StatusBadgeProps
> = ({status}) => {
  const statusConfig: Record<
    OrderStatus,
    {
      label: string;
      background: string;
      dot: string;
    }
  > = {
    PLACED: {
      label: 'New Order',
      background: '#FFF1E6',
      dot: '#FF7A00',
    },

    CONFIRMED: {
      label: 'Confirmed',
      background: '#EAF2FF',
      dot: '#4285F4',
    },

    DELIVERED: {
      label: 'Delivered',
      background: '#EAF8EF',
      dot: '#22A55A',
    },
  };

  const config =
    statusConfig[status];

  const StatusIcon =
    status === 'PLACED'
      ? Package
      : status === 'CONFIRMED'
      ? Check
      : CheckCircle;

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor:
            config.background,
        },
      ]}>

      <StatusIcon
        size={14}
        color={config.dot}
        weight="bold"
      />

      <Text style={styles.statusText}>
        {config.label}
      </Text>
    </View>
  );
};

// =====================================================
// FORMAT TIME
// =====================================================

const formatOrderTime = (
  dateString: string,
) => {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '';
  }

  const now = new Date();

  const difference =
    now.getTime() -
    date.getTime();

  const minutes = Math.floor(
    difference / (1000 * 60),
  );

  if (minutes < 1) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours} ${
      hours === 1
        ? 'hour'
        : 'hours'
    } ago`;
  }

  const days = Math.floor(
    hours / 24,
  );

  return `${days} ${
    days === 1
      ? 'day'
      : 'days'
  } ago`;
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  // =====================================================
  // CONTAINER
  // =====================================================

  container: {
    flex: 1,
    backgroundColor: '#F8F8FA',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // =====================================================
  // LOADING
  // =====================================================

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8F8FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#777780',
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  smallText: {
    fontSize: 13,
    color: '#8A8A93',
    marginBottom: 4,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#17171B',
  },

  refreshButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },


  // =====================================================
  // SUMMARY
  // =====================================================

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#17171B',
    borderRadius: 22,
    paddingVertical: 20,
    marginBottom: 20,
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryValue: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
  },

  summaryLabel: {
    color: '#9999A2',
    fontSize: 11,
    marginTop: 4,
  },

  divider: {
    width: 1,
    height: 35,
    backgroundColor: '#333339',
  },

  // =====================================================
  // FILTERS
  // =====================================================

  filterContainer: {
    gap: 9,
    paddingBottom: 22,
  },

  filterButton: {
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },

  activeFilterButton: {
    backgroundColor: ORANGE,
  },

  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#777780',
  },

  activeFilterText: {
    color: '#FFFFFF',
  },

  // =====================================================
  // SECTION
  // =====================================================

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#17171B',
  },

  orderCount: {
    fontSize: 11,
    color: '#909099',
    fontWeight: '600',
  },

  // =====================================================
  // ORDERS
  // =====================================================

  ordersContainer: {
    gap: 12,
  },

  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EEEEF2',
    padding: 16,
  },

  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  orderIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },


  orderInfo: {
    flex: 1,
    marginLeft: 12,
  },

  orderId: {
    fontSize: 13,
    fontWeight: '800',
    color: '#17171B',
  },

  customer: {
    fontSize: 11,
    color: '#909099',
    marginTop: 3,
  },

  phone: {
    fontSize: 10,
    color: '#AAAAAF',
  },

  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },

  amountContainer: {
    alignItems: 'flex-end',
  },

  amount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#17171B',
  },

  time: {
    fontSize: 10,
    color: '#9999A2',
    marginTop: 3,
  },

  // =====================================================
  // ITEMS
  // =====================================================

  itemsContainer: {
    marginTop: 14,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F2',
  },

  itemsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#55555D',
    marginBottom: 9,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  quantityPill: {
    minWidth: 35,
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: '#FFF3E9',
    alignItems: 'center',
    marginRight: 9,
  },

  quantityText: {
    fontSize: 10,
    fontWeight: '800',
    color: ORANGE,
  },

  itemName: {
    flex: 1,
    fontSize: 12,
    color: '#45454D',
    lineHeight: 17,
  },

  itemPrice: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#29292F',
  },

  // =====================================================
  // ORDER TOTAL
  // =====================================================

  orderTotalOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F2',
  },

  ownerTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#55555D',
  },

  ownerTotalValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#17171B',
  },

  // =====================================================
  // ADDRESS
  // =====================================================

  addressBox: {
    backgroundColor: '#F8F8FA',
    borderRadius: 12,
    padding: 11,
    marginTop: 13,
  },

  addressTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#55555D',
  },

  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },

  addressText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#777780',
  },

  // =====================================================
  // PAYMENT
  // =====================================================

  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFF4EA',
  },

  paymentText: {
    fontSize: 9,
    fontWeight: '800',
    color: ORANGE,
  },

  paymentStatus: {
    fontSize: 9,
    color: '#88888F',
    fontWeight: '600',
  },

  // =====================================================
  // NOTE
  // =====================================================

  noteBox: {
    marginTop: 12,
    padding: 11,
    borderRadius: 12,
    backgroundColor: '#FFF9E8',
  },

  noteTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6D5B20',
    marginBottom: 3,
  },

  noteText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#766B48',
  },

  // =====================================================
  // ORDER BOTTOM
  // =====================================================

  orderBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
  },

  // =====================================================
  // STATUS
  // =====================================================

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#55555D',
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  // =====================================================
  // BUTTONS
  // =====================================================

  confirmButton: {
    minWidth: 110,
    minHeight: 38,
    backgroundColor: ORANGE,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  deliveredButton: {
    minWidth: 110,
    minHeight: 38,
    backgroundColor: '#17171B',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deliveredButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  disabledButton: {
    opacity: 0.6,
  },

  // =====================================================
  // EMPTY
  // =====================================================

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EEEEF2',
    paddingVertical: 45,
    paddingHorizontal: 25,
    alignItems: 'center',
  },

  emptyIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#17171B',
  },

  emptyText: {
    fontSize: 12,
    color: '#909099',
    marginTop: 5,
    textAlign: 'center',
    lineHeight: 18,
  },

  bottomSpace: {
    height: 70,
  },
});

export default RestaurantOrdersScreen;
