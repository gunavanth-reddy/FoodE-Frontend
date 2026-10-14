import React, {useCallback, useEffect, useState} from 'react';

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

import {
  CalendarBlank,
  CaretRight,
  ChartBar,
  CurrencyDollar,
  SignOut,
  TrendUp,
} from 'phosphor-react-native';

import {useAuth} from '../../../context/AuthContext';

import AdminHeader from '../components/AdminHeader';
import AdminStatCard from '../components/AdminStatCard';
import AdminQuickActions from '../components/AdminQuickActions';

import {
  getAdminDashboardStats,
  getAdminOrderStats,
  AdminDashboardStats,
  AdminOrderStats,
} from '../services/adminService';

import {
  getAdminOverview,
  getRestaurantAnalytics,
  AdminOverview,
  RestaurantAnalytics,
} from '../services/adminAnalyticsService';

const money = (value: number = 0) =>
  `₹${Number(value || 0).toLocaleString('en-IN')}`;

const AdminDashboardScreen = ({navigation}: any) => {
  const {token, logout} = useAuth();

  const [dashboard, setDashboard] =
    useState<AdminDashboardStats | null>(null);

  const [orders, setOrders] =
    useState<AdminOrderStats | null>(null);

  const [overview, setOverview] =
    useState<AdminOverview | null>(null);

  const [restaurants, setRestaurants] =
    useState<RestaurantAnalytics[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [dataWarnings, setDataWarnings] = useState<string[]>([]);

  const load = useCallback(
    async (initial = false) => {
      if (!token) {
        setLoading(false);
        return;
      }

      if (initial) {
        setLoading(true);
      }

      try {
        const results = await Promise.allSettled([
          getAdminDashboardStats(token),
          getAdminOrderStats(token),
          getAdminOverview(token),
          getRestaurantAnalytics(token),
        ]);

        const warnings = results
          .filter(
            (result): result is PromiseRejectedResult =>
              result.status === 'rejected',
          )
          .map(result =>
            String(
              result.reason?.message ||
                'A dashboard data source failed.',
            ),
          );

        setDataWarnings(warnings);

        if (results[0].status === 'fulfilled') {
          setDashboard(results[0].value);
        }

        if (results[1].status === 'fulfilled') {
          setOrders(results[1].value);
        }

        if (results[2].status === 'fulfilled') {
          setOverview(results[2].value);
        }

        if (results[3].status === 'fulfilled') {
          setRestaurants(results[3].value);
        }

        const authFailure = results.find(
          r =>
            r.status === 'rejected' &&
            /Session expired|not authorized|Access denied/i.test(
              String(
                (r as PromiseRejectedResult).reason?.message || '',
              ),
            ),
        );

        if (authFailure) {
          Alert.alert(
            'Admin access',
            String(
              (authFailure as PromiseRejectedResult).reason?.message,
            ),
          );
        }
      } catch (error: any) {
        Alert.alert(
          'Dashboard error',
          error?.message || 'Unable to load dashboard.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    load(true);
  }, [load]);

  const handleLogout = () => {
    if (loggingOut) {
      return;
    }

    Alert.alert('Logout', 'Are you sure you want to logout?', [
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

            navigation.reset({
              index: 0,
              routes: [{name: 'Login'}],
            });
          } catch (error) {
            setLoggingOut(false);

            Alert.alert(
              'Logout failed',
              'Please try again.',
            );
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={['top', 'left', 'right']}>
        <StatusBar hidden={true} />

        <ActivityIndicator
          size="large"
          color="#FF7A00"
        />

        <Text style={styles.loadingText}>
          Loading admin dashboard...
        </Text>
      </SafeAreaView>
    );
  }

  const periods = [
    {
      title: 'All time',
      icon: (
        <ChartBar
          size={20}
          color="#FF7A00"
          weight="duotone"
        />
      ),
      data: overview?.overview.allTime,
    },
    {
      title: 'This week',
      icon: (
        <CalendarBlank
          size={20}
          color="#FF7A00"
          weight="duotone"
        />
      ),
      data: overview?.overview.thisWeek,
    },
    {
      title: 'This month',
      icon: (
        <TrendUp
          size={20}
          color="#FF7A00"
          weight="duotone"
        />
      ),
      data: overview?.overview.thisMonth,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar hidden={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load(false);
            }}
            tintColor="#FF7A00"
          />
        }
        contentContainerStyle={styles.content}>
        
        <AdminHeader adminName="Admin" />

        {dataWarnings.length > 0 && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>
              Some live data is unavailable
            </Text>

            <Text style={styles.warningText}>
              {dataWarnings.join('\n')}
            </Text>
          </View>
        )}

        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <CurrencyDollar
                size={22}
                color="#FFFFFF"
                weight="bold"
              />
            </View>

            <View style={styles.heroText}>
              <Text style={styles.heroLabel}>
                FOODE OVERVIEW
              </Text>

              <Text style={styles.heroTitle}>
                Business at a glance
              </Text>
            </View>
          </View>

          <View style={styles.heroStats}>
            <View>
              <Text style={styles.heroValue}>
                {orders
                  ? money(orders.revenue.total)
                  : '—'}
              </Text>

              <Text style={styles.heroSub}>
                Total order revenue
              </Text>
            </View>

            <View style={styles.heroDivider} />

            <View>
              <Text style={styles.heroValue}>
                {orders
                  ? orders.orders.today
                  : '—'}
              </Text>

              <Text style={styles.heroSub}>
                Orders today
              </Text>
            </View>
          </View>
        </View>

        <SectionTitle title="Overview" />

        <View style={styles.grid}>
          <AdminStatCard
            icon="users"
            title="Users"
            value={dashboard?.totalUsers || 0}
            subtitle="Registered users"
          />

          <AdminStatCard
            icon="owner"
            title="Owners"
            value={dashboard?.totalRestaurantOwners || 0}
            subtitle="Restaurant owners"
          />

          <AdminStatCard
            icon="restaurant"
            title="Restaurants"
            value={dashboard?.totalRestaurants || 0}
            subtitle="Total restaurants"
          />

          <AdminStatCard
            icon="pending"
            title="Pending"
            value={dashboard?.pendingRestaurants || 0}
            subtitle="Awaiting approval"
          />

          <AdminStatCard
            icon="orders"
            title="Orders"
            value={orders ? orders.orders.total : '—'}
            subtitle="All orders"
          />

          <AdminStatCard
            icon="revenue"
            title="Revenue"
            value={
              orders
                ? money(orders.revenue.total)
                : '—'
            }
            subtitle="Total revenue"
          />
        </View>

        <SectionTitle title="Revenue analytics" />

        {periods.map(period => (
          <View
            key={period.title}
            style={styles.analyticsCard}>
            
            <View style={styles.analyticsHeader}>
              <View style={styles.analyticsIcon}>
                {period.icon}
              </View>

              <View style={styles.analyticsHeading}>
                <Text style={styles.analyticsTitle}>
                  {period.title}
                </Text>

                <Text style={styles.analyticsSubtitle}>
                  Delivered-order performance
                </Text>
              </View>
            </View>

            <View style={styles.metricsRow}>
              <Metric
                value={
                  period.data
                    ? period.data.orders
                    : '—'
                }
                label="Orders"
              />

              <Metric
                value={
                  period.data
                    ? money(period.data.sales)
                    : '—'
                }
                label="Sales"
              />

              <Metric
                value={
                  period.data
                    ? money(period.data.foodEarnings)
                    : '—'
                }
                label="FoodE earnings"
                accent
              />
            </View>
          </View>
        ))}

        <AdminQuickActions
          onUsersPress={() =>
            navigation.navigate('AdminUsers')
          }
          onRestaurantsPress={() =>
            navigation.navigate('AdminRestaurants')
          }
          onOrdersPress={() =>
            navigation.navigate('AdminOrders')
          }
          onReviewsPress={() =>
            navigation.navigate('AdminReviews')
          }
          onBroadcastPress={() =>
            navigation.navigate('AdminBroadcast')
          }
        />

        <SectionTitle title="Restaurant performance" />

        {restaurants.length > 0 ? (
          restaurants
            .slice(0, 5)
            .map(item => (
              <TouchableOpacity
                key={item.restaurant.id}
                activeOpacity={0.82}
                style={styles.restaurantCard}
                onPress={() =>
                  navigation.navigate(
                    'AdminRestaurantAnalytics',
                    {
                      restaurantId:
                        item.restaurant.id,
                    },
                  )
                }>
                
                <View style={styles.restaurantIcon}>
                  <Text
                    style={styles.restaurantLetter}>
                    {item.restaurant.name
                      ?.charAt(0)
                      ?.toUpperCase() || 'R'}
                  </Text>
                </View>

                <View style={styles.restaurantInfo}>
                  <Text
                    style={styles.restaurantName}
                    numberOfLines={1}>
                    {item.restaurant.name}
                  </Text>

                  <Text
                    style={styles.restaurantOwner}
                    numberOfLines={1}>
                    {item.owner.name ||
                      'Restaurant owner'}
                  </Text>
                </View>

                <View style={styles.restaurantRight}>
                  <Text
                    style={styles.restaurantRevenue}>
                    {money(item.thisMonth.sales)}
                  </Text>

                  {/* FIXED */}
                  <Text
                    style={styles.restaurantOrders}>
                    {item.thisMonth.orders} orders
                  </Text>
                </View>

                <CaretRight
                  size={17}
                  color="#A5A8AE"
                  weight="bold"
                />
              </TouchableOpacity>
            ))
        ) : (
          <EmptyCard
            title="No restaurant analytics"
            text="Restaurant performance will appear when the analytics API returns data."
          />
        )}

        <TouchableOpacity
          disabled={loggingOut}
          activeOpacity={0.85}
          style={styles.logoutButton}
          onPress={handleLogout}>
          
          {loggingOut ? (
            <ActivityIndicator color="#DC2626" />
          ) : (
            <>
              <SignOut
                size={19}
                color="#DC2626"
                weight="bold"
              />

              <Text style={styles.logoutText}>
                Logout
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const SectionTitle = ({
  title,
}: {
  title: string;
}) => (
  <Text style={styles.sectionTitle}>
    {title}
  </Text>
);

const Metric = ({
  value,
  label,
  accent,
}: {
  value: string | number;
  label: string;
  accent?: boolean;
}) => (
  <View style={styles.metric}>
    <Text
      style={[
        styles.metricValue,
        accent && styles.accent,
      ]}
      numberOfLines={1}
      adjustsFontSizeToFit>
      {value}
    </Text>

    <Text style={styles.metricLabel}>
      {label}
    </Text>
  </View>
);

const EmptyCard = ({
  title,
  text,
}: {
  title: string;
  text: string;
}) => (
  <View style={styles.emptyCard}>
    <Text style={styles.emptyTitle}>
      {title}
    </Text>

    <Text style={styles.emptyText}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  center: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#777C85',
    fontSize: 13,
    fontWeight: '600',
  },

  content: {
    padding: 18,
    paddingBottom: 34,
  },

  hero: {
    backgroundColor: '#17171B',
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
  },

  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroText: {
    marginLeft: 11,
  },

  heroLabel: {
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: '900',
    color: '#FFB67A',
  },

  heroTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },

  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },

  heroValue: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  heroSub: {
    fontSize: 10,
    color: '#AEB1B8',
    marginTop: 3,
  },

  heroDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#34343A',
    marginHorizontal: 22,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#17171B',
    marginBottom: 11,
    marginTop: 1,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#F0F1F3',
  },

  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  analyticsIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#FFF3E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  analyticsHeading: {
    marginLeft: 10,
  },

  analyticsTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#202329',
  },

  analyticsSubtitle: {
    fontSize: 10,
    color: '#8A8F98',
    marginTop: 2,
  },

  metricsRow: {
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
  },

  metric: {
    flex: 1,
    alignItems: 'center',
  },

  metricValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#202329',
  },

  accent: {
    color: '#FF7A00',
  },

  metricLabel: {
    fontSize: 9,
    color: '#8A8F98',
    marginTop: 4,
    textAlign: 'center',
  },

  restaurantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F1F3',
  },

  restaurantIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFF3E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  restaurantLetter: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FF7A00',
  },

  restaurantInfo: {
    flex: 1,
    marginHorizontal: 10,
  },

  restaurantName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#252831',
  },

  restaurantOwner: {
    fontSize: 10,
    color: '#8A8F98',
    marginTop: 3,
  },

  restaurantRight: {
    alignItems: 'flex-end',
    marginRight: 7,
  },

  restaurantRevenue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FF7A00',
  },

  restaurantOrders: {
    fontSize: 9,
    color: '#8A8F98',
    marginTop: 3,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F1F3',
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#252831',
  },

  emptyText: {
    fontSize: 11,
    color: '#8A8F98',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 17,
  },

  warningCard: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 16,
    padding: 14,
    marginBottom: 15,
  },

  warningTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#9A3412',
  },

  warningText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#9A3412',
    marginTop: 4,
  },

  logoutButton: {
    height: 52,
    borderRadius: 17,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },

  logoutText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#DC2626',
    marginLeft: 8,
  },
});

export default AdminDashboardScreen;