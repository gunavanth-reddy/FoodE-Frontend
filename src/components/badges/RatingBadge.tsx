import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';

import { Colors, Radius, Spacing } from '../../theme';

interface RatingBadgeProps {
  rating: number;
  size?: 'small' | 'medium' | 'large';
}

const RatingBadge = ({
  rating,
  size = 'medium',
}: RatingBadgeProps) => {

  const sizes = {
    small: {
      icon: 12,
      font: 11,
      padding: 4,
    },
    medium: {
      icon: 14,
      font: 13,
      padding: 6,
    },
    large: {
      icon: 16,
      font: 15,
      padding: 8,
    },
  };

  const current = sizes[size];

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: current.padding + 4,
          paddingVertical: current.padding,
        },
      ]}>

      <Ionicons
        name="star"
        color="#FFC107"
        size={current.icon}
      />

      <Text
        style={[
          styles.rating,
          {fontSize: current.font},
        ]}>
        {rating.toFixed(1)}
      </Text>

    </View>
  );
};

export default RatingBadge;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF8E1',
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  rating: {
    marginLeft: Spacing.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
