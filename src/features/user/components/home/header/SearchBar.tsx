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
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },

  searchBox: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  searchBoxPressed: {
    backgroundColor: '#F3F4F6',
  },

  searchIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 14,
    fontWeight: '500',
    color: '#1E232C',
  },

  voiceButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
  },
});