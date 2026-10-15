import React from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Heart,
  Star,
  Clock,
  MapPin,
  Bicycle,
  Tag,
} from 'phosphor-react-native';

import {Restaurant} from './restaurantData';
import AsyncImage from '../../../../../components/images/AsyncImage';

interface RestaurantCardProps {
  restaurant: Restaurant;

  onPress: (restaurant: Restaurant) => void;

  showFavorite?: boolean;
  isFavorite?: boolean;
  onFavoritePress?: () => void;

  showOffer?: boolean;
  showDeliveryChip?: boolean;
}

const RestaurantCard: React.FC<
  RestaurantCardProps
> = ({
  restaurant,
  onPress,

  showFavorite = true,
  isFavorite = false,
  onFavoritePress,

  showOffer = true,
  showDeliveryChip = true,
}) => {
  // ===================================================
  // IMAGE
  // ===================================================

  // ===================================================
  // OPEN STATUS
  // ===================================================

  const isOpen =
    restaurant.isOpen !== false;

  // ===================================================
  // RATING
  // ===================================================

  const rating =
    typeof restaurant.rating === 'number'
      ? restaurant.rating.toFixed(1)
      : '0.0';

  // ===================================================
  // REVIEWS
  // ===================================================

  const totalReviews =
    restaurant.totalReviews ?? 0;

  // ===================================================
  // VEG STATUS
  // ===================================================

  const isVeg =
    restaurant.isVeg === true;

  // ===================================================
  // DELIVERY FEE
  // ===================================================

  const hasDeliveryFee =
    typeof restaurant.deliveryFee ===
      'number';

  // ===================================================
  // DELIVERY TIME
  // ===================================================
  // Backend may return deliveryTime as:
  // 25
  // "25"
  // { min: 25, max: 40 }
  // React Native Text cannot render the object directly,
  // so always convert it to a string first.

  const formatDeliveryTime = (value: unknown): string => {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '20-30 min';
    }

    if (typeof value === 'number') {
      return `${value} min`;
    }

    if (typeof value === 'string') {
      return value;
    }

    if (
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      const time = value as {
        min?: number;
        max?: number;
      };

      if (
        typeof time.min === 'number' &&
        typeof time.max === 'number'
      ) {
        return `${time.min}-${time.max} min`;
      }

      if (typeof time.min === 'number') {
        return `${time.min} min`;
      }

      if (typeof time.max === 'number') {
        return `${time.max} min`;
      }
    }

    return '20-30 min';
  };

  const deliveryTime = formatDeliveryTime(
    restaurant.deliveryTime,
  );

  // ===================================================
  // CARD
  // ===================================================

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      style={styles.card}
      onPress={() =>
        onPress(restaurant)
      }
      accessibilityRole="button">

      {/* =============================================
          IMAGE
      ============================================= */}

      <View
        style={
          styles.imageContainer
        }>

        <AsyncImage
          source={restaurant.image}
          style={styles.image}
          kind="restaurant"
        />

        {/* =========================================
            FAVORITE
        ========================================= */}

        {showFavorite && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={
              styles.favorite
            }
            onPress={onFavoritePress}
            onPressIn={event => event.stopPropagation()}
            disabled={!onFavoritePress}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>

            <Heart
              size={17}
              color={
                isFavorite
                  ? '#EF4444'
                  : '#FF7A00'
              }
              weight={
                isFavorite
                  ? 'fill'
                  : 'regular'
              }
            />

          </TouchableOpacity>
        )}

        {/* =========================================
            OPEN / CLOSED
        ========================================= */}

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                isOpen
                  ? '#16A34A'
                  : '#DC2626',
            },
          ]}>

          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  '#FFFFFF',
              },
            ]}
          />

          <Text
            style={
              styles.statusText
            }>

            {isOpen
              ? 'Open'
              : 'Closed'}

          </Text>

        </View>

        {/* =========================================
            RATING
        ========================================= */}

        <View
          style={
            styles.ratingBadge
          }>

          <Star
            size={10}
            color="#FFFFFF"
            weight="fill"
          />

          <Text
            style={
              styles.ratingText
            }>

            {rating}

          </Text>

          {totalReviews > 0 && (
            <Text
              style={
                styles.reviewText
              }>

              ({totalReviews})

            </Text>
          )}

        </View>

        {/* =========================================
            VEG / NON-VEG
        ========================================= */}

        <View
          style={[
            styles.foodTypeBadge,
            {
              borderColor:
                isVeg
                  ? '#16A34A'
                  : '#DC2626',
            },
          ]}>

          <View
            style={[
              styles.foodTypeDot,
              {
                backgroundColor:
                  isVeg
                    ? '#16A34A'
                    : '#DC2626',
              },
            ]}
          />

          <Text
            style={[
              styles.foodTypeText,
              {
                color:
                  isVeg
                    ? '#15803D'
                    : '#B91C1C',
              },
            ]}>

            {isVeg
              ? 'VEG'
              : 'NON-VEG'}

          </Text>

        </View>

      </View>

      {/* =============================================
          CONTENT
      ============================================= */}

      <View
        style={
          styles.content
        }>

        {/* =========================================
            NAME
        ========================================= */}

        <Text
          numberOfLines={1}
          style={styles.name}>

          {restaurant.name}

        </Text>

        {/* =========================================
            CUISINE
        ========================================= */}

        <Text
          numberOfLines={1}
          style={
            styles.cuisine
          }>

          {restaurant.cuisines}

        </Text>

        {/* =========================================
            DELIVERY + DISTANCE
        ========================================= */}

        <View
          style={
            styles.infoRow
          }>

          <View
            style={
              styles.infoItem
            }>

            <Clock
              size={11}
              color="#6B7280"
              weight="regular"
            />

            <Text
              style={
                styles.infoText
              }>

              {deliveryTime}

            </Text>

          </View>

        </View>

        {/* =========================================
            DELIVERY FEE
        ========================================= */}

        {hasDeliveryFee && (
          <View
            style={
              styles.deliveryFeeRow
            }>

            <Bicycle
              size={12}
              color="#6B7280"
              weight="regular"
            />

            <Text
              style={
                styles.deliveryFeeText
              }>

              Delivery ₹
              {restaurant.deliveryFee}

            </Text>

          </View>
        )}

        {/* =========================================
            ADDRESS
        ========================================= */}

        {restaurant.address ? (
          <View
            style={
              styles.addressRow
            }>

            <MapPin
              size={11}
              color="#9CA3AF"
              weight="fill"
            />

            <Text
              numberOfLines={1}
              style={
                styles.address
              }>

              {restaurant.address}

            </Text>

          </View>
        ) : null}

        {/* =========================================
            CHIPS
        ========================================= */}

        <View
          style={
            styles.bottomRow
          }>

          {/* FREE DELIVERY */}

          {showDeliveryChip &&
            restaurant.freeDelivery && (
              <View
                style={
                  styles.deliveryChip
                }>

                <Bicycle
                  size={10}
                  color="#15803D"
                  weight="fill"
                />

                <Text
                  style={
                    styles.deliveryText
                  }>

                  Free Delivery

                </Text>

              </View>
            )}

          {/* OFFER */}

          {showOffer &&
            restaurant.offer ? (
              <View
                style={
                  styles.offerChip
                }>

                <Tag
                  size={10}
                  color="#EA580C"
                  weight="fill"
                />

                <Text
                  numberOfLines={1}
                  style={
                    styles.offerText
                  }>

                  {restaurant.offer}

                </Text>

              </View>
            ) : null}

        </View>

      </View>

    </TouchableOpacity>
  );
};

