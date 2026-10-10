import React from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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
  return (
    <View style={styles.container}>
      <MagnifyingGlass
        size={18}
        weight="regular"
        color="#9CA3AF"
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search dishes..."
        placeholderTextColor="#9CA3AF"
        style={styles.input}
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

  input: {
    flex: 1,
    marginLeft: 9,
    fontSize: 14,
    paddingVertical: 0,
    color: '#111827',
  },
});