import React, {useState} from 'react';
import {
  ImageBackground,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArrowLeft, Heart, ForkKnife, MapPin, Star} from 'phosphor-react-native';
import type {Restaurant} from '../home/restaurant/restaurantData';

interface RestaurantHeaderProps {
  restaurant: Restaurant;
}

const ORANGE = '#FF7900';

const RestaurantHeader: React.FC<RestaurantHeaderProps> = ({restaurant}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const data = restaurant as Restaurant & {
    coverImage?: string | null;
    image?: string | null;
    imageUrl?: string | null;
    logo?: string | null;
    name?: string;
    cuisine?: string;
    cuisines?: string[] | string;
    address?: string;
    city?: string;
    rating?: number;
    totalReviews?: number;
    isOpen?: boolean;
  };

  // A cover image should be preferred to a logo, which may be a square brand mark.
  const imageUri = [data.coverImage, data.image, data.imageUrl, data.logo].find(
    value => typeof value === 'string' && value.trim().length > 0,
  )?.trim() || '';
  const hasImage = Boolean(imageUri) && !imageError;
  const cuisineText = Array.isArray(data.cuisines)
    ? data.cuisines.join(' · ')
    : data.cuisines || data.cuisine || 'Freshly made for you';
  const locationText = [data.address, data.city].filter(Boolean).join(', ');

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      {hasImage ? (
        <ImageBackground
          source={{uri: imageUri}}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onError={() => setImageError(true)}>
          <View style={styles.imageTint} />
        </ImageBackground>
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback]}>
          <ForkKnife size={48} color="#FFFFFF" weight="duotone" />
          <Text style={styles.fallbackText}>FoodE</Text>
          <Text style={styles.fallbackCaption}>Freshly made for you</Text>
        </View>
      )}

      <View style={[styles.topControls, {top: insets.top + 10}]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          style={({pressed}) => [styles.iconButton, pressed && styles.pressed]}>
          <ArrowLeft size={25} color="#171B24" weight="bold" />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Remove favourite' : 'Add to favourites'}
          onPress={() => setIsFavorite(previous => !previous)}
          style={({pressed}) => [styles.iconButton, pressed && styles.pressed]}>
          <Heart
            size={24}
            color={isFavorite ? ORANGE : '#171B24'}
            weight={isFavorite ? 'fill' : 'regular'}
          />
        </Pressable>
      </View>

      <View style={styles.detailsOverlay}>
        <Text numberOfLines={1} style={styles.restaurantName}>
          {data.name || 'Restaurant'}
        </Text>
        <Text numberOfLines={1} style={styles.cuisine}>
          {cuisineText}
        </Text>

        <View style={styles.metaRow}>
          {typeof data.rating === 'number' && (
            <View style={styles.ratingPill}>
              <Star size={14} color="#FFFFFF" weight="fill" />
              <Text style={styles.pillText}>
                {data.rating.toFixed(1)}
                {data.totalReviews ? ` · ${data.totalReviews} reviews` : ''}
              </Text>
            </View>
          )}
          <View style={[styles.statusPill, data.isOpen === false && styles.closedPill]}>
            <View style={styles.statusDot} />
            <Text style={styles.pillText}>{data.isOpen === false ? 'Closed' : 'Open'}</Text>
          </View>
        </View>

        {locationText ? (
          <View style={styles.locationRow}>
            <MapPin size={16} color="#FFD0A5" weight="fill" />
            <Text numberOfLines={2} style={styles.locationText}>{locationText}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default RestaurantHeader;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 340,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#C85C00',
  },
  imageTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(20, 12, 5, 0.12)',
  },
  fallback: {
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  fallbackCaption: {
    marginTop: 4,
    color: '#FFF0DF',
    fontSize: 13,
    fontWeight: '600',
  },
  topControls: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
  },
  pressed: {
    opacity: 0.8,
    transform: [{scale: 0.95}],
  },
  detailsOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 20,
    backgroundColor: 'rgba(35, 18, 5, 0.80)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  restaurantName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  cuisine: {
    color: '#FFE1C5',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 13,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: ORANGE,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ORANGE,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  closedPill: {
    backgroundColor: '#7A3426',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 12,
  },
  locationText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
});
