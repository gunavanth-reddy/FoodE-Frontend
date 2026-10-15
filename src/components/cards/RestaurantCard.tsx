import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons/static';
import Colors from '../../constants/colors';
import AsyncImage from '../images/AsyncImage';

interface RestaurantCardProps {
  name: string;
  image?: string | null;
  coverImage?: string | null;
  logo?: string | null;
  cuisines?: string | string[];
  rating?: number | string | null;
  deliveryTime?: string | number | null;
  distance?: string | number | null;
  deliveryFee?: string | number | null;
  offer?: string;
  isFavorite?: boolean;
  isOpen?: boolean;
  onPress?: () => void;
  onFavorite?: () => void;
}

const RestaurantCard = ({
  name,
  image,
  coverImage,
  logo,
  cuisines = '',
  rating,
  deliveryTime,
  distance,
  deliveryFee,
  offer,
  isFavorite = false,
  isOpen = true,
  onPress,
  onFavorite,
}: RestaurantCardProps) => {
  // Prefer restaurant cover image, then logo, then image.
  const restaurantImage =
    coverImage?.trim() ||
    image?.trim() ||
    logo?.trim() ||
    '';

  const cuisineText = Array.isArray(cuisines)
    ? cuisines.filter(Boolean).join(' • ')
    : cuisines || 'Restaurant';

  const ratingValue = Number(rating);
  const displayRating =
    Number.isFinite(ratingValue) && ratingValue > 0
      ? ratingValue.toFixed(1)
      : 'New';

  const displayDeliveryTime = deliveryTime
    ? typeof deliveryTime === 'number'
      ? `${deliveryTime} min`
      : deliveryTime
    : '30–40 min';

  const displayDistance = distance
    ? typeof distance === 'number'
      ? `${distance} km`
      : distance
    : '';

  const displayDeliveryFee =
    deliveryFee !== undefined &&
    deliveryFee !== null &&
    deliveryFee !== ''
      ? typeof deliveryFee === 'number'
        ? deliveryFee === 0
          ? 'Free delivery'
          : `₹${deliveryFee}`
        : deliveryFee
      : '';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}>

      {/* Restaurant Image */}
      <AsyncImage
        source={restaurantImage}
        style={styles.image}
        kind="restaurant"
      />

      {/* Offer Badge */}
      {!!offer && (
        <View style={styles.offerBadge}>
          <Text style={styles.offerText}>
            {offer}
          </Text>
        </View>
      )}

      {/* Favorite Button */}
      {!!onFavorite && (
        <TouchableOpacity
          style={styles.favoriteButton}
          activeOpacity={0.8}
          onPress={event => {
            event.stopPropagation();
            onFavorite();
          }}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color="#E53935"
          />
        </TouchableOpacity>
      )}

      {/* Restaurant Details */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={styles.name}
            numberOfLines={1}>
            {name || 'Restaurant'}
          </Text>

          <View style={styles.ratingContainer}>
            <Ionicons
              name="star"
              color="#FFD700"
              size={14}
            />

            <Text style={styles.rating}>
              {displayRating}
            </Text>
          </View>
        </View>

        <Text
          style={styles.cuisine}
          numberOfLines={1}>
          {cuisineText}
        </Text>

        {/* Delivery Information */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons
              name="time-outline"
              size={15}
              color="#777"
            />

            <Text style={styles.infoText}>
              {displayDeliveryTime}
            </Text>
          </View>

          {!!displayDistance && (
            <View style={styles.infoItem}>
              <Ionicons
                name="location-outline"
                size={15}
                color="#777"
              />

              <Text style={styles.infoText}>
                {displayDistance}
              </Text>
            </View>
          )}

          {!!displayDeliveryFee && (
            <Text
              style={styles.deliveryFee}
              numberOfLines={1}>
              {displayDeliveryFee}
            </Text>
          )}
        </View>

        {/* Restaurant Status */}
        <View style={styles.bottomRow}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isOpen
                  ? '#E8F5E9'
                  : '#FDECEC',
              },
            ]}>
            <Text
              style={[
                styles.statusText,
                {
                  color: isOpen
                    ? '#2E7D32'
                    : '#D32F2F',
                },
              ]}>
              {isOpen ? 'OPEN' : 'CLOSED'}
            </Text>
          </View>

          <View style={styles.freeDelivery}>
            <Ionicons
              name="bicycle-outline"
              size={16}
              color={Colors.primary}
            />

            <Text style={styles.freeDeliveryText}>
              FREE DELIVERY
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RestaurantCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    marginVertical: 10,
    elevation: 5,
  },

  image: {
    width: '100%',
    height: 190,
  },

  imagePlaceholder: {
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#777',
    fontWeight: '600',
  },

  offerBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  offerText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 12,
  },

  favoriteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: Colors.white,
    borderRadius: 25,
    padding: 8,
    elevation: 2,
  },

  content: {
    padding: 16,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rating: {
    marginLeft: 4,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontSize: 13,
  },

  cuisine: {
    marginTop: 6,
    color: Colors.textSecondary,
    fontSize: 14,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 13,
  },

  deliveryFee: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },

  bottomRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    fontWeight: '700',
    fontSize: 12,
  },

  freeDelivery: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  freeDeliveryText: {
    marginLeft: 5,
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
});
