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
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFDEC7',
    alignSelf: 'center',
  },

  text: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
});
