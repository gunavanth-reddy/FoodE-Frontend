import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Clock,
  Leaf,
  ArrowRight,
  ForkKnife,
} from 'phosphor-react-native';

import FoodCard from './FoodCard';
import {Food} from '../../../../restaurant/services/foodService';

interface FoodListProps {
  title: string;
  data: Food[];
  accentColor?: string;
  onSeeAll?: () => void;
  onFoodPress?: (food: Food) => void;
  onAddPress?: (food: Food) => void;
}

const FoodList: React.FC<FoodListProps> = ({
  title,
  data,
  accentColor = '#FF7A00',
  onSeeAll,
  onFoodPress,
  onAddPress,
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  const getSectionIcon = () => {
    const normalizedTitle = title.toLowerCase();

    if (normalizedTitle.includes('20 minute') || normalizedTitle.includes('under 20')) {
      return <Clock size={17} color="#FF7A00" weight="fill" />;
    }

    if (normalizedTitle.includes('non-veg') || normalizedTitle.includes('non veg')) {
      return <ForkKnife size={17} color="#E53935" weight="fill" />;
    }

    if (normalizedTitle.includes('veg')) {
      return <Leaf size={17} color="#269B58" weight="fill" />;
    }

    if (normalizedTitle.includes('restaurant')) {
      return <ForkKnife size={17} color="#FF7A00" weight="bold" />;
    }

    return <ForkKnife size={17} color={accentColor} weight="bold" />;
  };

  const getSectionColor = () => {
    const normalizedTitle = title.toLowerCase();

    if (normalizedTitle.includes('non-veg') || normalizedTitle.includes('non veg')) {
      return '#E53935';
    }

    if (normalizedTitle.includes('veg')) {
      return '#269B58';
    }

    return accentColor;
  };

  const sectionColor = getSectionColor();

  return (
    <View style={styles.container}>
      {/* SECTION HEADER */}
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <View style={styles.iconContainer}>
            {getSectionIcon()}
          </View>

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
            <Text style={[styles.seeAll, {color: sectionColor}]}>
              See all
            </Text>

            <ArrowRight
              size={14}
              color={sectionColor}
              weight="bold"
            />
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

const styles = StyleSheet.create({
  container: {
    marginTop: 13,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 7,
  },

  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },

  iconContainer: {
    width: 23,
    height: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  title: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#202127',
    letterSpacing: -0.2,
  },

  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingLeft: 5,
  },

  seeAll: {
    fontSize: 11,
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.6,
  },

  list: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 4,
  },
});