import React, {useEffect, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface MenuCategoryProps {
  categories: string[];
  selectedCategory?: string;
  onCategorySelect?: (category: string) => void;
}

const MenuCategory: React.FC<MenuCategoryProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
}) => {
  const [selected, setSelected] = useState(
    selectedCategory ?? categories[0] ?? 'Popular',
  );

  useEffect(() => {
    if (selectedCategory) {
      setSelected(selectedCategory);
    }
  }, [selectedCategory]);

  const handlePress = (category: string) => {
    setSelected(category);
    onCategorySelect?.(category);
  };

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={item => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({item}) => {
          const active = selected === item;

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handlePress(item)}
              style={[
                styles.chip,
                active && styles.activeChip,
              ]}>
              <Text
                style={[
                  styles.text,
                  active && styles.activeText,
                ]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default MenuCategory;

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 12,
  },

  list: {
    paddingHorizontal: 20,
  },

  chip: {
    backgroundColor: '#FFFCF8',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  activeChip: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },

  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  activeText: {
    color: '#FFFFFF',
  },
});
