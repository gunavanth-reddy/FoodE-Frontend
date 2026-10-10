import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  MapPin,
} from 'phosphor-react-native';

import {
  Colors,
  Spacing,
} from '../../../../../theme';

const LocationSelector = () => {
  return (
    <View style={styles.container}>

      {/* Location Icon */}
      <View style={styles.iconContainer}>
        <MapPin
          size={21}
          color={Colors.primary}
          weight="fill"
        />
      </View>

      {/* Fixed Location */}
      <View style={styles.textContainer}>

        <Text style={styles.label}>
          Deliver to
        </Text>

        <Text
          style={styles.location}
          numberOfLines={1}>
          SRM AP University
        </Text>

        <Text style={styles.subLocation}>
          Neerukonda
        </Text>

      </View>

    </View>
  );
};

export default LocationSelector;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    width: 38,
    height: 38,

    borderRadius: 19,

    backgroundColor: '#FFF4E8',

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: Spacing.sm,
  },

  textContainer: {
    justifyContent: 'center',
  },

  label: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,

    marginBottom: 1,
  },

  location: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,

    lineHeight: 21,
  },

  subLocation: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,

    marginTop: 1,
  },
});