export default RestaurantCard;

// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({

    // ===============================================
    // CARD
    // ===============================================

    card: {
      width: '100%',

      backgroundColor: '#FFFAF5',
      borderWidth: 1,
      borderColor: '#FFD7B5',
      borderRadius: 18,

      marginBottom: 20,

      overflow: 'hidden',

      shadowColor: '#C85C00',

      shadowOpacity: 0.10,

      shadowRadius: 12,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 6,
    },

    // ===============================================
    // IMAGE
    // ===============================================

    imageContainer: {
      position: 'relative',
    },

    image: {
      width: '100%',

      height: 190,

      resizeMode: 'cover',
    },

    imagePlaceholder: {
      width: '100%',

      height: 190,

      backgroundColor:
        '#F3F4F6',

      justifyContent:
        'center',

      alignItems:
        'center',
    },

    // ===============================================
    // FAVORITE
    // ===============================================

    favorite: {
      position: 'absolute',

      top: 12,

      right: 12,

      width: 38,

      height: 38,

      borderRadius: 19,

      backgroundColor:
        '#FFFFFF',

      justifyContent:
        'center',

      alignItems:
        'center',

      elevation: 3,

      shadowColor: '#C85C00',

      shadowOpacity: 0.12,

      shadowRadius: 5,

      shadowOffset: {
        width: 0,
        height: 2,
      },
    },

    // ===============================================
    // STATUS
    // ===============================================

    statusBadge: {
      position: 'absolute',

      top: 14,

      left: 14,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal: 9,

      paddingVertical: 5,

      borderRadius: 14,
    },

    statusDot: {
      width: 6,

      height: 6,

      borderRadius: 3,

      marginRight: 5,
    },

    statusText: {
      color: '#FFFFFF',

      fontSize: 11,

      fontWeight: '700',
    },

    // ===============================================
    // RATING
    // ===============================================

    ratingBadge: {
      position: 'absolute',

      bottom: 12,

      left: 12,

      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        '#22C55E',

      borderRadius: 12,

      paddingHorizontal: 8,

      paddingVertical: 5,
    },

    ratingText: {
      marginLeft: 4,

      color: '#FFFFFF',

      fontSize: 11,

      fontWeight: '700',
    },

    reviewText: {
      marginLeft: 3,

      color: '#E5E7EB',

      fontSize: 10,

      fontWeight: '500',
    },

    // ===============================================
    // FOOD TYPE
    // ===============================================

    foodTypeBadge: {
      position: 'absolute',

      bottom: 12,

      right: 12,

      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        '#FFFFFF',

      borderWidth: 1,

      borderRadius: 12,

      paddingHorizontal: 7,

      paddingVertical: 4,
    },

    foodTypeDot: {
      width: 7,

      height: 7,

      borderRadius: 3.5,

      marginRight: 4,
    },

    foodTypeText: {
      fontSize: 9,

      fontWeight: '800',
    },

    // ===============================================
    // CONTENT
    // ===============================================

    content: {
      padding: 15,
    },

    // ===============================================
    // NAME
    // ===============================================

    name: {
      fontSize: 20,

      fontWeight: '800',

      color: '#1F2937',
    },

    // ===============================================
    // CUISINE
    // ===============================================

    cuisine: {
      marginTop: 4,

      fontSize: 13,

      color: '#6B7280',
    },

    // ===============================================
    // INFO
    // ===============================================

    infoRow: {
      flexDirection:
        'row',

      alignItems:
        'center',

      marginTop: 11,

      gap: 18,
    },

    infoItem: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },

    infoText: {
      marginLeft: 5,

      fontSize: 12,

      color: '#4B5563',

      fontWeight: '500',
    },

    // ===============================================
    // PRICE
    // ===============================================

    priceRow: {
      flexDirection:
        'row',

      alignItems:
        'center',

      marginTop: 9,
    },

    price: {
      marginLeft: 6,

      fontSize: 13,

      fontWeight: '600',

      color: '#111827',
    },

    // ===============================================
    // DELIVERY FEE
    // ===============================================

    deliveryFeeRow: {
      flexDirection:
        'row',

      alignItems:
        'center',

      marginTop: 6,
    },

    deliveryFeeText: {
      marginLeft: 6,

      fontSize: 11,

      color: '#6B7280',
    },

    // ===============================================
    // ADDRESS
    // ===============================================

    addressRow: {
      flexDirection:
        'row',

      alignItems:
        'center',

      marginTop: 8,
    },

    address: {
      flex: 1,

      marginLeft: 5,

      fontSize: 11,

      color: '#9CA3AF',
    },

    // ===============================================
    // BOTTOM CHIPS
    // ===============================================

    bottomRow: {
      flexDirection:
        'row',

      flexWrap:
        'wrap',

      alignItems:
        'center',

      marginTop: 12,
    },

    deliveryChip: {
      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        '#DCFCE7',

      paddingHorizontal: 10,

      paddingVertical: 6,

      borderRadius: 20,

      marginRight: 8,

      marginBottom: 5,
    },

    deliveryText: {
      marginLeft: 5,

      color: '#15803D',

      fontWeight: '600',

      fontSize: 11,
    },

    offerChip: {
      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        '#FFF7ED',

      paddingHorizontal: 10,

      paddingVertical: 6,

      borderRadius: 20,

      marginBottom: 5,

      maxWidth: 150,
    },

    offerText: {
      marginLeft: 5,

      color: '#EA580C',

      fontWeight: '700',

      fontSize: 11,
    },
  });
