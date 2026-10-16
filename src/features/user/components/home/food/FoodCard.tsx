import React, {useState} from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {Clock, Heart} from 'phosphor-react-native';

import {Food} from '../../../../restaurant/services/foodService';
import {useCart} from '../../../../../context/CartContext';
import AsyncImage from '../../../../../components/images/AsyncImage';

interface FoodCardProps {
  food: Food;
  onPress?: () => void;
  onAdd?: () => void;
  showAddButton?: boolean;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
  showFavorite?: boolean;
}

const ORANGE = '#FF6B00';
const DARK_ORANGE = '#E85D04';
const LIGHT_ORANGE = '#FFF7F0';

const FoodCard: React.FC<FoodCardProps> = ({
  food,
  onPress,
  onAdd,
  showAddButton = true,
  isFavorite = false,
  onFavoritePress,
  showFavorite = false,
}) => {
  const {addItem, loading: cartLoading} = useCart();
  const [adding, setAdding] = useState(false);

  const hasImage =
    typeof food.image === 'string' && food.image.trim().length > 0;

  const foodRecord = food as Food & {
    originalPrice?: number | string | null;
    basePrice?: number | string | null;
    sellingPrice?: number | string | null;
    preparationTime?: number | string | null;
    foodType?: string;
    isVegetarian?: boolean;
  };

  const toValidPrice = (value: unknown): number => {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  };

  const originalPrice =
    toValidPrice(foodRecord.price) ||
    toValidPrice(foodRecord.originalPrice) ||
    toValidPrice(foodRecord.basePrice) ||
    toValidPrice(foodRecord.sellingPrice);

  const discountedPrice = toValidPrice(food.discountedPrice);

  const hasDiscount =
    discountedPrice > 0 &&
    originalPrice > 0 &&
    discountedPrice < originalPrice;

  const displayPrice = hasDiscount ? discountedPrice : originalPrice;

  const foodType = foodRecord.foodType?.toLowerCase();

  const isVeg =
    foodType === 'veg'
      ? true
      : foodType === 'non-veg'
        ? false
        : foodRecord.isVegetarian === true;

  const preparationTime = foodRecord.preparationTime;

  const handleAdd = async () => {
    if (onAdd) {
      onAdd();
      return;
    }

    if (adding || cartLoading) {
      return;
    }

    try {
      setAdding(true);
      await addItem(food, 1);
    } catch (error) {
      console.log('FoodCard add error:', error);

      Alert.alert(
        'Unable to Add',
        'Something went wrong while adding this food to your cart.',
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <Pressable
      style={({pressed}) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      disabled={!onPress}>
      {/* Food Image */}
      <View style={styles.imageContainer}>
        <AsyncImage
          source={hasImage ? food.image : undefined}
          style={styles.image}
          kind="food"
        />

        {showFavorite && onFavoritePress && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite
                ? 'Remove food from favorites'
                : 'Add food to favorites'
            }
            style={styles.favoriteButton}
            onPress={event => {
              event.stopPropagation();
              onFavoritePress();
            }}>
            <Heart
              size={17}
              color={isFavorite ? ORANGE : '#4A4039'}
              weight={isFavorite ? 'fill' : 'regular'}
            />
          </Pressable>
        )}

        {/* Preparation Time */}
        {!!preparationTime && (
          <View style={styles.timeBadge}>
            <Clock size={12} color="#FFFFFF" weight="fill" />

            <Text style={styles.timeText}>
              {preparationTime} min
            </Text>
          </View>
        )}

        {/* Veg / Non-Veg Indicator */}
        <View
          style={[
            styles.foodTypeBadge,
            {
              borderColor: isVeg ? '#16A34A' : '#DC2626',
            },
          ]}>
          <View
            style={[
              styles.foodTypeDot,
              {
                backgroundColor: isVeg ? '#16A34A' : '#DC2626',
              },
            ]}
          />
        </View>
      </View>

      {/* Food Details */}
      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.name}>
          {food.name}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              ₹{displayPrice || '—'}
            </Text>

            {hasDiscount && (
              <Text style={styles.oldPrice}>
                ₹{originalPrice}
              </Text>
            )}
          </View>

          {showAddButton && (
            <Pressable
              hitSlop={4}
              style={({pressed}) => [
                styles.addButton,
                pressed && styles.addButtonPressed,
                (adding || cartLoading) &&
                  styles.addButtonDisabled,
              ]}
              onPress={event => {
                event.stopPropagation();
                handleAdd();
              }}
              disabled={!onAdd && (adding || cartLoading)}>
              <Text style={styles.addText}>
                {adding ? '...' : 'ADD +'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default FoodCard;

const styles = StyleSheet.create({
  card: {
    width: 154,
    marginRight: 10,
    backgroundColor: LIGHT_ORANGE,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFDCC2',
    shadowColor: DARK_ORANGE,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  cardPressed: {
    opacity: 0.96,
    transform: [{scale: 0.985}],
  },

  imageContainer: {
    width: '100%',
    height: 112,
    backgroundColor: '#FFEBDD',
    overflow: 'hidden',
  },

  favoriteButton: {
    position: 'absolute',
    top: 7,
    left: 7,
    width: 29,
    height: 29,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  timeBadge: {
    position: 'absolute',
    top: 7,
    left: 7,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(45, 32, 23, 0.84)',
  },

  timeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 4,
  },

  foodTypeBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 21,
    height: 21,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  foodTypeDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  content: {
    paddingHorizontal: 9,
    paddingTop: 8,
    paddingBottom: 9,
    backgroundColor: LIGHT_ORANGE,
  },

  name: {
    color: '#3D281B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.1,
  },

  bottomRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 5,
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 3,
  },

  price: {
    color: DARK_ORANGE,
    fontSize: 14,
    fontWeight: '800',
  },

  oldPrice: {
    color: '#AD9382',
    fontSize: 9,
    textDecorationLine: 'line-through',
  },

  addButton: {
    minWidth: 51,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORANGE,
  },

  addButtonPressed: {
    backgroundColor: DARK_ORANGE,
    transform: [{scale: 0.97}],
  },

  addButtonDisabled: {
    opacity: 0.55,
  },

  addText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});