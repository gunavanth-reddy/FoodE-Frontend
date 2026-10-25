import React, {memo, useCallback} from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Minus,
  Plus,
  Star,
} from 'phosphor-react-native';

import {MenuItem} from '../../../data/menu/types';
import {useCart} from '../../../../../context/CartContext';
import AsyncImage from '../../../../../components/images/AsyncImage';

interface MenuItemCardProps {
  item: MenuItem;
  onPress?: (item: MenuItem) => void;
}

const COLORS = {
  orange: '#FF7A00',
  orangeDark: '#E96800',
  orangeLight: '#FFF1E5',
  background: '#FFFFFF',
  text: '#24201D',
  secondary: '#77716B',
  muted: '#A39B94',
  border: '#F0E9E3',
  green: '#168548',
  red: '#C62828',
  white: '#FFFFFF',
};

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onPress,
}) => {
  const {
    addItem,
    increase,
    decrease,
    getQuantity,
  } = useCart();

  const quantity = getQuantity(item.id);

  const handleAdd = useCallback(() => {
    addItem(item);
  }, [addItem, item]);

  const handleIncrease = useCallback(() => {
    increase(item.id);
  }, [increase, item.id]);

  const handleDecrease = useCallback(() => {
    decrease(item.id);
  }, [decrease, item.id]);

  const handleCardPress = useCallback(() => {
    onPress?.(item);
  }, [onPress, item]);

  return (
    <TouchableOpacity
      activeOpacity={0.97}
      style={styles.container}
      onPress={handleCardPress}>

      {/* LEFT: FOOD DETAILS */}
      <View style={styles.content}>
        {/* Veg / Non-veg indicator */}
        <View
          style={[
            styles.foodType,
            {
              borderColor: item.isVeg
                ? COLORS.green
                : COLORS.red,
            },
          ]}>
          <View
            style={[
              styles.foodDot,
              {
                backgroundColor: item.isVeg
                  ? COLORS.green
                  : COLORS.red,
              },
            ]}
          />
        </View>

        {/* Food name */}
        <Text
          numberOfLines={2}
          style={styles.name}>
          {item.name}
        </Text>

        {/* Rating and reviewer count */}
        <View style={styles.ratingRow}>
          <Star
            size={13}
            weight="fill"
            color={COLORS.orange}
          />

          <Text style={styles.rating}>
            {typeof item.rating === 'number'
              ? item.rating.toFixed(1)
              : 'New'}
          </Text>

          <Text style={styles.reviewCount}>
            ({Number(item.totalReviews ?? 0)})
          </Text>
        </View>

        {/* Price & Discount */}
        <View style={styles.priceRow}>
          {item.discountedPrice != null &&
          Number(item.discountedPrice) > 0 &&
          Number(item.discountedPrice) < item.price ? (
            <>
              <Text style={styles.price}>
                ₹{Number(item.discountedPrice)}
              </Text>
              <Text style={styles.originalPrice}>
                ₹{item.price}
              </Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>
                  {Math.round(
                    ((item.price - Number(item.discountedPrice)) /
                      item.price) *
                      100,
                  )}% OFF
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.price}>₹{item.price}</Text>
          )}
        </View>

        {/* Description */}
        {!!item.description && (
          <Text
            numberOfLines={2}
            style={styles.description}>
            {item.description}
          </Text>
        )}
      </View>

      {/* RIGHT: IMAGE AND CART BUTTON */}
      <View style={styles.imageSection}>
        <AsyncImage
          source={item.image}
          style={styles.image}
          kind="food"
        />

        {/* ADD BUTTON */}
        {quantity === 0 ? (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.addButton}
            onPress={handleAdd}
            accessibilityRole="button"
            accessibilityLabel={`Add ${item.name} to cart`}>

            <Plus
              size={15}
              weight="bold"
              color={COLORS.white}
            />

            <Text style={styles.addText}>
              ADD
            </Text>
          </TouchableOpacity>
        ) : (
          /* QUANTITY CONTROLLER */
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleDecrease}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Remove one ${item.name}`}>

              <Minus
                size={15}
                weight="bold"
                color={COLORS.orange}
              />
            </TouchableOpacity>

            <Text style={styles.quantityText}>
              {quantity}
            </Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleIncrease}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Add one more ${item.name}`}>

              <Plus
                size={15}
                weight="bold"
                color={COLORS.orange}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default memo(MenuItemCard);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,

    shadowColor: '#3D2412',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.045,
    shadowRadius: 8,
    elevation: 2,
  },

  content: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
    justifyContent: 'center',
  },

  foodType: {
    width: 17,
    height: 17,
    borderWidth: 1.4,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  foodDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  name: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.25,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 7,
  },

  rating: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
    marginLeft: 4,
  },

  reviewCount: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.muted,
    marginLeft: 4,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 6,
  },

  price: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.3,
  },

  originalPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.muted,
    textDecorationLine: 'line-through',
  },

  discountBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  discountBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },

  description: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '400',
    color: COLORS.secondary,
  },

  imageSection: {
    width: 116,
    alignItems: 'center',
    alignSelf: 'center',
    paddingBottom: 12,
  },

  image: {
    width: 116,
    height: 112,
    borderRadius: 14,
    backgroundColor: '#F7F2ED',
  },

  addButton: {
    position: 'absolute',
    bottom: -1,
    minWidth: 94,
    height: 36,
    paddingHorizontal: 15,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: COLORS.orange,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.white,

    shadowColor: COLORS.orangeDark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },

  addText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginLeft: 5,
  },

  quantityContainer: {
    position: 'absolute',
    bottom: -1,

    minWidth: 104,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.orange,
    borderRadius: 11,

    shadowColor: COLORS.orangeDark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  quantityButton: {
    width: 33,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityText: {
    minWidth: 22,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.orangeDark,
  },
});