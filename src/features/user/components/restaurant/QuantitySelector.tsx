import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
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
  onAdd?: () => void;
  adding?: boolean;
  inline?: boolean;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  item,
  onAdd,
  adding = false,
  inline = false,
}) => {
  const navigation = useNavigation<any>();

  const {isLoggedIn} = useAuth();

  const {
    addItem,
    increase,
    decrease,
    getQuantity,
  } = useCart();

  const [updating, setUpdating] = React.useState(false);

  const quantity = getQuantity(item.id);

  const handleAddItem = async () => {
    if (onAdd) {
      onAdd();
      return;
    }

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

    try {
      setUpdating(true);
      await addItem(item);
    } finally {
      setUpdating(false);
    }
  };

  const handleIncrease = async () => {
    if (!isLoggedIn) {
      navigation.navigate('Login');
      return;
    }

    if (updating || adding) {
      return;
    }

    try {
      setUpdating(true);
      await increase(item.id);
    } finally {
      setUpdating(false);
    }
  };

  const handleDecrease = async () => {
    if (!isLoggedIn) {
      navigation.navigate('Login');
      return;
    }

    if (updating || adding) {
      return;
    }

    try {
      setUpdating(true);
      await decrease(item.id);
    } finally {
      setUpdating(false);
    }
  };

  const isBusy = adding || updating;

  if (quantity === 0) {
    return (
      <TouchableOpacity
        disabled={isBusy}
        activeOpacity={0.8}
        style={[styles.addButton, inline && styles.inlineControl]}
        onPress={handleAddItem}>
        {isBusy ? (
          <ActivityIndicator size="small" color="#FF7A00" />
        ) : (
          <Text style={styles.addText}>ADD</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.quantityContainer, inline && styles.inlineControl]}>
      <TouchableOpacity
        disabled={isBusy}
        style={styles.actionButton}
        onPress={handleDecrease}>
        <Text style={styles.actionText}>
          −
        </Text>
      </TouchableOpacity>

      {isBusy ? (
        <ActivityIndicator size="small" color="#FF7A00" />
      ) : (
        <Text style={styles.quantityText}>
          {quantity}
        </Text>
      )}

      <TouchableOpacity
        disabled={isBusy}
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
  inlineControl: {
    position: 'relative',
    bottom: undefined,
    marginTop: 0,
    width: 116,
  },

  addButton: {
    position: Platform.OS === 'web' ? 'relative' : 'absolute',
    bottom: Platform.OS === 'web' ? undefined : -10,
    marginTop: Platform.OS === 'web' ? 8 : 0,
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
    position: Platform.OS === 'web' ? 'relative' : 'absolute',
    bottom: Platform.OS === 'web' ? undefined : -10,
    marginTop: Platform.OS === 'web' ? 8 : 0,
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
