import React from 'react';
import {ShoppingBagOpen} from 'phosphor-react-native';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

const EmptyCart = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}><ShoppingBagOpen size={46} color="#FF7A00" weight="duotone" /></View>

      <Text style={styles.title}>
        Your Cart is Empty
      </Text>

      <Text style={styles.subtitle}>
        Add your favourite food to get started.
      </Text>
    </View>
  );
};

export default EmptyCart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: '#FFF3E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    marginTop: 20,
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },

  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
