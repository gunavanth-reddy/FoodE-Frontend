import React from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {CartItem} from '../../../../context/CartContext';

import CartQuantitySelector from './CartQuantitySelector';
import AsyncImage from '../../../../components/images/AsyncImage';

interface CartItemCardProps {
  item: CartItem;
}

const CartItemCard: React.FC<CartItemCardProps> = ({item}) => {
  const imageUri =
    typeof item.image === 'string' ? item.image.trim() : '';

  const hasOriginalPrice =
    typeof item.originalPrice === 'number' &&
    item.originalPrice > item.price;

  return (
    <View style={styles.container}>
      {/* FOOD IMAGE */}
      <View style={styles.imageWrapper}>
        <AsyncImage
          source={imageUri || undefined}
          style={styles.image}
          kind="food"
        />
      </View>

      {/* FOOD INFORMATION */}
      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.name}>
          {item.name}
        </Text>

        {!!item.restaurantName && (
          <Text numberOfLines={1} style={styles.restaurantName}>
            {item.restaurantName}
          </Text>
        )}

        {!!item.description && (
          <Text numberOfLines={2} style={styles.description}>
            {item.description}
          </Text>
        )}

        {/* PRICE */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            ₹{Number(item.price || 0).toFixed(0)}
          </Text>

          {hasOriginalPrice && (
            <Text style={styles.originalPrice}>
              ₹{Number(item.originalPrice).toFixed(0)}
            </Text>
          )}
        </View>
      </View>

      {/* QUANTITY SELECTOR */}
      <View style={styles.selectorContainer}>
        <CartQuantitySelector item={item as any} />
      </View>
    </View>
  );
};

export default CartItemCard;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFCF8',
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F1F1',

    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  // IMAGE
  imageWrapper: {
    width: 92,
    height: 92,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  // FOOD DETAILS
  content: {
    flex: 1,
    minWidth: 0,
    marginLeft: 13,
    marginRight: 8,
    justifyContent: 'center',
    paddingVertical: 2,
  },

  name: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.2,
  },

  restaurantName: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#FF7A00',
  },

  description: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    color: '#6B7280',
  },

  // PRICE
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  price: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  originalPrice: {
    marginLeft: 7,
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },

  // QUANTITY
  selectorContainer: {
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});
