import React from 'react';

import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import FoodCard from './FoodCard';

import {Food} from '../../../../restaurant/services/foodService';

import {useFavorites} from '../../../../../context/FavoritesContext';

// =====================================================
// TYPES
// =====================================================

interface FoodListProps {
  title: string;
  data: Food[];
  accentColor?: string;
  onSeeAll?: () => void;
  onFoodPress?: (food: Food) => void;
  onAddPress?: (food: Food) => void;
}

// =====================================================
// FOOD LIST
// =====================================================

const FoodList: React.FC<FoodListProps> = ({
  title,
  data,
  accentColor = '#FF7A00',
  onSeeAll,
  onFoodPress,
  onAddPress,
}) => {
  const {
    isFoodFavorite,
    toggleFoodFavorite,
  } = useFavorites();

  // ===================================================
  // EMPTY DATA
  // ===================================================

  if (!data || data.length === 0) {
    return null;
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.leftSection}>
          <View
            style={[
              styles.accentBar,
              {backgroundColor: '#FF7A00'},
            ]}
          />

          <Text
            style={styles.title}
            numberOfLines={1}>
            {title}
          </Text>
        </View>

        {onSeeAll && (
          <Pressable
            onPress={onSeeAll}
            hitSlop={8}
            style={({pressed}) => [
              styles.seeAllButton,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.seeAll}>
              See All
            </Text>
          </Pressable>
        )}
      </View>

      {/* FOOD CARDS */}

      <FlatList
        horizontal
        data={data}
        keyExtractor={item => item._id}
        renderItem={({item}) => (
          <FoodCard
            food={item}
            onPress={() => onFoodPress?.(item)}
            onAdd={onAddPress ? () => onAddPress(item) : undefined}
            isFavorite={isFoodFavorite(item._id)}
            onFavoritePress={() => toggleFoodFavorite(item)}
            showFavorite
          />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews
        nestedScrollEnabled
      />
    </View>
  );
};

export default FoodList;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },

  accentBar: {
    width: 4,
    height: 19,
    borderRadius: 20,
    marginRight: 9,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.2,
  },

  seeAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },

  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF7A00',
  },

  pressed: {
    opacity: 0.6,
  },

  list: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 6,
  },
});
