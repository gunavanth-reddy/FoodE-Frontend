import React from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {MenuItem} from '../../data/menu/types';
import QuantitySelector from './QuantitySelector';
import {Star} from 'phosphor-react-native';
import AsyncImage from '../../../../components/images/AsyncImage';

interface MenuItemCardProps {
  item: MenuItem;
  onPress?: (item: MenuItem) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.container}
      onPress={() => onPress?.(item)}>

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

        <QuantitySelector item={item} />
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
    marginHorizontal: 14,
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
    alignItems: 'center',
    position: 'relative',
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
