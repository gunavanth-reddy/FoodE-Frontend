import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import {BellSlash} from 'phosphor-react-native';

const EmptyNotifications = () => {
  return (
    <View style={styles.container}>

      <BellSlash
        size={90}
        color="#D1D5DB"
        weight="regular"
      />

      <Text style={styles.title}>
        No Notifications Yet
      </Text>

      <Text style={styles.subtitle}>
        You'll receive updates about your
        orders, offers and account here.
      </Text>

    </View>
  );
};

export default EmptyNotifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  title: {
    marginTop: 20,
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