import React from 'react';
import {
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import AppTextInput from "../../../../../components/inputs/AppTextInput";

import {
  MagnifyingGlass,
  Microphone,
} from 'phosphor-react-native';

interface SearchBarProps {
  editable?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  onVoicePress?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  editable = false,
  value = '',
  onChangeText,
  onPress,
  onVoicePress,
}) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={({pressed}) => [
          styles.searchBox,
          pressed && !editable && styles.searchBoxPressed,
        ]}
        onPress={!editable ? onPress : undefined}
        disabled={editable && !onPress}>

        {/* Search Icon */}
        <MagnifyingGlass
          size={21}
          color="#8E8E93"
          weight="regular"
          style={styles.searchIcon}
        />

        {/* Input */}
        <AppTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search for food, restaurants..."
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          cursorColor="#F47721"
          selectionColor="#F47721"
          returnKeyType="search"
          editable={editable}
          pointerEvents={editable ? 'auto' : 'none'}
        />

        {/* Voice Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.voiceButton}
          onPress={onVoicePress}
          disabled={!onVoicePress}>

          <Microphone
            size={18}
            color="#FFFFFF"
            weight="bold"
          />

        </TouchableOpacity>
      </Pressable>
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,

    backgroundColor: '#FFF8F2',
  },

  searchBox: {
    height: 54,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 16,

    backgroundColor: '#FFFFFF',

    borderRadius: 18,

    borderWidth: 1,
    borderColor: '#FFE4D0',

    elevation: 3,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  searchBoxPressed: {
    opacity: 0.85,
  },

  searchIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,

    paddingVertical: 0,

    fontSize: 15,
    fontWeight: '500',

    color: '#222222',
  },

  voiceButton: {
    width: 38,
    height: 38,

    borderRadius: 19,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#F47721',
  },
});