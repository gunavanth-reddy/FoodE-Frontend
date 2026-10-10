import React, {useState} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardTypeOptions,
} from 'react-native';

import {
  Phone,
  LockKey,
  Eye,
  EyeSlash,
  CaretRight,
  Info,
} from 'phosphor-react-native';

import {
  Colors,
  Radius,
  Spacing,
  Typography,
} from '../../theme';

interface AppInputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;

  leftIcon?: string;

  rightIcon?: string;

  secureTextEntry?: boolean;

  keyboardType?: KeyboardTypeOptions;

  editable?: boolean;

  error?: string;

  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';

  multiline?: boolean;

  numberOfLines?: number;
}

const AppInput = ({
  label,
  placeholder,
  value,
  onChangeText,

  leftIcon,
  rightIcon,

  secureTextEntry = false,

  keyboardType = 'default',

  editable = true,

  error,

  autoCapitalize = 'none',

  multiline = false,

  numberOfLines = 1,
}: AppInputProps) => {
  const [hidePassword, setHidePassword] =
    useState(secureTextEntry);

  const renderLeftIcon = () => {
    if (!leftIcon) {
      return null;
    }

    switch (leftIcon) {
      case 'call-outline':
      case 'phone':
      case 'phone-outline':
        return (
          <Phone
            size={20}
            color={Colors.textSecondary}
            weight="regular"
            style={styles.leftIcon}
          />
        );

      case 'lock-closed-outline':
      case 'lock':
      case 'lock-outline':
        return (
          <LockKey
            size={20}
            color={Colors.textSecondary}
            weight="regular"
            style={styles.leftIcon}
          />
        );

      default:
        return (
          <Info
            size={20}
            color={Colors.textSecondary}
            weight="regular"
            style={styles.leftIcon}
          />
        );
    }
  };

  const renderRightIcon = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity
          onPress={() =>
            setHidePassword(!hidePassword)
          }
          activeOpacity={0.7}>
          {hidePassword ? (
            <EyeSlash
              size={22}
              color={Colors.textSecondary}
              weight="regular"
            />
          ) : (
            <Eye
              size={22}
              color={Colors.textSecondary}
              weight="regular"
            />
          )}
        </TouchableOpacity>
      );
    }

    if (rightIcon) {
      switch (rightIcon) {
        case 'chevron-forward':
        case 'arrow-forward':
          return (
            <CaretRight
              size={20}
              color={Colors.textSecondary}
              weight="regular"
            />
          );

        default:
          return (
            <Info
              size={20}
              color={Colors.textSecondary}
              weight="regular"
            />
          );
      }
    }

    return null;
  };

  return (
    <View style={styles.container}>

      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,

          error && {
            borderColor: Colors.danger,
          },
        ]}>

        {renderLeftIcon()}

        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          style={[
            styles.input,

            multiline && {
              height: 120,
              textAlignVertical: 'top',
            },
          ]}
          secureTextEntry={hidePassword}
          keyboardType={keyboardType}
          editable={editable}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />

        {renderRightIcon()}

      </View>

      {!!error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}

    </View>
  );
};

export default AppInput;

const styles = StyleSheet.create({

  container: {
    marginBottom: Spacing.lg,
  },

  label: {
    fontSize: Typography.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },

  inputContainer: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: Colors.white,

    borderRadius: Radius.lg,

    borderWidth: 1,

    borderColor: Colors.border,

    paddingHorizontal: Spacing.md,

    minHeight: 56,
  },

  leftIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,

    fontSize: Typography.bodyLarge,

    color: Colors.textPrimary,
  },

  error: {
    marginTop: 5,

    color: Colors.danger,

    fontSize: 12,
  },

});