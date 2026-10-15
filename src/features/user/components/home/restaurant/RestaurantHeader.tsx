import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowLeft,
  Heart,
  ShareNetwork,
} from 'phosphor-react-native';

import Colors from '../../../../../constants/colors';
import AsyncImage from '../../../../../components/images/AsyncImage';

interface RestaurantHeaderProps {
  restaurant?: {
    name?: string;
    image?: string;
    coverImage?: string;
    logo?: string;
  };
  isFavorite?: boolean;
  onBack?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
}

const RestaurantHeader: React.FC<RestaurantHeaderProps> = ({
  restaurant,
  isFavorite = false,
  onBack,
  onFavorite,
  onShare,
}) => {
  const imageSource =
    restaurant?.coverImage ||
    restaurant?.image ||
    restaurant?.logo;

  return (
    <View style={styles.container}>
      {/* Restaurant Image */}
      <View style={styles.imageContainer}>
        <AsyncImage
          source={imageSource}
          style={styles.image}
          kind="restaurant"
        />

        {/* Top Actions */}
        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onBack}
            activeOpacity={0.8}>
            <ArrowLeft
              size={22}
              weight="bold"
              color="#222"
            />
          </TouchableOpacity>

          <View style={styles.rightActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onShare}
              activeOpacity={0.8}>
              <ShareNetwork
                size={21}
                weight="regular"
                color="#222"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onFavorite}
              activeOpacity={0.8}>
              <Heart
                size={21}
                weight={isFavorite ? 'fill' : 'regular'}
                color={isFavorite ? Colors.primary : '#222'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Restaurant Name */}
      {restaurant?.name ? (
        <View style={styles.nameContainer}>
          <Text
            style={styles.restaurantName}
            numberOfLines={2}>
            {restaurant.name}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export default RestaurantHeader;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
  },

  imageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: '#F5F5F5',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },

  placeholderText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
  },

  topActions: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },

  nameContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },

  restaurantName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
});