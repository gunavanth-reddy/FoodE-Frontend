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

      {/* Restaurant image */}
      <View
        style={styles.imageContainer}>
        <AsyncImage
          source={
            restaurant.coverImage ||
            restaurant.image ||
            restaurant.logo
          }
          style={styles.image}
          kind="restaurant"
        />

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
              size={19}
              color={isFavorite ? COLORS.orange : COLORS.text}
              weight={isFavorite ? 'fill' : 'regular'}
            />
          </TouchableOpacity>
        )}

        {/* Dark overlay for closed restaurants */}
        {!isOpen && <View style={styles.closedImageOverlay} />}

        {/* Open/closed status */}
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

        {/* Food type */}
        <View style={styles.imageBottom}>
          <View
            style={[
              styles.foodTypeBadge,
              isVeg ? styles.vegBadge : styles.nonVegBadge,
            ]}>
            <View
              style={[
                styles.foodTypeDot,
                {
                  backgroundColor: isVeg
                    ? COLORS.green
                    : COLORS.red,
                },
              ]}
            />

            <Text
              style={[
                styles.foodTypeText,
                {
                  color: isVeg
                    ? COLORS.green
                    : COLORS.red,
                },
              ]}>
              {isVeg ? 'VEG' : 'NON-VEG'}
            </Text>
          </View>
        </View>

        {/* Rating */}
        <View style={styles.ratingBadge}>
          <Star
            size={14}
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

      {/* Restaurant details */}
      <View style={styles.content}>
        {/* Name and navigation indicator */}
        <View style={styles.nameRow}>
          <Text
            numberOfLines={1}
            style={styles.name}>
            {restaurant.name || 'Restaurant'}
          </Text>

          <View style={styles.arrowContainer}>
            <CaretRight
              size={17}
              color={COLORS.orange}
              weight="bold"
            />
          </View>
        </View>

        {/* Cuisine */}
        <Text
          numberOfLines={1}
          style={styles.cuisine}>
          {cuisine}
        </Text>

        {/* Delivery information */}
        <View style={styles.deliveryInfo}>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Clock
                size={14}
                color={COLORS.orange}
                weight="bold"
              />
            </View>

            <Text style={styles.infoText}>
              {deliveryTime}
            </Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Bicycle
                size={15}
                color={COLORS.orange}
                weight="bold"
              />
            </View>

            <Text
              numberOfLines={1}
              style={styles.infoText}>
              {restaurant.freeDelivery
                ? 'Free delivery'
                : hasDeliveryFee
                ? `₹${restaurant.deliveryFee} delivery`
                : 'Delivery available'}
            </Text>
          </View>
        </View>

        {/* Address */}
        {!!restaurant.address && (
          <View style={styles.addressRow}>
            <MapPin
              size={13}
              color={COLORS.muted}
              weight="fill"
            />

            <Text
              numberOfLines={1}
              style={styles.address}>
              {restaurant.address}
            </Text>
          </View>
        )}

        {/* Offer and free-delivery chips */}
        {((showDeliveryChip && restaurant.freeDelivery) ||
          (showOffer && restaurant.offer)) && (
          <View style={styles.chipsRow}>
            {showDeliveryChip && restaurant.freeDelivery && (
              <View style={styles.deliveryChip}>
                <Bicycle
                  size={13}
                  color={COLORS.green}
                  weight="bold"
                />

                <Text style={styles.deliveryChipText}>
                  Free Delivery
                </Text>
              </View>
            )}

            {showOffer && restaurant.offer && (
              <View style={styles.offerChip}>
                <Tag
                  size={13}
                  color={COLORS.orangeDark}
                  weight="fill"
                />

                <Text
                  numberOfLines={1}
                  style={styles.offerText}>
                  {restaurant.offer}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Closed restaurant notice */}
        {!isOpen && (
          <View style={styles.closedNotice}>
            <Text style={styles.closedNoticeText}>
              Restaurant is closed
            </Text>

            <Text style={styles.closedSubtext}>
              You cannot view this restaurant right now.
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

  imageBottom: {
    position: 'absolute',
    left: 13,
    right: 13,
    bottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  foodTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
  },

  vegBadge: {
    borderColor: '#B8E6C8',
  },

  nonVegBadge: {
    borderColor: '#F4C0C0',
  },

  foodTypeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },

  foodTypeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.45,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 16,
    backgroundColor: '#FFFCF9',
    position: 'relative',
  },

  logoContainer: {
    position: 'absolute',
    top: -35,
    left: 16,
    width: 70,
    height: 70,
    borderRadius: 18,
    padding: 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFE0C7',
    shadowColor: '#302015',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },

  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  name: {
    flex: 1,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '800',
    letterSpacing: -0.45,
    color: '#302015',
  },

  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 11,
    backgroundColor: '#FFF0E3',
    borderWidth: 1,
    borderColor: '#FFD4B3',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  cuisine: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: COLORS.secondary,
  },

  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 13,
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#FFF3E9',
    borderWidth: 1,
    borderColor: '#FFE0C7',
  },

  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  infoIcon: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFD6B5',
  },

  infoText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 11,
    lineHeight: 16,
    color: '#4D4037',
    fontWeight: '700',
  },

  infoDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#EADDD1',
    marginHorizontal: 9,
  },

  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 11,
  },

  address: {
    flex: 1,
    marginLeft: 6,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.muted,
    fontWeight: '500',
  },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 12,
  },

  deliveryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: COLORS.greenLight,
    borderWidth: 1,
    borderColor: '#D3EFDC',
    marginRight: 7,
    marginBottom: 3,
  },

  deliveryChipText: {
    marginLeft: 5,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.green,
  },

  offerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFF0E3',
    borderWidth: 1,
    borderColor: '#FFC99F',
    marginBottom: 3,
  },

  offerText: {
    flexShrink: 1,
    marginLeft: 5,
    fontSize: 10,
    fontWeight: '800',
    color: '#C6530A',
  },

  closedNotice: {
    marginTop: 11,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 9,
    backgroundColor: COLORS.redLight,
    borderWidth: 1,
    borderColor: '#F8DADA',
  },

  closedNoticeText: {
    color: COLORS.red,
    fontSize: 12,
    fontWeight: '800',
  },

  closedSubtext: {
    color: '#9D4242',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 3,
  },
});