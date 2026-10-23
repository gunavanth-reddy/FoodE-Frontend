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
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onPress,
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

      <View style={styles.mainRow}>
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

          <Text style={styles.name}>{item.name}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Star size={14} color="#F59E0B" weight="fill" />
            <Text style={styles.rating}>
              {Number(item.rating ?? 0).toFixed(1)}
            </Text>
          </View>

          {/* Price */}
          <Text style={styles.price}>₹{item.price}</Text>

          {/* Description */}
          <Text numberOfLines={3} style={styles.description}>
            {item.description}
          </Text>
        </View>

        {/* Right Section */}
        <View style={styles.imageSection}>
          <AsyncImage
            source={item?.image}
            style={styles.image}
            kind="food"
          />
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
                size={17}
                color={isFavorite ? '#FF7A00' : '#4A4039'}
                weight={isFavorite ? 'fill' : 'regular'}
              />
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <QuantitySelector
          item={item}
          onAdd={handleAdd}
          adding={adding}
          inline
        />
      </View>
    </TouchableOpacity>
  );
};

export default MenuItemCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
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

  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
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
    marginLeft: 5,
    color: '#16A34A',
    fontWeight: '700',
  },

  price: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  description: {
    marginTop: 6,
    color: '#6B625C',
    fontSize: 12,
    lineHeight: 17,
  },

  imageSection: {
    width: 116,
    alignItems: 'center',
    position: 'relative',
  },

  favoriteButton: {
    position: 'absolute',
    right: 7,
    bottom: 7,
    width: 29,
    height: 29,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },

  image: {
    width: 116,
    height: 112,
    borderRadius: 14,
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
