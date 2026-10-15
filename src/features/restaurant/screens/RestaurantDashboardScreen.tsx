import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

// =====================================================
// COMPONENTS
// =====================================================

import OwnerHeader from '../components/OwnerHeader';
import RestaurantStatusCard from '../components/RestaurantStatusCard';
import DashboardStats from '../components/DashboardStats';
import QuickActions from '../components/QuickActions';
import RecentOrders, {
  RecentOrder,
} from '../components/RecentOrders';

// =====================================================
// SERVICES
// =====================================================

import {
  getMyRestaurant,
  updateRestaurantStatus,
} from '../services/restaurantService';

import {
  getRestaurantOrders,
  RestaurantOrder,
} from '../services/orderService';

// =====================================================
// AUTH
// =====================================================

import {useAuth} from '../../../context/AuthContext';
import {
  Plus,
  Storefront,
  SignOut,
} from 'phosphor-react-native';

// =====================================================
// TYPES
// =====================================================

interface Restaurant {
  _id: string;

  name: string;

  description?: string;

  logo?: string;

  coverImage?: string;

  phone?: string;

  email?: string;

  address?: string;

  city?: string;

  deliveryTime?: number;

  deliveryFee?: number;

  minimumOrder?: number;

  cuisines?: string[];

  openingTime?: string;

  closingTime?: string;

  isOpen?: boolean;

  isActive?: boolean;

  rating?: number;

  totalReviews?: number;
}

// =====================================================
// MAIN SCREEN
// =====================================================

