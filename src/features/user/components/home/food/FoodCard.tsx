import React, {useState} from 'react';

import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  ForkKnife,
  Clock,
  Heart,
  Star,
} from 'phosphor-react-native';

import {Food} from '../../../../restaurant/services/foodService';
import {useCart} from '../../../../../context/CartContext';

interface FoodCardProps {
  food: Food;
  onPress?: () => void;
  onAdd?: () => void;
  showFavorite?: boolean;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
  showAddButton?: boolean;
}

const FoodCard: React.FC<FoodCardProps> = ({
  food,
  onPress,
  onAdd,
  showFavorite = true,
  isFavorite = false,
  onFavoritePress,
  showAddButton = true,
}) => {
  const {addItem, loading: cartLoading} = useCart();
  const [adding, setAdding] = useState(false);

  const hasImage =
    typeof food.image === 'string' && food.image.trim().length > 0;

  const foodRecord = food as Food & {
    originalPrice?: number | string | null;
    basePrice?: number | string | null;
    sellingPrice?: number | string | null;
    reviewCount?: number | string | null;
    totalReviews?: number | string | null;
    reviewsCount?: number | string | null;
  };

  const toValidPrice = (value: unknown): number => {
    if (value === null || value === undefined || value === '') return 0;

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

  // Prefer the explicit foodType so a stale isVegetarian=true
  // cannot incorrectly display a Non-Veg item as Veg.
  const isVeg =
    food.foodType === 'veg'
      ? true
      : food.foodType === 'non-veg'
        ? false
        : food.isVegetarian === true;

  const ratingValue = Number(food.rating);
  const hasRating = Number.isFinite(ratingValue) && ratingValue > 0;
  const rating = hasRating ? ratingValue.toFixed(1) : '';

  const reviewCount = Number(
    foodRecord.reviewCount ??
      foodRecord.totalReviews ??
      foodRecord.reviewsCount ??
      0,
  );

  const formattedReviews =
    reviewCount >= 1000
      ? `${(reviewCount / 1000)
          .toFixed(reviewCount >= 10000 ? 0 : 1)
          .replace(/\.0$/, '')}k`
      : `${Math.max(0, reviewCount)}`;

  const handleAdd = async () => {
    // On the Home screen, ADD opens the item's restaurant so the user
    // can choose options and add it from the restaurant menu.
    if (onAdd) {
      onAdd();
      return;
    }

    if (adding || cartLoading) return;

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

  const handleFavorite = () => onFavoritePress?.();

  return (
    <Pressable
      style={({pressed}) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      disabled={!onPress}>

      {/* Image with clean floating badges */}
      <View style={styles.imageContainer}>

        {hasImage ? (
          <Image
            source={{uri: food.image}}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <ForkKnife
              size={30}
              color="#C9CDD3"
              weight="regular"
            />
          </View>
        )}

        {!!food.preparationTime && (
          <View style={styles.timeBadge}>
            <Clock
              size={10}
              color="#FFFFFF"
              weight="fill"
            />

            <Text style={styles.timeText}>
              {food.preparationTime} min
            </Text>
          </View>
        )}

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

        {showFavorite && (
          <Pressable
            hitSlop={8}
            style={({pressed}) => [
              styles.favoriteButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleFavorite}
            disabled={!onFavoritePress}>

            <Heart
              size={14}
              color={isFavorite ? '#EF4444' : '#343A40'}
              weight={isFavorite ? 'fill' : 'regular'}
            />

          </Pressable>
        )}

      </View>

      {/* Details */}
      <View style={styles.content}>

        <Text
          numberOfLines={1}
          style={styles.name}>
          {food.name}
        </Text>

        {(hasRating || reviewCount > 0) && (
          <View style={styles.ratingRow}>

            {hasRating && (
              <>
                <Star
                  size={11}
                  color="#F5B301"
                  weight="fill"
                />

                <Text style={styles.ratingText}>
                  {rating}
                </Text>
              </>
            )}

            {reviewCount > 0 && (
              <Text style={styles.reviewText}>
                ({formattedReviews}{' '}
                {reviewCount === 1 ? 'Review' : 'Reviews'})
              </Text>
            )}

          </View>
        )}

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
    backgroundColor: '#FFF8F1',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFD7B5',
    shadowColor: '#111827',
    shadowOpacity: 0.09,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },

  cardPressed: {
    opacity: 0.94,
    transform: [{scale: 0.985}],
  },

  imageContainer: {
    height: 94,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },

  timeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 24, 28, 0.78)',
  },

  timeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },

  foodTypeBadge: {
    position: 'absolute',
    top: 8,
    right: 47,
    width: 23,
    height: 23,
    borderRadius: 6,
    backgroundColor: '#FFFCF8',
    borderWidth: 1.4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  foodTypeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  favoriteButton: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },

  buttonPressed: {
    opacity: 0.7,
  },

  content: {
    paddingHorizontal: 9,
    paddingTop: 7,
    paddingBottom: 8,
  },

  name: {
    color: '#2A211B',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.1,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  ratingText: {
    marginLeft: 4,
    color: '#343A40',
    fontSize: 10.5,
    fontWeight: '700',
  },

  reviewText: {
    marginLeft: 3,
    color: '#858B94',
    fontSize: 10,
    flexShrink: 1,
  },

  bottomRow: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },

  price: {
    color: '#171A1F',
    fontSize: 15,
    fontWeight: '800',
  },

  oldPrice: {
    marginLeft: 4,
    color: '#9CA3AF',
    fontSize: 10,
    textDecorationLine: 'line-through',
  },

  addButton: {
    minWidth: 52,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
  },

  addButtonPressed: {
    opacity: 0.82,
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