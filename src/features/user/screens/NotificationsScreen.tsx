import {SafeAreaView} from 'react-native-safe-area-context';
import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {
  ArrowLeft,
  Bell,
  Trash,
} from 'phosphor-react-native';

import NotificationCard, {
  Notification,
} from '../notifications/NotificationCard';

import EmptyNotifications from '../notifications/EmptyNotifications';

import {
  BackendNotification,
  deleteAllNotifications,
  deleteNotification,
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../../services/notificationService';

import {useAuth} from '../../../context/AuthContext';

const ORANGE = '#FF6B00';

// =====================================================
// HELPERS
// =====================================================

const getNotificationType = (
  type: string,
): Notification['type'] => {
  switch (type) {
    case 'ORDER_PLACED':
    case 'ORDER_CONFIRMED':
    case 'ORDER_DELIVERED':
    case 'NEW_ORDER':
      return 'order';

    case 'RESTAURANT_APPROVED':
    case 'RESTAURANT_REJECTED':
    case 'NEW_REVIEW':
      return 'general';

    case 'PLATFORM_EVENT':
      return 'general';

    default:
      return 'general';
  }
};

const getRelativeTime = (
  dateString: string,
): string => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = Date.now();

  const difference =
    Math.max(0, now - date.getTime());

  const seconds = Math.floor(
    difference / 1000,
  );

  if (seconds < 60) {
    return 'Just now';
  }

  const minutes = Math.floor(
    seconds / 60,
  );

  if (minutes < 60) {
    return `${minutes} ${
      minutes === 1 ? 'min' : 'mins'
    } ago`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours} ${
      hours === 1 ? 'hour' : 'hours'
    } ago`;
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days === 1) {
    return 'Yesterday';
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return date.toLocaleDateString(
    'en-IN',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  );
};

const convertNotification = (
  item: BackendNotification,
): Notification => {
  return {
    id: item._id,

    title: item.title,

    message: item.message,

    time: getRelativeTime(
      item.createdAt,
    ),

    type: getNotificationType(
      item.type,
    ),

    isRead: item.isRead,
  };
};

// =====================================================
// SCREEN
// =====================================================

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {width} = useWindowDimensions();

  const {token} = useAuth();

  const horizontalPadding =
    width < 360 ? 12 : 14;

  const [
    notifications,
    setNotifications,
  ] = useState<BackendNotification[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  // ===================================================
  // LOAD NOTIFICATIONS
  // ===================================================

  const loadNotifications =
    useCallback(
      async (
        showLoader = true,
      ) => {
        if (!token) {
          setNotifications([]);
          setLoading(false);
          return;
        }

        try {
          if (showLoader) {
            setLoading(true);
          }

          const data =
            await getMyNotifications(
              token,
            );

          setNotifications(data);
        } catch (error) {
          console.error(
            'FoodE: Load notifications error:',
            error,
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [token],
    );

  // ===================================================
  // REFRESH
  // ===================================================

  const handleRefresh = useCallback(
    async () => {
      setRefreshing(true);

      await loadNotifications(false);
    },
    [loadNotifications],
  );

  // ===================================================
  // SCREEN FOCUS
  // ===================================================

  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // ===================================================
  // UNREAD COUNT
  // ===================================================

  const unreadCount =
    notifications.filter(
      notification =>
        !notification.isRead,
    ).length;

  // ===================================================
  // MARK ONE AS READ
  // ===================================================

  const handleNotificationPress =
    useCallback(
      async (
        notification: BackendNotification,
      ) => {
        if (
          notification.isRead ||
          !token
        ) {
          return;
        }

        const success =
          await markNotificationAsRead(
            token,
            notification._id,
          );

        if (success) {
          setNotifications(
            current =>
              current.map(item =>
                item._id ===
                notification._id
                  ? {
                      ...item,
                      isRead: true,
                    }
                  : item,
              ),
          );
        }
      },
      [token],
    );

  // ===================================================
  // MARK ALL AS READ
  // ===================================================

  const handleMarkAllAsRead =
    useCallback(
      async () => {
        if (
          !token ||
          unreadCount === 0 ||
          actionLoading
        ) {
          return;
        }

        try {
          setActionLoading(true);

          const success =
            await markAllNotificationsAsRead(
              token,
            );

          if (success) {
            setNotifications(
              current =>
                current.map(item => ({
                  ...item,
                  isRead: true,
                })),
            );
          }
        } catch (error) {
          console.error(
            'FoodE: Mark all notifications error:',
            error,
          );
        } finally {
          setActionLoading(false);
        }
      },
      [
        token,
        unreadCount,
        actionLoading,
      ],
    );

  // ===================================================
  // DELETE ONE
  // ===================================================

  const handleDeleteNotification =
    useCallback(
      async (
        notificationId: string,
      ) => {
        if (
          !token ||
          actionLoading
        ) {
          return;
        }

        try {
          setActionLoading(true);

          const success =
            await deleteNotification(
              token,
              notificationId,
            );

          if (success) {
            setNotifications(
              current =>
                current.filter(
                  item =>
                    item._id !==
                    notificationId,
                ),
            );
          }
        } catch (error) {
          console.error(
            'FoodE: Delete notification error:',
            error,
          );
        } finally {
          setActionLoading(false);
        }
      },
      [token, actionLoading],
    );

  // ===================================================
  // DELETE ALL
  // ===================================================

  const handleDeleteAll =
    useCallback(
      async () => {
        if (
          !token ||
          notifications.length === 0 ||
          actionLoading
        ) {
          return;
        }

        try {
          setActionLoading(true);

          const success =
            await deleteAllNotifications(
              token,
            );

          if (success) {
            setNotifications([]);
          }
        } catch (error) {
          console.error(
            'FoodE: Delete all notifications error:',
            error,
          );
        } finally {
          setActionLoading(false);
        }
      },
      [
        token,
        notifications.length,
        actionLoading,
      ],
    );

  // ===================================================
  // RENDER NOTIFICATION
  // ===================================================

  const renderNotification =
    useCallback(
      ({
        item,
      }: {
        item: BackendNotification;
      }) => {
        const notification =
          convertNotification(item);

        return (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              handleNotificationPress(
                item,
              )
            }
            onLongPress={() =>
              handleDeleteNotification(
                item._id,
              )
            }>
            <NotificationCard
              notification={
                notification
              }
            />
          </TouchableOpacity>
        );
      },
      [
        handleNotificationPress,
        handleDeleteNotification,
      ],
    );

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar backgroundColor="#FF7A00" barStyle="light-content" hidden={false} translucent={false} />

        <View style={styles.header}>
          {navigation.canGoBack() ? (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <ArrowLeft size={22} color="#1E232C" weight="bold" />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerIcon}>
              <Bell
                size={24}
                color={ORANGE}
                weight="regular"
              />
            </View>
          )}

          <View
            style={
              styles.headerTextContainer
            }>
            <Text style={styles.title}>
              Notifications
            </Text>

            <Text style={styles.subtitle}>
              Stay updated with FoodE
            </Text>
          </View>
        </View>

        <View style={styles.loadingWrapper}>
          <ActivityIndicator
            size="large"
            color={ORANGE}
          />

          <Text style={styles.loadingText}>
            Loading notifications...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <SafeAreaView
      style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#FF7A00" barStyle="light-content" hidden={false} translucent={false} />

      {/* ============================================== */}
      {/* HEADER */}
      {/* ============================================== */}

      <View style={styles.header}>
        {navigation.canGoBack() ? (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <ArrowLeft size={22} color="#1E232C" weight="bold" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerIcon}>
            <Bell
              size={24}
              color={ORANGE}
              weight="regular"
            />

            {unreadCount > 0 && (
              <View
                style={styles.headerDot}
              />
            )}
          </View>
        )}

        <View
          style={
            styles.headerTextContainer
          }>
          <Text style={styles.title}>
            Notifications
          </Text>

          <Text style={styles.subtitle}>
            Stay updated with FoodE
          </Text>
        </View>

        {unreadCount > 0 && (
          <View
            style={
              styles.unreadBadge
            }>
            <Text
              style={
                styles.unreadBadgeText
              }>
              {unreadCount} new
            </Text>
          </View>
        )}
      </View>

      {/* ============================================== */}
      {/* SECTION HEADER */}
      {/* ============================================== */}

      <View
        style={[
          styles.sectionHeader,
          {
            paddingHorizontal:
              horizontalPadding,
          },
        ]}>
        <Text style={styles.sectionTitle}>
          Recent activity
        </Text>

        <View style={styles.actions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={
                handleMarkAllAsRead
              }
              disabled={actionLoading}>
              <Text
                style={
                  styles.markAllText
                }>
                Mark all read
              </Text>
            </TouchableOpacity>
          )}

          {notifications.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={
                handleDeleteAll
              }
              disabled={actionLoading}>
              <Trash
                size={18}
                color="#9297A2"
                weight="regular"
              />
            </TouchableOpacity>
          )}

          <Text
            style={styles.sectionCount}>
            {notifications.length}{' '}
            {notifications.length === 1
              ? 'alert'
              : 'alerts'}
          </Text>
        </View>
      </View>

      {/* ============================================== */}
      {/* NOTIFICATIONS */}
      {/* ============================================== */}

      {notifications.length === 0 ? (
        <View
          style={styles.emptyWrapper}>
          <EmptyNotifications />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item =>
            item._id
          }
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={[
            styles.list,
            {
              paddingHorizontal:
                horizontalPadding,
            },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={
                handleRefresh
              }
              tintColor={ORANGE}
              colors={[ORANGE]}
            />
          }
          renderItem={
            renderNotification
          }
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationsScreen;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFCF8',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#FFF2E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  headerDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFF2E8',
  },

  headerTextContainer: {
    flex: 1,
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

  unreadBadge: {
    backgroundColor: '#FFF0E5',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    marginLeft: 8,
  },

  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: ORANGE,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#20232B',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: ORANGE,
  },

  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9297A2',
  },

  list: {
    paddingTop: 2,
    paddingBottom: 36,
  },

  emptyWrapper: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
  },

  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#7B8190',
  },
});