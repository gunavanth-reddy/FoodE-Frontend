import React, {useState} from 'react';

import {
  Alert,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {MenuItem} from '../../data/menu/types';
import QuantitySelector from './QuantitySelector';
import {Heart, Star} from 'phosphor-react-native';
import AsyncImage from '../../../../components/images/AsyncImage';
import {useFavorites} from '../../../../context/FavoritesContext';

interface MenuItemCardProps {
  item: MenuItem;
  onPress?: (item: MenuItem) => void;
  restaurantOpen?: boolean;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onPress,
  restaurantOpen = true,
}) => {
  const [adding, setAdding] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const {isFoodFavorite, toggleFoodFavorite} = useFavorites();
  const foodId = item.foodRecord?._id || item.id;
  const isFavorite = isFoodFavorite(foodId);

  const handleFavoritePress = async (event: any) => {
    event.stopPropagation();
    if (favoriteLoading) return;
    if (!item.foodRecord) {
      Alert.alert('Unable to save', 'This menu item is missing its database ID.');
      return;
    }
    try {
      setFavoriteLoading(true);
      await toggleFoodFavorite(item.foodRecord);
    } catch (error: any) {
      Alert.alert('Favorites', error?.message || 'Unable to update favorites.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!onPress || adding) {
      return;
    }

    if (!restaurantOpen) {
      Alert.alert(
        'Restaurant Closed',
        'You can browse this menu, but cannot add items while the restaurant is closed.',
      );
      return;
    }

    try {
      setAdding(true);
      await onPress(item);
    } finally {
      setAdding(false);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.container}
      onPress={handleAdd}
      disabled={adding}>

      {/* Left Section */}
      <View style={styles.content}>
        {/* Veg / Non-Veg */}
        <View
          style={[
            styles.foodType,
            {
              borderColor: item.isVeg ? '#16A34A' : '#B91C1C',
            },
          ]}>
          <View
            style={[
              styles.foodDot,
              {
                backgroundColor: item.isVeg ? '#16A34A' : '#B91C1C',
              },
            ]}
          />
        </View>

        {/* Name */}
        <Text style={styles.name}>{item.name}</Text>

        {/* Rating and reviewer count */}
        <View style={styles.ratingRow}>
          <Star size={13} color="#F59E0B" weight="fill" />
          <Text style={styles.rating}>
            {Number(item.rating ?? 0).toFixed(1)}
          </Text>
          <Text style={styles.reviewCount}>
            ({Number(item.totalReviews ?? 0)})
          </Text>
        </View>

        {/* Price & Discount */}
        <View style={styles.priceRow}>
          {item.discountedPrice != null &&
          Number(item.discountedPrice) > 0 &&
          Number(item.discountedPrice) < item.price ? (
            <>
              <Text style={styles.price}>
                ₹{Number(item.discountedPrice)}
              </Text>
              <Text style={styles.originalPrice}>
                ₹{item.price}
              </Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>
                  {Math.round(
                    ((item.price - Number(item.discountedPrice)) /
                      item.price) *
                      100,
                  )}% OFF
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.price}>₹{item.price}</Text>
          )}
        </View>

        {/* Description */}
        <Text numberOfLines={3} style={styles.description}>
          {item.description}
        </Text>
      </View>

      {/* Right Section */}
      <View style={styles.imageSection}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Remove food from favorites' : 'Add food to favorites'}
          style={styles.favoriteButton}
          disabled={favoriteLoading}
          onPress={handleFavoritePress}>
          {favoriteLoading ? (
            <ActivityIndicator size="small" color="#FF6B00" />
          ) : (
            <Heart
              size={20}
              color={isFavorite ? '#EF4444' : '#FF6B00'}
              weight={isFavorite ? 'fill' : 'regular'}
            />
          )}
        </Pressable>
        <AsyncImage
          source={item?.image}
          style={styles.image}
          kind="food"
        />

        <QuantitySelector
          item={item}
          onAdd={handleAdd}
          adding={adding}
          disabled={!restaurantOpen}
        />
      </View>
    </TouchableOpacity>
  );
};

export default MenuItemCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF8F1',
    marginHorizontal: 0,
    marginBottom: 6,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFE0C2',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },

  content: {
    flex: 1,
    paddingRight: 10,
  },

  foodType: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  foodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  name: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2A211B',
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  rating: {
    marginLeft: 4,
    color: '#16A34A',
    fontWeight: '700',
    fontSize: 12,
  },

  reviewCount: {
    marginLeft: 4,
    color: '#8A92A0',
    fontSize: 12,
    fontWeight: '500',
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
    gap: 6,
  },

  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  originalPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8A92A0',
    textDecorationLine: 'line-through',
  },

  discountBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  discountBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },

  description: {
    marginTop: 6,
    color: '#6B625C',
    fontSize: 12,
    lineHeight: 17,
  },

  imageSection: {
    alignItems: 'center',
    position: 'relative',
  },

  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    width: 92,
    height: 92,
    borderRadius: 12,
  },

  imagePlaceholder: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderText: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 4,
  },
});
