import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons/static';

import {
  Colors,
  Radius,
  Typography,
} from '../../theme';

type Variant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'danger';

interface Props {
  title: string;
  onPress: () => void;

  variant?: Variant;

  loading?: boolean;

  disabled?: boolean;

  leftIcon?: string;

  rightIcon?: string;

  style?: StyleProp<ViewStyle>;
}

const AppButton = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
}: Props) => {
  const backgroundColor = () => {
    switch (variant) {
      case 'secondary':
        return Colors.info;

      case 'danger':
        return Colors.danger;

      case 'outline':
        return Colors.white;

      default:
        return Colors.primary;
    }
  };

  const textColor =
    variant === 'outline'
      ? Colors.primary
      : Colors.white;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={loading || disabled}
      style={[
        styles.button,
        {
          backgroundColor: backgroundColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: Colors.primary,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {leftIcon && (
            <Ionicons
              name={leftIcon as any}
              size={20}
              color={textColor}
              style={{marginRight: 8}}
            />
          )}

          <Text
            style={[
              styles.title,
              {color: textColor},
            ]}>
            {title}
          </Text>

          {rightIcon && (
            <Ionicons
              name={rightIcon as any}
              size={20}
              color={textColor}
              style={{marginLeft: 8}}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export default AppButton;

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: Radius.lg,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',
  },

  title: {
    fontSize: Typography.bodyLarge,

    fontWeight: '700',
  },
});
