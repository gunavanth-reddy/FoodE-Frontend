import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useNavigation,
} from '@react-navigation/native';

import {MenuItem} from '../../data/menu/types';
import {useCart} from '../../../../context/CartContext';
import {useAuth} from '../../../../context/AuthContext';

interface QuantitySelectorProps {
  item: MenuItem;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  item,
}) => {
  const navigation = useNavigation<any>();

  const {isLoggedIn} = useAuth();

  const {
    addItem,
    increase,
    decrease,
    getQuantity,
  } = useCart();

  const quantity = getQuantity(item.id);

  const handleAddItem = () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Login Required',
        'Please login to add items to your cart.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Login',
            onPress: () =>
              navigation.navigate('Login'),
          },
        ],
      );

      return;
    }

    addItem(item);
  };

  const handleIncrease = () => {
    if (!isLoggedIn) {
      navigation.navigate('Login');
      return;
    }

    increase(item.id);
  };

  const handleDecrease = () => {
    if (!isLoggedIn) {
      navigation.navigate('Login');
      return;
    }

    decrease(item.id);
  };

  if (quantity === 0) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.addButton}
        onPress={handleAddItem}>
        <Text style={styles.addText}>
          ADD
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.quantityContainer}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleDecrease}>
        <Text style={styles.actionText}>
          −
        </Text>
      </TouchableOpacity>

      <Text style={styles.quantityText}>
        {quantity}
      </Text>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleIncrease}>
        <Text style={styles.actionText}>
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default QuantitySelector;

const styles = StyleSheet.create({
  addButton: {
    position: 'absolute',
    bottom: -10,
    width: 90,
    height: 38,
    backgroundColor: '#FFFCF8',
    borderWidth: 1,
    borderColor: '#FF7A00',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },

  addText: {
    color: '#FF7A00',
    fontWeight: '700',
    fontSize: 15,
  },

  quantityContainer: {
    position: 'absolute',
    bottom: -10,
    width: 100,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFCF8',
    borderWidth: 1,
    borderColor: '#FF7A00',
    borderRadius: 10,
    elevation: 4,
  },

  actionButton: {
    width: 32,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FF7A00',
  },

  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
});
