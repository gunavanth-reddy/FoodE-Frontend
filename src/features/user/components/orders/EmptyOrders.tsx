import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import {Receipt} from 'phosphor-react-native';

const EmptyOrders = () => {
  return (
    <View style={styles.container}>

      <View style={styles.iconCircle}>
        <Receipt
          size={42}
          color="#FF7A00"
          weight="duotone"
        />
      </View>

      <Text style={styles.title}>
        No Orders Yet
      </Text>

      <Text style={styles.subtitle}>
        Looks like you haven't ordered
        anything yet.
      </Text>

    </View>
  );
};

export default EmptyOrders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 120,
  },

  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: '#FFF3E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },

  subtitle: {
    marginTop: 10,
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});
