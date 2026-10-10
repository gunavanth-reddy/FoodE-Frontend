import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons/static';

const EmptyFavorites = () => {
  return (
    <View style={styles.container}>

      <Ionicons
        name="heart-dislike-outline"
        size={80}
        color="#D1D5DB"
      />

      <Text style={styles.title}>
        No Favorites Yet
      </Text>

      <Text style={styles.subtitle}>
        Save restaurants and foods you love.
        They'll appear here.
      </Text>

    </View>
  );
};

export default EmptyFavorites;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 120,
  },

  title: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },

  subtitle: {
    marginTop: 10,
    textAlign: 'center',
    color: '#777',
    lineHeight: 24,
    fontSize: 15,
  },
});
