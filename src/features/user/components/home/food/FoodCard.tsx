import React, {useState} from 'react';
import {
  Alert,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {Clock, Heart} from 'phosphor-react-native';

import {Food} from '../../../../restaurant/services/foodService';
import {useCart} from '../../../../../context/CartContext';
import AsyncImage from '../../../../../components/images/AsyncImage';
import {isFoodVegetarian} from '../../../../../utils/foodClassification';
import {useFavorites} from '../../../../../context/FavoritesContext';

interface FoodCardProps {
  food: Food;
  onPress?: () => void;
  onAdd?: () => void;
  showAddButton?: boolean;
  isFavorite?: boolean;
  onFavoritePress?: () => void | Promise<void>;
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
  showFavorite = true,
}) => {
  const {addItem, loading: cartLoading} = useCart();
  const {isFoodFavorite, toggleFoodFavorite} = useFavorites();
  const [adding, setAdding] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

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

  const isVeg = isFoodVegetarian(foodRecord);
  const isUnavailable = food.isAvailable === false;

  const preparationTime = foodRecord.preparationTime;

  const favoriteActive = isFavorite || isFoodFavorite(food._id);
  const handleFavoritePress = async () => {
    if (favoriteLoading) return;
    try {
      setFavoriteLoading(true);
      await (onFavoritePress ? onFavoritePress() : toggleFoodFavorite(food));
    } catch (error: any) {
      Alert.alert('Favorites', error?.message || 'Unable to update favorites.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleAdd = async () => {
    if (isUnavailable) {
      return;
    }

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

        {showFavorite && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              favoriteActive
                ? 'Remove food from favorites'
                : 'Add food to favorites'
            }
            style={styles.favoriteButton}
            disabled={favoriteLoading}
            onPress={event => {
              event.stopPropagation();
              void handleFavoritePress();
            }}>
            {favoriteLoading ? (
              <ActivityIndicator size="small" color={ORANGE} />
            ) : (
              <Heart
                size={17}
                color={favoriteActive ? ORANGE : '#4A4039'}
                weight={favoriteActive ? 'fill' : 'regular'}
              />
            )}
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

        {isUnavailable && (
          <View style={styles.unavailableBadge} pointerEvents="none">
            <Text style={styles.unavailableBadgeText}>UNAVAILABLE</Text>
          </View>
        )}
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
                (isUnavailable || adding || cartLoading) &&
                  styles.addButtonDisabled,
              ]}
              onPress={event => {
                event.stopPropagation();
                handleAdd();
              }}
              disabled={isUnavailable || (!onAdd && (adding || cartLoading))}>
              <Text style={styles.addText}>
                {isUnavailable ? 'SOLD OUT' : adding ? '...' : 'ADD +'}
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
    right: 7,
    bottom: 7,
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

  unavailableBadge: {
    position: 'absolute',
    left: 7,
    bottom: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: 'rgba(41, 31, 27, 0.84)',
  },

  unavailableBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.45,
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
