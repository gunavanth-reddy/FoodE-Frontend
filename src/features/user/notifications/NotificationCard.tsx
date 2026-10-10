import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import {
  Bag,
  Tag,
  Bell,
} from 'phosphor-react-native';

// =====================================================
// NOTIFICATION TYPE
// =====================================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type:
    | 'order'
    | 'offer'
    | 'general';
  isRead: boolean;
}

// =====================================================
// PROPS
// =====================================================

interface Props {
  notification: Notification;
}

// =====================================================
// COMPONENT
// =====================================================

const NotificationCard: React.FC<Props> = ({
  notification,
}) => {

  // ===================================================
  // GET ICON
  // ===================================================

  const getIcon = () => {
    switch (notification.type) {

      case 'order':
        return Bag;

      case 'offer':
        return Tag;

      default:
        return Bell;
    }
  };

  // ===================================================
  // GET ICON COLOR
  // ===================================================

  const getIconColor = () => {
    switch (notification.type) {

      case 'order':
        return '#FF7A00';

      case 'offer':
        return '#F59E0B';

      default:
        return '#FF7A00';
    }
  };

  const IconComponent = getIcon();

  return (
    <View
      style={[
        styles.card,
        !notification.isRead &&
          styles.unreadCard,
      ]}>

      {/* ============================================== */}
      {/* ICON */}
      {/* ============================================== */}

      <View style={styles.iconContainer}>
        <IconComponent
          size={24}
          color={getIconColor()}
          weight="regular"
        />
      </View>

      {/* ============================================== */}
      {/* CONTENT */}
      {/* ============================================== */}

      <View style={styles.content}>

        <Text style={styles.title}>
          {notification.title}
        </Text>

        <Text
          style={styles.message}
          numberOfLines={3}>
          {notification.message}
        </Text>

        <Text style={styles.time}>
          {notification.time}
        </Text>

      </View>

      {/* ============================================== */}
      {/* UNREAD DOT */}
      {/* ============================================== */}

      {!notification.isRead && (
        <View style={styles.dot} />
      )}

    </View>
  );
};

export default NotificationCard;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  card: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    marginHorizontal: 20,
    marginBottom: 16,

    padding: 16,

    borderRadius: 18,

    elevation: 3,

    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 6,

    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF7A00',
  },

  iconContainer: {
    width: 48,
    height: 48,

    borderRadius: 24,

    backgroundColor: '#FFF7ED',

    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  message: {
    marginTop: 4,

    color: '#6B7280',

    fontSize: 14,

    lineHeight: 20,
  },

  time: {
    marginTop: 8,

    fontSize: 12,

    color: '#9CA3AF',
  },

  dot: {
    width: 10,
    height: 10,

    borderRadius: 5,

    backgroundColor: '#FF7A00',
  },

});