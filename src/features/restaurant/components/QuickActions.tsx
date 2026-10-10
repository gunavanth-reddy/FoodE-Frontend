import React from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  ShoppingBag,
  ForkKnife,
  Storefront,
  Star,
  Clock,
  CaretRight,
} from 'phosphor-react-native';

// =====================================================
// TYPES
// =====================================================

interface QuickAction {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress?: () => void;
}

interface QuickActionsProps {
  onOrdersPress?: () => void;
  onMenuPress?: () => void;
  onRestaurantPress?: () => void;
  onReviewsPress?: () => void;
  onDeliverySlotsPress?: () => void;
}

// =====================================================
// COMPONENT
// =====================================================

const QuickActions: React.FC<QuickActionsProps> = ({
  onOrdersPress,
  onMenuPress,
  onRestaurantPress,
  onReviewsPress,
  onDeliverySlotsPress,
}) => {
  const actions: QuickAction[] = [
    {
      icon: (
        <ShoppingBag
          size={21}
          color="#FF6B00"
          weight="duotone"
        />
      ),
      title: 'Orders',
      subtitle: 'Manage orders',
      onPress: onOrdersPress,
    },

    {
      icon: (
        <ForkKnife
          size={21}
          color="#FF6B00"
          weight="duotone"
        />
      ),
      title: 'Menu',
      subtitle: 'Manage food',
      onPress: onMenuPress,
    },

    {
      icon: (
        <Storefront
          size={21}
          color="#FF6B00"
          weight="duotone"
        />
      ),
      title: 'Restaurant',
      subtitle: 'Edit details',
      onPress: onRestaurantPress,
    },

    {
      icon: (
        <Star
          size={21}
          color="#FF6B00"
          weight="fill"
        />
      ),
      title: 'Reviews',
      subtitle: 'View reviews',
      onPress: onReviewsPress,
    },

    {
      icon: (
        <Clock
          size={21}
          color="#FF6B00"
          weight="duotone"
        />
      ),
      title: 'Delivery Slots',
      subtitle: 'Manage delivery times',
      onPress: onDeliverySlotsPress,
    },
  ];

  return (
    <View style={styles.container}>
      {actions.map(action => (
        <TouchableOpacity
          key={action.title}
          activeOpacity={0.8}
          onPress={action.onPress}
          style={styles.card}>

          {/* ICON */}
          <View style={styles.iconContainer}>
            {action.icon}
          </View>

          {/* TITLE */}
          <Text style={styles.title}>
            {action.title}
          </Text>

          {/* SUBTITLE */}
          <Text
            style={styles.subtitle}
            numberOfLines={1}>
            {action.subtitle}
          </Text>

          {/* ARROW */}
          <View style={styles.arrowContainer}>
            <CaretRight
              size={15}
              color="#777780"
              weight="bold"
            />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },

  card: {
    width: '48%',
    minHeight: 125,
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 15,
    position: 'relative',
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },

  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#17171B',
    paddingRight: 24,
  },

  subtitle: {
    fontSize: 11,
    color: '#92929B',
    marginTop: 4,
    paddingRight: 24,
  },

  arrowContainer: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 25,
    height: 25,
    borderRadius: 10,
    backgroundColor: '#F6F6F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default QuickActions;