const RestaurantDashboardScreen = ({
  navigation,
}: any) => {
  const {
    token,
    logout,
  } = useAuth();

  // ===================================================
  // STATE
  // ===================================================

  const [restaurant, setRestaurant] =
    useState<Restaurant | null>(null);

  const [orders, setOrders] =
    useState<RestaurantOrder[]>([]);

  const [isOpen, setIsOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const knownOrderIds = useRef<Set<string>>(new Set());
  const hasLoadedOrders = useRef(false);

  // ===================================================
  // LOAD DASHBOARD DATA
  // ===================================================

  const loadDashboard = useCallback(
    async (showLoader = false) => {
      if (!token) {
        setLoading(false);
        return;
      }

      if (showLoader) {
        setLoading(true);
      }

      try {
        // ==============================================
        // LOAD RESTAURANT + ORDERS AT THE SAME TIME
        // ==============================================

        const [
          restaurantResult,
          ordersResult,
        ] = await Promise.allSettled([
          getMyRestaurant(token),
          getRestaurantOrders(token),
        ]);

        // ==============================================
        // RESTAURANT
        // ==============================================

        if (
          restaurantResult.status ===
          'fulfilled'
        ) {
          const restaurantData =
            restaurantResult.value;

          setRestaurant(
            restaurantData
          );

          setIsOpen(
            restaurantData?.isOpen === true
          );
        } else {
          console.log(
            'Dashboard Restaurant Error:',
            restaurantResult.reason
          );

          Alert.alert(
            'Restaurant Error',
            restaurantResult.reason?.message ||
              'Failed to load restaurant.'
          );
        }

        // ==============================================
        // ORDERS
        // ==============================================

        if (
          ordersResult.status ===
          'fulfilled'
        ) {
          const orderData =
            ordersResult.value.orders;

          console.log(
            'FoodE Dashboard Orders:',
            orderData.length
          );

          setOrders(orderData);

          const latestOrders = orderData;
          const placedOrders = latestOrders.filter(order => order.status === 'PLACED');

          if (hasLoadedOrders.current) {
            const freshOrder = placedOrders.find(order => !knownOrderIds.current.has(order._id));
            if (freshOrder) {
              const customer = typeof freshOrder.user === 'object' && freshOrder.user ? freshOrder.user.name : 'A customer';
              Alert.alert(
                'New FoodE Order 🎉',
                `${customer} placed a new order${freshOrder.orderNumber ? ` #${freshOrder.orderNumber}` : ''}.`,
                [
                  {text: 'Later', style: 'cancel'},
                  {text: 'View Details', onPress: () => navigation.navigate('RestaurantOrders', {orderId: freshOrder._id})},
                ],
              );
            }
          }

          latestOrders.forEach(order => knownOrderIds.current.add(order._id));
          hasLoadedOrders.current = true;
        } else {
          console.log(
            'Dashboard Orders Error:',
            ordersResult.reason
          );

          setOrders([]);

          Alert.alert(
            'Orders Error',
            ordersResult.reason?.message ||
              'Failed to load restaurant orders.'
          );
        }
      } catch (error: any) {
        console.log(
          'Dashboard Load Error:',
          error
        );

        Alert.alert(
          'Dashboard Error',
          error?.message ||
            'Failed to load dashboard.'
        );
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [token, navigation],
  );

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    loadDashboard(true);
  }, [loadDashboard]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboard(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  // ===================================================
  // REFRESH
  // ===================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await loadDashboard(false);
    } finally {
      setRefreshing(false);
    }
  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = () => {
    if (loggingOut) {
      return;
    }

    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',

          onPress: async () => {
            try {
              setLoggingOut(true);

              await logout();

              // ========================================
              // CLEAR NAVIGATION HISTORY
              // ========================================

              navigation.reset({
                index: 0,

                routes: [
                  {
                    name: 'Login',
                  },
                ],
              });
            } catch (error) {
              console.log(
                'Logout Error:',
                error
              );

              setLoggingOut(false);

              Alert.alert(
                'Logout Failed',
                'Something went wrong while logging out.'
              );
            }
          },
        },
      ],
    );
  };

  // ===================================================
  // RESTAURANT DETAILS
  // ===================================================

  const handleRestaurantPress = () => {
    navigation.navigate(
      'RestaurantDetails',
    );
  };

  // ===================================================
  // DELIVERY SLOTS
  // ===================================================

  const handleDeliverySlotsPress = () => {
    navigation.navigate(
      'DeliverySlots',
    );
  };

  // ===================================================
  // TOGGLE RESTAURANT
  // ===================================================

  const handleToggleRestaurant = async () => {
    if (!token || !restaurant) {
      return;
    }

    const previousStatus =
      isOpen;

    const newStatus =
      !previousStatus;

    try {
      setUpdatingStatus(true);

      // Optimistic UI
      setIsOpen(newStatus);

      await updateRestaurantStatus(
        token,
        newStatus,
      );

      // Refresh restaurant data
      await loadDashboard(false);
    } catch (error: any) {
      // Rollback
      setIsOpen(previousStatus);

      Alert.alert(
        'Unable to Update',
        error?.message ||
          'Failed to update restaurant status.'
      );
    } finally {
      setUpdatingStatus(false);
    }
  };


  const handleOrdersPress = () => {
    navigation.navigate(
      'RestaurantOrders',
    );
  };

  const handleMenuPress = () => {
    navigation.navigate(
      'RestaurantMenu',
    );
  };

  const handleReviewsPress = () => {
    navigation.navigate(
      'RestaurantReviews',
    );
  };

  const handleOrderPress = (
    order: RecentOrder,
  ) => {
    navigation.navigate(
      'RestaurantOrders',
      {
        orderId: order.id,
      },
    );
  };

  const handleViewAllOrders = () => {
    navigation.navigate(
      'RestaurantOrders',
    );
  };

  // ===================================================
  // REAL DASHBOARD DATA
  // ===================================================

  const sortedOrders = [
    ...orders,
  ].sort(
    (a, b) =>
      new Date(
        b.createdAt,
      ).getTime() -
      new Date(
        a.createdAt,
      ).getTime(),
  );

  // ===================================================
  // TODAY'S ORDERS
  // ===================================================

  const now = new Date();

  const todayOrders =
    orders.filter(order => {
      const orderDate =
        new Date(order.createdAt);

      return (
        orderDate.getDate() ===
          now.getDate() &&
        orderDate.getMonth() ===
          now.getMonth() &&
        orderDate.getFullYear() ===
          now.getFullYear()
      );
    });

  // ===================================================
  // TODAY'S REVENUE
  // ===================================================

  const todayRevenue =
    todayOrders.reduce(
      (
        total: number,
        order: RestaurantOrder,
      ): number => {
        return (
          total +
          Number(order.total || 0)
        );
      },
      0,
    );

  // ===================================================
  // REAL RECENT ORDERS
  // ===================================================

  const recentOrders: RecentOrder[] =
    sortedOrders
      .slice(0, 5)
      .map((order: RestaurantOrder) => {
        // ----------------------------------------------
        // CUSTOMER NAME
        // ----------------------------------------------

        let customer =
          'Customer';

        if (
          typeof order.user ===
          'object' &&
          order.user
        ) {
          customer =
            order.user.name ||
            order.deliveryAddress?.name ||
            'Customer';
        } else {
          customer =
            order.deliveryAddress?.name ||
            'Customer';
        }

        // ----------------------------------------------
        // ITEMS
        // ----------------------------------------------

        const items =
          order.items
            ?.map(
              item =>
                `${item.name} × ${item.quantity}`,
            )
            .join(', ') ||
          'Order items';

        // ----------------------------------------------
        // RECENT ORDER OBJECT
        // ----------------------------------------------

        return {
          id: order._id,
          customer,
          items,
          amount: Number(
            order.total || 0,
          ),
          status:
            order.status,
        } as RecentOrder;
      });

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <SafeAreaView
        style={styles.loadingContainer}
        edges={['top', 'left', 'right']}>
        <StatusBar hidden={true} />

        <ActivityIndicator
          size="large"
          color="#FF7A00"
        />

        <Text
          style={
            styles.loadingText
          }>
          Loading your restaurant...
        </Text>
      </SafeAreaView>
    );
  }

  // ===================================================
  // NO RESTAURANT
  // ===================================================

  if (!restaurant) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={['top', 'left', 'right']}>
        <StatusBar hidden={true} />

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                handleRefresh
              }
              tintColor="#FF7A00"
            />
          }
          contentContainerStyle={
            styles.emptyContainer
          }>
          <OwnerHeader restaurantName="Restaurant" isOpen={false} />

          <RestaurantStatusCard
            restaurantName="No Restaurant"
            location="Create your restaurant to get started"
            isOpen={false}
            onToggle={() => {}}
            onEdit={handleRestaurantPress}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={
              handleRestaurantPress
            }
            style={
              styles.createButton
            }>
            <View style={styles.createButtonContent}>
              <Plus size={22} color="#FFFFFF" weight="bold" />
              <Text style={styles.createButtonText}>
                Create Restaurant
              </Text>
            </View>
          </TouchableOpacity>

          <View
            style={
              styles.infoCard
            }>
            <View style={styles.infoTitleRow}>
              <Storefront size={21} color="#FF7A00" weight="regular" />
              <Text style={styles.infoTitle}>
                Start your FoodE journey
              </Text>
            </View>

            <Text
              style={
                styles.infoText
              }>
              Create your restaurant first.
              Once created, your restaurant
              will immediately appear here.
            </Text>
          </View>

          {/* LOGOUT */}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={
              handleLogout
            }
            disabled={loggingOut}
            style={
              styles.logoutButton
            }>
            {loggingOut ? (
              <ActivityIndicator
                size="small"
                color="#DC2626"
              />
            ) : (
              <>
                <SignOut size={20} color="#DC2626" weight="regular" />

                <Text
                  style={
                    styles.logoutText
                  }>
                  Logout
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ===================================================
  // RESTAURANT EXISTS
  // ===================================================

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}>
      <StatusBar hidden={true} />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
            tintColor="#FF7A00"
          />
        }
        contentContainerStyle={
          styles.scrollContent
        }>
        {/* =========================================
            HEADER
        ========================================= */}

        <OwnerHeader
          restaurantName={restaurant.name}
          isOpen={isOpen}
        />

        {/* =========================================
            RESTAURANT STATUS
        ========================================= */}

        <RestaurantStatusCard
          restaurantName={
            restaurant.name
          }
          location={
            restaurant.address ||
            restaurant.city ||
            'Location not added'
          }
          isOpen={isOpen}
          onToggle={
            handleToggleRestaurant
          }
          onEdit={handleRestaurantPress}
        />

        {/* =========================================
            TODAY'S STATS
        ========================================= */}

        <DashboardStats
          orders={
            todayOrders.length
          }
          revenue={
            todayRevenue
          }
          rating={
            restaurant.rating || 0
          }
          reviewCount={
            restaurant.totalReviews || 0
          }
        />

        {/* =========================================
            QUICK ACTIONS
        ========================================= */}

        <QuickActions
          onOrdersPress={
            handleOrdersPress
          }
          onMenuPress={
            handleMenuPress
          }
          onRestaurantPress={
            handleRestaurantPress
          }
          onReviewsPress={
            handleReviewsPress
          }
          onDeliverySlotsPress={
            handleDeliverySlotsPress
          }
        />

        {/* =========================================
            RECENT ORDERS
        ========================================= */}

        <RecentOrders
          orders={
            recentOrders
          }
          onOrderPress={
            handleOrderPress
          }
          onViewAllPress={
            handleViewAllOrders
          }
        />

        {/* =========================================
            LOGOUT
        ========================================= */}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={
            handleLogout
          }
          disabled={loggingOut}
          style={
            styles.logoutButton
          }>
          {loggingOut ? (
            <ActivityIndicator
              size="small"
              color="#DC2626"
            />
          ) : (
            <>
              <SignOut size={20} color="#DC2626" weight="regular" />

              <Text
                style={
                  styles.logoutText
                }>
                Logout
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View
          style={
            styles.bottomSpace
          }
        />
      </ScrollView>

      {/* =========================================
          STATUS LOADER
      ========================================= */}

      {updatingStatus && (
        <View
          style={
            styles.statusUpdating
          }>
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
          />
        </View>
      )}
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
      backgroundColor:
        '#F8F8FA',
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },

    emptyContainer: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 40,
    },

    bottomSpace: {
      height: 40,
    },

    // ================================================
    // LOADING
    // ================================================

    loadingContainer: {
      flex: 1,
      backgroundColor:
        '#F8F8FA',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: '#777777',
    },

    // ================================================
    // CREATE
    // ================================================

    createButton: {
      height: 56,
      borderRadius: 18,
      backgroundColor:
        '#FF7A00',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 18,
      elevation: 3,
    },

    createButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    createButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
      marginLeft: 6,
    },

    // ================================================
    // RESTAURANT DETAILS
    // ================================================

    detailsCard: {
      backgroundColor:
        '#FFFFFF',
      borderRadius: 20,
      padding: 18,
      marginTop: 16,
      marginBottom: 16,
    },

    detailsTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#17171B',
      marginBottom: 12,
    },

    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },

    detailsText: {
      flex: 1,
      fontSize: 14,
      color: '#666666',
      marginLeft: 8,
    },

    // ================================================
    // EDIT
    // ================================================

    editButton: {
      height: 48,
      borderRadius: 15,
      backgroundColor:
        '#FFFFFF',
      borderWidth: 1,
      borderColor:
        '#FF7A00',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },

    editButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    editButtonText: {
      color: '#FF7A00',
      fontSize: 15,
      fontWeight: '800',
      marginLeft: 6,
    },

    // ================================================
    // INFO
    // ================================================

    infoCard: {
      backgroundColor:
        '#FFFFFF',
      borderRadius: 20,
      padding: 20,
      marginTop: 18,
    },

    infoTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },

    infoTitle: {
      flex: 1,
      fontSize: 17,
      fontWeight: '800',
      color: '#17171B',
      marginLeft: 8,
    },

    infoText: {
      fontSize: 14,
      lineHeight: 21,
      color: '#777777',
    },

    // ================================================
    // LOGOUT
    // ================================================

    logoutButton: {
      height: 54,
      borderRadius: 17,
      backgroundColor:
        '#FFF1F2',
      borderWidth: 1,
      borderColor:
        '#FECACA',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 22,
      marginBottom: 10,
    },

    logoutText: {
      fontSize: 16,
      fontWeight: '800',
      color: '#DC2626',
    },

    // ================================================
    // STATUS LOADER
    // ================================================

    statusUpdating: {
      position: 'absolute',
      bottom: 25,
      alignSelf: 'center',
      width: 45,
      height: 45,
      borderRadius: 15,
      backgroundColor:
        '#17171B',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default RestaurantDashboardScreen;
