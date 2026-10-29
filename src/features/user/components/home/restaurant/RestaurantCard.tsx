import React, {memo, useEffect, useMemo, useRef, useState} from 'react';

import {
  Alert,
  ActivityIndicator,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Star,
  Heart,
  MapPin,
  Bicycle,
  Tag,
  CaretRight,
} from 'phosphor-react-native';

import {Restaurant} from './restaurantData';
import AsyncImage from '../../../../../components/images/AsyncImage';
import {useFavorites} from '../../../../../context/FavoritesContext';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: (restaurant: Restaurant) => void;
  showOffer?: boolean;
  showDeliveryChip?: boolean;
  isFavorite?: boolean;
  onFavoritePress?: () => void | Promise<void>;
  scrollOffset?: Animated.Value;
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
};

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onPress,
  showOffer = true,
  showDeliveryChip = true,
  isFavorite = false,
  onFavoritePress,
  scrollOffset,
}) => {
  // Use the actual restaurant status supplied by the backend.
  const isOpen = restaurant.isOpen !== false;
  const {isRestaurantFavorite, toggleRestaurantFavorite} = useFavorites();
  const favoriteActive = isFavorite || isRestaurantFavorite(restaurant);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const swingAngle = useRef(new Animated.Value(0)).current;
  const swingResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen || !scrollOffset) {
      return;
    }

    let previousOffset: number | null = null;
    let previousTime = 0;
    const listenerId = scrollOffset.addListener(({value}) => {
      const now = Date.now();
      if (previousOffset !== null) {
        const elapsed = Math.max(now - previousTime, 1);
        const velocity = (value - previousOffset) / elapsed;
        if (Math.abs(velocity) > 0.12) {
          const oppositeSwing = Math.max(-22, Math.min(22, -velocity * 7));
          Animated.spring(swingAngle, {
            toValue: oppositeSwing,
            useNativeDriver: true,
            tension: 95,
            friction: 9,
          }).start();

          if (swingResetTimer.current) {
            clearTimeout(swingResetTimer.current);
          }
          swingResetTimer.current = setTimeout(() => {
            Animated.spring(swingAngle, {
              toValue: 0,
              velocity: -oppositeSwing / 12,
              useNativeDriver: true,
              tension: 34,
              friction: 4,
            }).start();
            swingResetTimer.current = null;
          }, 90);
        }
      }
      previousOffset = value;
      previousTime = now;
    });

    return () => {
      scrollOffset.removeListener(listenerId);
      if (swingResetTimer.current) {
        clearTimeout(swingResetTimer.current);
        swingResetTimer.current = null;
      }
      swingAngle.stopAnimation();
      swingAngle.setValue(0);
    };
  }, [isOpen, scrollOffset, swingAngle]);

  const handleFavoritePress = async () => {
    if (favoriteLoading) return;
    try {
      setFavoriteLoading(true);
      await (onFavoritePress ? onFavoritePress() : toggleRestaurantFavorite(restaurant));
    } catch (error: any) {
      Alert.alert('Favorites', error?.message || 'Unable to update favorites.');
    } finally {
      setFavoriteLoading(false);
    }
  };

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

  const handlePress = () => {
    onPress(restaurant);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.96}
      style={[
        styles.card,
        !isOpen && styles.closedCard,
        // Override RN Web's `touch-action: manipulation` so vertical swipes
        // that begin on a tappable card continue scrolling the parent feed in Safari.
        Platform.OS === 'web' ? ({touchAction: 'pan-y'} as any) : null,
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`View ${restaurant.name || 'Restaurant'}${isOpen ? '' : ', currently closed'}`}>

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
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={
            favoriteActive
              ? 'Remove restaurant from favorites'
              : 'Add restaurant to favorites'
          }
          style={styles.favoriteButton}
          disabled={favoriteLoading}
          onPress={event => {
            event.stopPropagation();
            handleFavoritePress();
          }}>
          {favoriteLoading ? (
            <ActivityIndicator size="small" color={COLORS.orange} />
          ) : (
            <Heart
              size={18}
              color={favoriteActive ? COLORS.orange : COLORS.text}
              weight={favoriteActive ? 'fill' : 'regular'}
            />
          )}
        </TouchableOpacity>

        {/* Dark overlay for closed restaurants */}
        {!isOpen && <View pointerEvents="none" style={styles.closedImageOverlay} />}

        {isOpen ? (
          <View
            pointerEvents="none"
            style={[styles.statusBadge, styles.openBadge]}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>OPEN NOW</Text>
          </View>
        ) : (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.closedHanger,
              {
                transformOrigin: '50% 8%',
                transform: [
                  {
                    rotate: swingAngle.interpolate({
                      inputRange: [-22, 22],
                      outputRange: ['-22deg', '22deg'],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.hangerAnchor} />
            <View style={[styles.hangerCord, styles.leftHangerCord]} />
            <View style={[styles.hangerCord, styles.rightHangerCord]} />
            <View style={styles.hangingSignOuter}>
              <View style={styles.hangingSignInner}>
                <View style={[styles.signRivet, styles.leftSignRivet]} />
                <View style={[styles.signRivet, styles.rightSignRivet]} />
                <Text style={styles.hangingSignText}>CLOSED</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Rating badge (top-right) */}
        <View
          pointerEvents="none"
          style={[
            styles.ratingBadge,
            styles.ratingBadgeWithFavorite,
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
    backgroundColor: 'rgba(25, 18, 15, 0.2)',
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

  closedHanger: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },

  hangerAnchor: {
    position: 'absolute',
    top: '8%',
    left: '50%',
    marginLeft: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F5F1ED',
    borderWidth: 1,
    borderColor: '#BEB6AF',
    zIndex: 2,
  },

  hangerCord: {
    position: 'absolute',
    top: '31%',
    width: '40%',
    height: 2,
    borderRadius: 1,
    backgroundColor: '#E7E0DA',
    shadowColor: '#24180F',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.26,
    shadowRadius: 2,
    elevation: 2,
  },

  leftHangerCord: {
    left: '15%',
    transform: [{rotate: '-34deg'}],
  },

  rightHangerCord: {
    left: '45%',
    transform: [{rotate: '34deg'}],
  },

  hangingSignOuter: {
    position: 'absolute',
    top: '49%',
    left: '14%',
    width: '72%',
    height: 62,
    padding: 5,
    borderRadius: 13,
    backgroundColor: '#A7191D',
    borderWidth: 1,
    borderColor: '#871216',
    shadowColor: '#21100D',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.32,
    shadowRadius: 8,
    elevation: 7,
    transform: [{rotate: '-1.5deg'}],
  },

  hangingSignInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    backgroundColor: '#D93636',
  },

  signRivet: {
    position: 'absolute',
    top: 5,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#F8D9D4',
    borderWidth: 1,
    borderColor: '#A7191D',
  },

  leftSignRivet: {
    left: 6,
  },

  rightSignRivet: {
    right: 6,
  },

  hangingSignText: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',
    letterSpacing: 2.4,
    textShadowColor: 'rgba(80, 0, 0, 0.25)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 1,
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

});
