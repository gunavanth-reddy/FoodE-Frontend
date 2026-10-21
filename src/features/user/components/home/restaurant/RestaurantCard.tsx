import React, {memo, useMemo} from 'react';

import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Star,
  Clock,
  Heart,
  MapPin,
  Bicycle,
  Tag,
  CaretRight,
} from 'phosphor-react-native';

import {Restaurant} from './restaurantData';
import AsyncImage from '../../../../../components/images/AsyncImage';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: (restaurant: Restaurant) => void;
  showOffer?: boolean;
  showDeliveryChip?: boolean;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
}

const COLORS = {
  orange: '#F47721',
  orangeDark: '#D95F0A',
  orangeLight: '#FFF0E3',
  background: '#FFFFFF',
  text: '#211A16',
  secondary: '#79716B',
  muted: '#A49A92',
  border: '#F0E7DF',
  green: '#168348',
  greenLight: '#E8F7ED',
  red: '#D93636',
  redLight: '#FDECEC',
};

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onPress,
  showOffer = true,
  showDeliveryChip = true,
  isFavorite = false,
  onFavoritePress,
}) => {
  // Use the actual restaurant status supplied by the backend.
  const isOpen = restaurant.isOpen !== false;

  const rating =
    typeof restaurant.rating === 'number'
      ? restaurant.rating.toFixed(1)
      : '0.0';

  const totalReviews = restaurant.totalReviews ?? 0;
  const isVeg = restaurant.isVeg === true;

  const hasDeliveryFee =
    typeof restaurant.deliveryFee === 'number';

  const deliveryTime = useMemo(() => {
    const value: unknown = restaurant.deliveryTime;

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '20–30 min';
    }

    if (typeof value === 'number') {
      return `${value} min`;
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      const time = value as {
        min?: number;
        max?: number;
      };

      if (
        typeof time.min === 'number' &&
        typeof time.max === 'number'
      ) {
        return `${time.min}–${time.max} min`;
      }

      if (typeof time.min === 'number') {
        return `${time.min} min`;
      }

      if (typeof time.max === 'number') {
        return `${time.max} min`;
      }
    }

    return '20–30 min';
  }, [restaurant.deliveryTime]);

  const cuisine = useMemo(() => {
    const value =
      restaurant.cuisines ??
      (restaurant as Restaurant & {cuisine?: unknown}).cuisine;

    if (Array.isArray(value)) {
      return value.filter(Boolean).join(' · ') || 'Multi Cuisine';
    }

    if (typeof value === 'string' && value.trim()) {
      return value.trim().replace(/,/g, ' · ');
    }

    return 'Multi Cuisine';
  }, [restaurant]);

  // Closed restaurants cannot be opened.
  const handlePress = () => {
    if (!isOpen) {
      Alert.alert(
        'Restaurant Closed',
        'This restaurant is currently closed. Please try again later.',
        [{text: 'OK'}],
      );

      return;
    }

    onPress(restaurant);
  };

  return (
    <TouchableOpacity
      activeOpacity={isOpen ? 0.96 : 1}
      style={[styles.card, !isOpen && styles.closedCard]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{disabled: !isOpen}}
      accessibilityLabel={`${
        isOpen ? 'View' : 'Closed restaurant'
      } ${restaurant.name || 'Restaurant'}`}>

      {/* Restaurant banner image */}
      <View style={styles.imageContainer}>
        <AsyncImage
          source={
            restaurant.coverImage ||
            restaurant.image ||
            restaurant.logo
          }
          style={styles.image}
          kind="restaurant"
        />

        {/* Favorite button */}
        {onFavoritePress && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite
                ? 'Remove restaurant from favorites'
                : 'Add restaurant to favorites'
            }
            style={styles.favoriteButton}
            onPress={event => {
              event.stopPropagation();
              onFavoritePress();
            }}>
            <Heart
              size={18}
              color={isFavorite ? COLORS.orange : COLORS.text}
              weight={isFavorite ? 'fill' : 'regular'}
            />
          </TouchableOpacity>
        )}

        {/* Dark overlay for closed restaurants */}
        {!isOpen && <View style={styles.closedImageOverlay} />}

        {/* Open/closed status badge (top-left) */}
        <View
          style={[
            styles.statusBadge,
            isOpen ? styles.openBadge : styles.closedBadge,
          ]}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            {isOpen ? 'OPEN NOW' : 'CLOSED'}
          </Text>
        </View>

        {/* Rating badge (top-right) */}
        <View
          style={[
            styles.ratingBadge,
            onFavoritePress ? styles.ratingBadgeWithFavorite : null,
          ]}>
          <Star
            size={13}
            color="#FFFFFF"
            weight="fill"
          />
          <Text style={styles.ratingText}>{rating}</Text>
          {totalReviews > 0 && (
            <Text style={styles.reviewText}>
              ({totalReviews})
            </Text>
          )}
        </View>
      </View>

      {/* Restaurant details - compact below image */}
      <View style={styles.content}>
        <View style={styles.mainRow}>
          <View style={styles.detailsCol}>
            {/* Restaurant name in bold/uppercase */}
            <Text
              numberOfLines={1}
              style={styles.name}>
              {restaurant.name?.toUpperCase() || 'RESTAURANT'}
            </Text>

            {/* Address with delivery fee beside it */}
            <View style={styles.locationAndFeeRow}>
              <MapPin
                size={14}
                color={COLORS.secondary}
                weight="fill"
              />

              <Text
                numberOfLines={1}
                style={styles.addressText}>
                {restaurant.address || 'SRM University'}
              </Text>

              <Text style={styles.feeDot}>•</Text>

              <Text
                numberOfLines={1}
                style={styles.deliveryFeeText}>
                {restaurant.freeDelivery
                  ? 'Free Delivery'
                  : hasDeliveryFee
                  ? `₹${restaurant.deliveryFee} delivery`
                  : 'Free Delivery'}
              </Text>
            </View>
          </View>

          {/* Action indicator button on bottom-right */}
          <View style={styles.arrowContainer}>
            <CaretRight
              size={18}
              color={COLORS.orange}
              weight="bold"
            />
          </View>
        </View>

        {/* Optional offer chip if available */}
        {showOffer && restaurant.offer ? (
          <View style={styles.offerRow}>
            <Tag
              size={12}
              color={COLORS.orangeDark}
              weight="fill"
            />
            <Text
              numberOfLines={1}
              style={styles.offerText}>
              {restaurant.offer}
            </Text>
          </View>
        ) : null}

        {/* Closed notice */}
        {!isOpen && (
          <View style={styles.closedNotice}>
            <Text style={styles.closedNoticeText}>
              Restaurant is closed right now
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default memo(RestaurantCard);

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: '#FFD6B5',

    shadowColor: '#F47721',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },

  closedCard: {
    borderColor: '#F0DADA',
  },

  imageContainer: {
    width: '100%',
    aspectRatio: 1.9,
    backgroundColor: '#F6EDE4',
    position: 'relative',
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },

  closedImageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(25, 18, 15, 0.32)',
  },

  statusBadge: {
    position: 'absolute',
    top: 13,
    left: 13,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },

  openBadge: {
    backgroundColor: COLORS.green,
  },

  closedBadge: {
    backgroundColor: COLORS.red,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },

  statusText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.65,
  },

  ratingBadge: {
    position: 'absolute',
    top: 13,
    right: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.78)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },

  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 5,
  },

  reviewText: {
    color: '#E5E7EB',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },

  ratingBadgeWithFavorite: {
    right: 54,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
  },

  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  detailsCol: {
    flex: 1,
    marginRight: 12,
  },

  name: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
    letterSpacing: -0.3,
    color: '#1B140E',
  },

  locationAndFeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  addressText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#685F58',
    fontWeight: '500',
    marginLeft: 4,
    flexShrink: 1,
    maxWidth: '56%',
  },

  feeDot: {
    fontSize: 12,
    color: '#A09790',
    marginHorizontal: 6,
  },

  deliveryFeeText: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.orangeDark,
    fontWeight: '700',
    flexShrink: 0,
  },

  arrowContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF2E8',
    borderWidth: 1,
    borderColor: '#FFDFC7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFF5ED',
    alignSelf: 'flex-start',
  },

  offerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C6530A',
    marginLeft: 4,
  },

  closedNotice: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignSelf: 'flex-start',
  },

  closedNoticeText: {
    color: COLORS.red,
    fontSize: 11,
    fontWeight: '800',
  },
});