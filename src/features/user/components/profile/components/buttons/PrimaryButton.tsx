import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../../styles';

interface Props {
  title: string;
  onPress: () => void;
}

const PrimaryButton = ({title, onPress}: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.button}
      onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: SPACING.buttonRadius,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },

  text: {
    color: COLORS.white,
    ...TYPOGRAPHY.button,
  },
});
