import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Minus,
  Plus,
  Star,
} from 'phosphor-react-native';

import {MenuItem} from '../../../data/menu/types';
import {useCart} from '../../../../../context/CartContext';
import AsyncImage from '../../../../../components/images/AsyncImage';

interface MenuItemCardProps {
  item: MenuItem;
  onPress?: (item: MenuItem) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onPress,
}) => {
  const {
    addItem,
    increase,
    decrease,
    getQuantity,
  } = useCart();

  const quantity = getQuantity(item.id);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.container}
      onPress={() => onPress?.(item)}>

      <View style={styles.content}>
        {/* VEG / NON-VEG */}
        <View
          style={[
            styles.foodType,
            {
              borderColor: item.isVeg
                ? '#16A34A'
                : '#B91C1C',
            },
          ]}>
          <View
            style={[
              styles.foodDot,
              {
                backgroundColor: item.isVeg
                  ? '#16A34A'
                  : '#B91C1C',
              },
            ]}
          />
        </View>

        {/* NAME */}
        <Text style={styles.name}>
          {item.name}
        </Text>

        {/* RATING */}
        <View style={styles.ratingRow}>
          <Star
            size={12}
            weight="fill"
            color="#FF7A00"
          />

          <Text style={styles.rating}>
            {item.rating.toFixed(1)}
          </Text>
        </View>

        {/* PRICE */}
        <Text style={styles.price}>
          ₹{item.price}
        </Text>

        {/* DESCRIPTION */}
        <Text
          numberOfLines={3}
          style={styles.description}>
          {item.description}
        </Text>
      </View>

      {/* IMAGE + CART CONTROLS */}
      <View style={styles.imageSection}>
        <AsyncImage
          source={item.image}
          style={styles.image}
          kind="food"
        />

        {quantity === 0 ? (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.addButton}
            onPress={() => addItem(item)}>
            <Text style={styles.addText}>
              ADD
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => decrease(item.id)}
              activeOpacity={0.8}>
              <Minus
                size={20}
                weight="bold"
                color="#FF7A00"
              />
            </TouchableOpacity>

            <Text style={styles.quantityText}>
              {quantity}
            </Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => increase(item.id)}
              activeOpacity={0.8}>
              <Plus
                size={20}
                weight="bold"
                color="#FF7A00"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default MenuItemCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFAF5',
    borderWidth: 1,
    borderColor: '#FFE0C2',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 18,
    borderRadius: 18,

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
    paddingRight: 16,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  rating: {
    marginLeft: 5,
    color: '#C85C00',
    fontWeight: '700',
  },

  price: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  description: {
    marginTop: 10,
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 22,
  },

  imageSection: {
    alignItems: 'center',
  },

  image: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },

  addButton: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: '#FF7A00',
    borderWidth: 1,
    borderColor: '#FF7A00',
    borderRadius: 10,
    paddingHorizontal: 26,
    paddingVertical: 8,
    elevation: 4,
  },

  addText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },

  quantityContainer: {
    position: 'absolute',
    bottom: -10,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    width: 110,
    height: 42,

    backgroundColor: '#FFFCF8',

    borderWidth: 1,
    borderColor: '#FF7A00',

    borderRadius: 10,

    elevation: 4,
  },

  actionButton: {
    width: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
});