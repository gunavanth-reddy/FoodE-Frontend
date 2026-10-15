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
} from 'phosphor-react-native';

// =====================================================
// TYPES
// =====================================================

interface QuickAction {
  icon: React.ReactNode;
  title: string;
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
    justifyContent: 'space-between',
    rowGap: 9,
    marginBottom: 20,
  },

  card: {
    width: '31.5%',
    minHeight: 88,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  title: {
    fontSize: 11,
    fontWeight: '700',
    color: '#17171B',
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export default QuickActions;