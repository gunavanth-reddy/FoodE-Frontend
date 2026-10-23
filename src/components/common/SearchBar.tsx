import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AppTextInput from "../inputs/AppTextInput";

import {
  MagnifyingGlass,
  Microphone,
} from 'phosphor-react-native';

import {
  Colors,
  Radius,
  Spacing,
} from '../../theme';

interface SearchBarProps {
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
  onMicPress?: () => void;
}

const SearchBar = ({
  value,
  placeholder = 'Search...',
  onChangeText,
  onMicPress,
}: SearchBarProps) => {
  return (
    <View style={styles.container}>

      <MagnifyingGlass
        size={22}
        color={Colors.textSecondary}
        weight="regular"
      />

      <AppTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        style={styles.input}
      />

      <TouchableOpacity
        onPress={onMicPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Voice search">

        <Microphone
          size={22}
          color={Colors.primary}
          weight="regular"
        />

      </TouchableOpacity>

    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({

  container: {
    height: 56,

    backgroundColor: Colors.white,

    borderRadius: Radius.full,

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: Spacing.md,

    elevation: 3,
  },

  input: {
    flex: 1,

    marginHorizontal: 12,

    fontSize: 16,

    color: Colors.textPrimary,
  },

});