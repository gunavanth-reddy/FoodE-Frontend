import React, {useState} from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  CartItem,
  useCart,
} from '../../../../context/CartContext';

// =====================================================
// TYPES
// =====================================================

interface CartQuantitySelectorProps {
  item: CartItem;
}

// =====================================================
// COMPONENT
// =====================================================

const CartQuantitySelector: React.FC<
  CartQuantitySelectorProps
> = ({item}) => {
  const {
    increase,
    decrease,
    getQuantity,
  } = useCart();

  const [updating, setUpdating] = useState(false);

  const quantity =
    getQuantity(item.id);

  // ===================================================
  // DECREASE
  // ===================================================

  const handleDecrease = async () => {
    if (updating) return;

    try {
      setUpdating(true);
      await decrease(item.id);
    } finally {
      setUpdating(false);
    }
  };

  // ===================================================
  // INCREASE
  // ===================================================

  const handleIncrease = async () => {
    if (updating) return;

    try {
      setUpdating(true);
      await increase(item.id);
    } finally {
      setUpdating(false);
    }
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <View style={styles.container}>

      {/* =================================================
          MINUS
      ================================================= */}

      <TouchableOpacity
        activeOpacity={0.7}
        disabled={updating}
        style={styles.button}
        onPress={handleDecrease}>

        <Text
          style={styles.minusText}>
          −
        </Text>

      </TouchableOpacity>

      {/* =================================================
          QUANTITY
      ================================================= */}

      <View
        style={styles.quantityContainer}>

        {updating ? (
          <ActivityIndicator
            size="small"
            color="#FF7A00"
          />
        ) : (
          <Text
            style={styles.quantity}>
            {quantity}
          </Text>
        )}

      </View>

      {/* =================================================
          PLUS
      ================================================= */}

      <TouchableOpacity
        activeOpacity={0.7}
        disabled={updating}
        style={styles.button}
        onPress={handleIncrease}>

        <Text
          style={styles.plusText}>
          +
        </Text>

      </TouchableOpacity>

    </View>
  );
};

export default CartQuantitySelector;

// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({

    // =================================================
    // CONTAINER
    // =================================================

    container: {
      width: 108,

      height: 40,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      backgroundColor: '#FFFCF8',

      borderWidth: 1,

      borderColor: '#FF7A00',

      borderRadius: 12,

      overflow: 'hidden',
    },

    // =================================================
    // BUTTON
    // =================================================

    button: {
      width: 34,

      height: '100%',

      alignItems: 'center',

      justifyContent: 'center',

      backgroundColor: '#FFF7F0',
    },

    // =================================================
    // MINUS
    // =================================================

    minusText: {
      fontSize: 22,

      lineHeight: 24,

      fontWeight: '600',

      color: '#FF7A00',

      marginTop: -2,
    },

    // =================================================
    // PLUS
    // =================================================

    plusText: {
      fontSize: 21,

      lineHeight: 23,

      fontWeight: '700',

      color: '#FF7A00',

      marginTop: -1,
    },

    // =================================================
    // QUANTITY
    // =================================================

    quantityContainer: {
      flex: 1,

      height: '100%',

      alignItems: 'center',

      justifyContent: 'center',

      backgroundColor: '#FFFCF8',
    },

    quantity: {
      fontSize: 15,

      fontWeight: '800',

      color: '#111827',
    },
  });
