import React from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import AppTextInput from "../../../../components/inputs/AppTextInput";

import {
  MagnifyingGlass,
  X,
} from 'phosphor-react-native';

interface RestaurantSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

const RestaurantSearchBar: React.FC<RestaurantSearchBarProps> = ({
  value,
  onChangeText,
}) => {
  const [focused, setFocused] = React.useState(false);

  return (
    <View
      style={[
        styles.container,
        Platform.OS === 'web' && focused && styles.containerFocused,
      ]}>
      <MagnifyingGlass
        size={18}
        weight="regular"
        color="#9CA3AF"
      />

      <AppTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search dishes..."
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />

      {value.length > 0 && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onChangeText('')}>
          <X
            size={18}
            weight="regular"
            color="#9CA3AF"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default RestaurantSearchBar;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFCF8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 13,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },

  containerFocused: {
    borderColor: '#FF7A00',
  },

  input: {
    flex: 1,
    marginLeft: 9,
    fontSize: 14,
    paddingVertical: 0,
    color: '#111827',
  },
});
