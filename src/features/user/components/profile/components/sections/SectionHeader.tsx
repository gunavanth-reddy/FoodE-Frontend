import React from 'react';
import {StyleSheet, Text} from 'react-native';

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../../styles';

interface Props {
  title: string;
}

const SectionHeader = ({title}: Props) => {
  return (
    <Text style={styles.title}>
      {title}
    </Text>
  );
};

export default SectionHeader;

const styles = StyleSheet.create({
  title: {
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    ...TYPOGRAPHY.h3,
  },
});
