import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {COLORS, SPACING} from '../../styles';

interface Props {
  title: string;
}

const Badge = ({title}: Props) => {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
};

export default Badge;

const styles = StyleSheet.create({
  badge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: 50,
    alignSelf: 'flex-start',
  },

  text: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
});
