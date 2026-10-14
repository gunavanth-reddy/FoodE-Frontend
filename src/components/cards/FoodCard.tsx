import React, {useEffect, useMemo, useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';


import Ionicons from '@react-native-vector-icons/ionicons/static';

import Colors from '../../constants/colors';
import {Food} from '../../features/restaurant/services/foodService';

interface FoodCardProps {
  food: Food;
  onPress?: () => void;
  onAdd?: () => void;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
  showFavorite?: boolean;
}

const BACKEND_ORIGIN = 'https://foode.site/api';

const FoodCard: React.FC<FoodCardProps> = ({
  food,
  onPress,
  onAdd,
  isFavorite = false,
  onFavoritePress,
  showFavorite = true,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const imageUri = useMemo(() => {
    const raw = food?.image?.trim();

    if (!raw) {
      return '';
    }

    // Cloudinary or other absolute image URLs.
    if (/^https?:\/\//i.test(raw)) {
      return raw;
    }

    // Support backend-relative paths such as /uploads/food.jpg.
    return `${BACKEND_ORIGIN}${raw.startsWith('/') ? '' : '/'}${raw}`;
  }, [food?.image]);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUri]);

  const isVeg = food.foodType
    ? food.foodType === 'veg'
    : food.isVegetarian === true;

  const displayPrice =
    typeof food.discountedPrice === 'number' &&
    food.discountedPrice > 0 &&
    food.discountedPrice < food.price
      ? food.discountedPrice
      : food.price;

  const hasDiscount =
    typeof food.discountedPrice === 'number' &&
    food.discountedPrice > 0 &&
    food.discountedPrice < food.price;

  const prepTime = food.preparationTime
    ? `${food.preparationTime} min`
    : '';

  return (
    <TouchableOpacity
      activeOpacity={0.94}
      style={styles.card}
      onPress={onPress}>
      
      {/* Food photo */}
      <View style={styles.imageContainer}>
        {!!imageUri && !imageFailed ? (
          <Image
            source={{uri: imageUri}}
            style={styles.image}
            resizeMode="cover"
            onError={() => {
              console.warn(
                'Food image failed to load:',
                imageUri,
              );
              setImageFailed(true);
            }}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons
              name="fast-food-outline"
              size={42}
              color="#C7C7C7"
            />
            <Text style={styles.placeholderText}>
              Image unavailable
            </Text>
          </View>
        )}

        <View style={styles.imageShade} />

        {!!prepTime && (
          <View style={styles.timeBadge}>
            <Ionicons
              name="time-outline"
              size={12}
              color="#FFFFFF"
            />
            <Text style={styles.timeText}>{prepTime}</Text>
          </View>
        )}

        {showFavorite && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.favoriteButton}
            onPress={onFavoritePress}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? '#EF4444' : '#333333'}
            />
          </TouchableOpacity>
        )}

        <View style={styles.foodTypeBadge}>
          <View
            style={[
              styles.foodTypeOuter,
              {
                borderColor: isVeg
                  ? '#16A34A'
                  : '#DC2626',
              },
            ]}>
            <View
              style={[
                styles.foodTypeDot,
                {
                  backgroundColor: isVeg
                    ? '#16A34A'
                    : '#DC2626',
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Food details */}
      <View style={styles.details}>
        <View style={styles.titleRow}>
          <Text
            style={styles.title}
            numberOfLines={1}>
            {food.name}
          </Text>

          <View style={styles.ratingBadge}>
            <Ionicons
              name="star"
              size={12}
              color="#F59E0B"
            />

            <Text style={styles.ratingText}>
              {Number(food.rating ?? 0).toFixed(1)}
            </Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <View style={styles.priceLine}>
              <Text style={styles.price}>
                ₹{displayPrice}
              </Text>

              {hasDiscount && (
                <Text style={styles.oldPrice}>
                  ₹{food.price}
                </Text>
              )}
            </View>

            {!!food.totalReviews && (
              <Text style={styles.reviewText}>
                {food.totalReviews} reviews
              </Text>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.addButton}
            onPress={onAdd}>
            <Text style={styles.addText}>ADD</Text>

            <Ionicons
              name="add"
              size={17}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FoodCard;

const styles = StyleSheet.create({
  card: {
    width: 224,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    overflow: 'hidden',
    marginRight: 12,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 7,
  },

  imageContainer: {
    width: '100%',
    height: 145,
    backgroundColor: '#F3F4F6',
    position: 'relative',
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },

  placeholderText: {
    marginTop: 6,
    fontSize: 11,
    color: '#9CA3AF',
  },

  imageShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 52,
    backgroundColor: 'rgba(0,0,0,0.10)',
  },

  timeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.66)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 15,
  },

  timeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },

  favoriteButton: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },

  foodTypeBadge: {
    position: 'absolute',
    top: 10,
    right: 47,
    width: 25,
    height: 25,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  foodTypeOuter: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  foodTypeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  details: {
    paddingHorizontal: 12,
    paddingTop: 11,
    paddingBottom: 12,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 7,
  },

  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF9E8',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 5,
  },

  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333333',
  },

  bottomRow: {
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },

  priceContainer: {
    flex: 1,
  },

  priceLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
  },

  price: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },

  oldPrice: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },

  reviewText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },

  addText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
});
