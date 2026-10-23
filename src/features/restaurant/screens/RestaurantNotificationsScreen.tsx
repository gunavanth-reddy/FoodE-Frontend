import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  BackendNotification,
  deleteAllNotifications,
  deleteNotification,
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../../services/notificationService";

import {useAuth} from "../../../context/AuthContext";

import {
  Bell,
  BellSlash,
  Trash,
  Check,
  CheckCircle,
  XCircle,
  Star,
  Megaphone,
  Bag,
  ClipboardText,
  CheckSquare,
} from "phosphor-react-native";

// =====================================================
// TYPES
// =====================================================

type NotificationType =
  | "NEW_ORDER"
  | "RESTAURANT_APPROVED"
  | "RESTAURANT_REJECTED"
  | "NEW_REVIEW"
  | "PLATFORM_EVENT"
  | "ORDER_PLACED"
  | "ORDER_CONFIRMED"
  | "ORDER_DELIVERED";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
};

// =====================================================
// TIME HELPER
// =====================================================

const getRelativeTime = (
  dateString: string,
): string => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const difference = Math.max(
    0,
    Date.now() - date.getTime(),
  );

  const seconds = Math.floor(
    difference / 1000,
  );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(
    seconds / 60,
  );

  if (minutes < 60) {
    return `${minutes} ${
      minutes === 1 ? "min" : "mins"
    } ago`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours} ${
      hours === 1 ? "hour" : "hours"
    } ago`;
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
};

// =====================================================
// CONVERT BACKEND NOTIFICATION
// =====================================================

const convertNotification = (
  item: BackendNotification,
): Notification => {
  return {
    id: item._id,

    type:
      item.type as NotificationType,

    title: item.title,

    message: item.message,

    time: getRelativeTime(
      item.createdAt,
    ),

    isRead: item.isRead,
  };
};

// =====================================================
// SCREEN
// =====================================================

const RestaurantNotificationsScreen =
  () => {

    const {token} = useAuth();

    const [
      notifications,
      setNotifications,
    ] = useState<BackendNotification[]>(
      [],
    );

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

    // =================================================
    // LOAD NOTIFICATIONS
    // =================================================

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
              "FoodE: Restaurant notifications error:",
              error,
            );

          } finally {

            setLoading(false);
            setRefreshing(false);
          }
        },
        [token],
      );

    // =================================================
    // LOAD ON SCREEN OPEN
    // =================================================

    useEffect(() => {
      loadNotifications();
    }, [loadNotifications]);

    // =================================================
    // REFRESH
    // =================================================

    const handleRefresh =
      useCallback(
        async () => {

          setRefreshing(true);

          await loadNotifications(false);
        },
        [loadNotifications],
      );

    // =================================================
    // UNREAD COUNT
    // =================================================

    const unreadCount =
      useMemo(
        () =>
          notifications.filter(
            notification =>
              !notification.isRead,
          ).length,
        [notifications],
      );

    // =================================================
    // MARK ONE AS READ
    // =================================================

    const handleMarkAsRead =
      useCallback(
        async (
          notificationId: string,
        ) => {

          if (!token) {
            return;
          }

          const notification =
            notifications.find(
              item =>
                item._id ===
                notificationId,
            );

          if (
            !notification ||
            notification.isRead
          ) {
            return;
          }

          const success =
            await markNotificationAsRead(
              token,
              notificationId,
            );

          if (success) {

            setNotifications(
              current =>
                current.map(item =>
                  item._id ===
                  notificationId
                    ? {
                        ...item,
                        isRead: true,
                      }
                    : item,
                ),
            );
          }
        },
        [token, notifications],
      );

    // =================================================
    // MARK ALL AS READ
    // =================================================

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
              "FoodE: Mark all restaurant notifications error:",
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

    // =================================================
    // DELETE ONE
    // =================================================

    const handleDelete =
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
              "FoodE: Delete restaurant notification error:",
              error,
            );

          } finally {

            setActionLoading(false);
          }
        },
        [token, actionLoading],
      );

    // =================================================
    // DELETE ALL
    // =================================================

    const handleClearAll =
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
              "FoodE: Delete all restaurant notifications error:",
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

    // =================================================
    // LOADING
    // =================================================

    if (loading) {
      return (
        <SafeAreaView
          style={styles.container}
          edges={['left', 'right']}>

          <View style={styles.loadingContainer}>

            <ActivityIndicator
              size="large"
              color="#FF7A00"
            />

            <Text
              style={
                styles.loadingText
              }>
              Loading notifications...
            </Text>

          </View>

        </SafeAreaView>
      );
    }

    // =================================================
    // UI
    // =================================================

    return (
      <SafeAreaView
        style={styles.container}
        edges={['left', 'right']}>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={
                handleRefresh
              }
              tintColor="#FF7A00"
              colors={["#FF7A00"]}
            />
          }
          contentContainerStyle={
            styles.scrollContent
          }>

          {/* ========================================= */}
          {/* HEADER */}
          {/* ========================================= */}

          <View style={styles.header}>
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

          {/* ========================================= */}
          {/* ACTIONS */}
          {/* ========================================= */}

          {notifications.length > 0 && (
            <View
              style={
                styles.actionsRow
              }>

              {unreadCount > 0 && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={
                    handleMarkAllAsRead
                  }
                  disabled={
                    actionLoading
                  }
                  style={
                    styles.actionButton
                  }>

                  <View style={styles.actionContent}>
                    <Check
                      size={16}
                      color="#FF7A00"
                      weight="bold"
                    />
                    <Text style={styles.actionText}>
                      Mark all as read
                    </Text>
                  </View>

                </TouchableOpacity>
              )}

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={
                  handleClearAll
                }
                disabled={
                  actionLoading
                }
                style={
                  styles.clearButton
                }>

                <View style={styles.actionContent}>
                  <Trash
                    size={16}
                    color="#9999A2"
                    weight="regular"
                  />
                  <Text style={styles.clearText}>
                    Clear all
                  </Text>
                </View>

              </TouchableOpacity>

            </View>
          )}

          {/* ========================================= */}
          {/* NOTIFICATIONS */}
          {/* ========================================= */}

          {notifications.length === 0 ? (

            <View
              style={
                styles.emptyCard
              }>

              <View
                style={
                  styles.emptyIconContainer
                }>

                <Bell
                  size={32}
                  color="#FF7A00"
                  weight="duotone"
                />

              </View>

              <Text
                style={
                  styles.emptyTitle
                }>
                No notifications
              </Text>

              <Text
                style={
                  styles.emptyText
                }>
                You're all caught up.
                New updates will appear
                here.
              </Text>

            </View>

          ) : (

            <View
              style={
                styles.notificationsContainer
              }>

              {notifications.map(
                notification => {

                  const formatted =
                    convertNotification(
                      notification,
                    );

                  return (
                    <NotificationCard
                      key={
                        notification._id
                      }
                      notification={
                        formatted
                      }
                      onPress={() =>
                        handleMarkAsRead(
                          notification._id,
                        )
                      }
                      onDelete={() =>
                        handleDelete(
                          notification._id,
                        )
                      }
                    />
                  );
                },
              )}

            </View>
          )}

          <View
            style={styles.bottomSpace}
          />

        </ScrollView>

      </SafeAreaView>
    );
  };

// =====================================================
// NOTIFICATION CARD
// =====================================================

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
  onDelete: () => void;
}

const NotificationCard: React.FC<
  NotificationCardProps
> = ({
  notification,
  onPress,
  onDelete,
}) => {

  const config =
    getNotificationConfig(
      notification.type,
    );

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.notificationCard,
        !notification.isRead &&
          styles.unreadCard,
      ]}>

      {/* =========================================== */}
      {/* ICON */}
      {/* =========================================== */}

      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor:
              config.background,
          },
        ]}>

        <NotificationTypeIcon
          type={notification.type}
          size={23}
          color={config.color}
        />

      </View>

      {/* =========================================== */}
      {/* CONTENT */}
      {/* =========================================== */}

      <View style={styles.content}>

        <View style={styles.titleRow}>

          <Text
            style={[
              styles.notificationTitle,
              !notification.isRead &&
                styles.unreadTitle,
            ]}
            numberOfLines={2}>
            {notification.title}
          </Text>

          {!notification.isRead && (
            <View
              style={
                styles.unreadDot
              }
            />
          )}

        </View>

        <Text
          style={
            styles.notificationMessage
          }>
          {notification.message}
        </Text>

        <Text style={styles.time}>
          {notification.time}
        </Text>

        {/* ========================================= */}
        {/* DELETE */}
        {/* ========================================= */}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onDelete}
          style={
            styles.deleteButton
          }>

          <Trash
            size={19}
            color="#A0A0A8"
            weight="regular"
          />

        </TouchableOpacity>

      </View>

    </TouchableOpacity>
  );
};

// =====================================================
// NOTIFICATION ICON
// =====================================================

const NotificationTypeIcon = ({
  type,
  size,
  color,
}: {
  type: NotificationType;
  size: number;
  color: string;
}) => {
  switch (type) {
    case "NEW_ORDER":
      return <Bag size={size} color={color} weight="duotone" />;
    case "NEW_REVIEW":
      return <Star size={size} color={color} weight="fill" />;
    case "RESTAURANT_APPROVED":
      return <CheckCircle size={size} color={color} weight="fill" />;
    case "RESTAURANT_REJECTED":
      return <XCircle size={size} color={color} weight="fill" />;
    case "PLATFORM_EVENT":
      return <Megaphone size={size} color={color} weight="duotone" />;
    case "ORDER_PLACED":
      return <ClipboardText size={size} color={color} weight="duotone" />;
    case "ORDER_CONFIRMED":
      return <CheckSquare size={size} color={color} weight="fill" />;
    case "ORDER_DELIVERED":
      return <CheckCircle size={size} color={color} weight="fill" />;
    default:
      return <Bell size={size} color={color} weight="regular" />;
  }
};

// =====================================================
// NOTIFICATION CONFIG
// =====================================================

const getNotificationConfig = (
  type: NotificationType,
) => {

  switch (type) {

    case "NEW_ORDER":
      return {
        icon: "bag" as const,
        background: "#FFF1E6",
        color: "#FF7A00",
      };

    case "NEW_REVIEW":
      return {
        icon: "star" as const,
        background: "#FFF7D9",
        color: "#F5B301",
      };

    case "RESTAURANT_APPROVED":
      return {
        icon: "check" as const,
        background: "#EAF8EF",
        color: "#16A34A",
      };

    case "RESTAURANT_REJECTED":
      return {
        icon: "close" as const,
        background: "#FDECEC",
        color: "#DC2626",
      };

    case "PLATFORM_EVENT":
      return {
        icon: "megaphone" as const,
        background: "#EAF2FF",
        color: "#2563EB",
      };

    case "ORDER_PLACED":
      return {
        icon: "clipboard" as const,
        background: "#FFF1E6",
        color: "#FF7A00",
      };

    case "ORDER_CONFIRMED":
      return {
        icon: "check-square" as const,
        background: "#EAF8EF",
        color: "#16A34A",
      };

    case "ORDER_DELIVERED":
      return {
        icon: "check" as const,
        background: "#EAF8EF",
        color: "#16A34A",
      };

    default:
      return {
        icon: "bell" as const,
        background: "#F3F3F4",
        color: "#FF7A00",
      };
  }
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8F8FA",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // ================================================
  // LOADING
  // ================================================

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#8A8A93",
  },

  // ================================================
  // HEADER
  // ================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  smallText: {
    fontSize: 13,
    color: "#8A8A93",
    marginBottom: 4,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#17171B",
  },

  unreadBadge: {
    backgroundColor: "#FFF1E6",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 11,
  },

  unreadBadgeText: {
    color: "#FF7A00",
    fontSize: 10,
    fontWeight: "800",
  },

  // ================================================
  // ACTIONS
  // ================================================

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    marginBottom: 15,
  },

  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },

  actionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  actionText: {
    color: "#FF7A00",
    fontSize: 10,
    fontWeight: "800",
  },

  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  clearText: {
    color: "#9999A2",
    fontSize: 10,
    fontWeight: "700",
  },

  // ================================================
  // NOTIFICATIONS
  // ================================================

  notificationsContainer: {
    gap: 11,
  },

  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 15,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#EEEEF2",
  },

  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#FF7A00",
  },

  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
    marginLeft: 12,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  notificationTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#33333A",
  },

  unreadTitle: {
    fontWeight: "800",
    color: "#17171B",
  },

  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FF7A00",
    marginLeft: 7,
  },

  notificationMessage: {
    fontSize: 11,
    lineHeight: 17,
    color: "#777780",
    marginTop: 5,
  },

  time: {
    fontSize: 9,
    color: "#A0A0A8",
    marginTop: 7,
  },

  // ================================================
  // DELETE
  // ================================================

  deleteButton: {
    alignSelf: "flex-start",
    marginTop: 8,
  },


  // ================================================
  // EMPTY
  // ================================================

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#EEEEF2",
    paddingHorizontal: 25,
    paddingVertical: 55,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 23,
    backgroundColor: "#FFF1E6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#17171B",
  },

  emptyText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#909099",
    textAlign: "center",
    marginTop: 6,
  },

  bottomSpace: {
    height: 70,
  },

});

export default RestaurantNotificationsScreen;
