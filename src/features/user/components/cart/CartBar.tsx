import React, {useEffect, useRef} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';

import {ArrowRight} from 'phosphor-react-native';

import {useCart} from '../../../../context/CartContext';

const CartBar: React.FC<{bottomOffset?: number}> = ({bottomOffset = 88}) => {
  const navigation = useNavigation();
  const slideIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideIn, {
      toValue: 1,
      useNativeDriver: true,
      damping: 17,
      stiffness: 150,
      mass: 0.8,
    }).start();
  }, [slideIn]);

  const {
    totalItems,
    totalAmount,
  } = useCart();

  if (totalItems === 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.animatedWrap, {bottom: bottomOffset, opacity: slideIn, transform: [{translateY: slideIn.interpolate({inputRange: [0, 1], outputRange: [28, 0]})}]}]}>
    <TouchableOpacity
      activeOpacity={0.92}
      style={styles.container}
      onPress={() =>
        navigation.navigate('Cart' as never)
      }>
      <View>
        <Text style={styles.items}>
          {totalItems} Item{totalItems > 1 ? 's' : ''}
        </Text>

        <Text style={styles.amount}>
          ₹{totalAmount}
        </Text>
      </View>

      <View style={styles.viewCartContainer}>
        <Text style={styles.viewCart}>
          View Cart
        </Text>

        <ArrowRight
          size={20}
          weight="bold"
          color="#FFFFFF"
        />
      </View>
    </TouchableOpacity>
    </Animated.View>
  );
};

export default CartBar;

const styles = StyleSheet.create({
  animatedWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 88,
    zIndex: 30,
  },
  container: {
    minHeight: 66,
    backgroundColor: '#FFF1E4',
    borderWidth: 1,
    borderColor: '#FFD3AD',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    elevation: 12,
    shadowColor: '#C85C00',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 6},
  },

  items: {
    color: '#C85C00',
    fontSize: 16,
    fontWeight: '700',
  },

  amount: {
    color: '#8C4A13',
    fontSize: 14,
    marginTop: 2,
  },

  viewCartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  viewCart: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    backgroundColor: '#FF7A00',
    paddingHorizontal: 12,
    paddingVertical: 9,
    overflow: 'hidden',
    borderRadius: 14,
  },
});