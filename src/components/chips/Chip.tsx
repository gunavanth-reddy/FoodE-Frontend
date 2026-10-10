import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  StyleProp,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons/static';

import {
  Colors,
  Radius,
  Spacing,
} from '../../theme';

type Variant = 'filled' | 'outline';

type Size = 'small' | 'medium' | 'large';

interface ChipProps {
  label: string;

  variant?: Variant;

  size?: Size;

  backgroundColor?: string;

  textColor?: string;

  borderColor?: string;

  leftIcon?: string;

  rightIcon?: string;

  disabled?: boolean;

  onPress?: () => void;

  style?: StyleProp<ViewStyle>;
}

const Chip = ({
  label,
  variant = 'filled',
  size = 'medium',
  backgroundColor = Colors.primary,
  textColor = Colors.white,
  borderColor = Colors.primary,
  leftIcon,
  rightIcon,
  disabled = false,
  onPress,
  style,
}: ChipProps) => {

  const sizes = {
    small: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      fontSize: 12,
      iconSize: 14,
    },
    medium: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      fontSize: 14,
      iconSize: 16,
    },
    large: {
      paddingVertical: 8,
      paddingHorizontal: 18,
      fontSize: 16,
      iconSize: 18,
    },
  };

  const current = sizes[size];

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor:
            variant === 'filled'
              ? backgroundColor
              : Colors.white,

          borderColor,

          borderWidth:
            variant === 'outline'
              ? 1
              : 0,

          paddingVertical:
            current.paddingVertical,

          paddingHorizontal:
            current.paddingHorizontal,

          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}>

      {leftIcon && (
        <Ionicons
          name={leftIcon as any}
          size={current.iconSize}
          color={
            variant === 'filled'
              ? textColor
              : borderColor
          }
          style={{marginRight: 6}}
        />
      )}

      <Text
        style={{
          color:
            variant === 'filled'
              ? textColor
              : borderColor,

          fontWeight: '600',

          fontSize: current.fontSize,
        }}>
        {label}
      </Text>

      {rightIcon && (
        <Ionicons
          name={rightIcon as any}
          size={current.iconSize}
          color={
            variant === 'filled'
              ? textColor
              : borderColor
          }
          style={{marginLeft: 6}}
        />
      )}

    </Pressable>
  );
};

export default Chip;

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.full,

    flexDirection: 'row',

    alignItems: 'center',

    alignSelf: 'flex-start',

    marginRight: Spacing.sm,

    marginBottom: Spacing.sm
  },
});
