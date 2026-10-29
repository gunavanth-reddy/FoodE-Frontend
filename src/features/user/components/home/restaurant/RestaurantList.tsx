import React, {memo} from 'react';

import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {CaretRight, Storefront} from 'phosphor-react-native';

import RestaurantCard from './RestaurantCard';

import {Restaurant} from './restaurantData';

interface RestaurantListProps {
  title: string;
  data: Restaurant[];
  onRestaurantPress: (restaurant: Restaurant) => void;
  onSeeAll?: () => void;
  scrollOffset?: Animated.Value;
}

const ORANGE = '#FF7A00';

const RestaurantList: React.FC<RestaurantListProps> = ({
  title,
  data,
  onRestaurantPress,
  onSeeAll,
  scrollOffset,
}) => {
  if (!data.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section heading */}
      <View style={styles.header}>
        <View style={styles.headingContent}>
          <View style={styles.iconContainer}>
            <Storefront
              size={21}
              color={ORANGE}
              weight="duotone"
            />
          </View>

          <View style={styles.headingTextContainer}>
            <Text style={styles.eyebrow}>
              MADE FOR YOUR CRAVINGS
            </Text>

            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>
        </View>

        {onSeeAll && (
          <Pressable
            onPress={onSeeAll}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`See all ${title}`}
            style={({pressed}) => [
              styles.seeAllButton,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.seeAllText}>See all</Text>

            <CaretRight
              size={15}
              color={ORANGE}
              weight="bold"
            />
          </Pressable>
        )}
      </View>

      {/* Restaurant cards */}
      <View style={styles.list}>
        {data.map((restaurant, index) => {
          const item = restaurant as Restaurant & {
            _id?: string;
            id?: string;
          };
          const key = String(item._id || item.id || `restaurant-${index}`);

          return (
            <RestaurantCard
              key={key}
              restaurant={restaurant}
              onPress={() => onRestaurantPress(restaurant)}
              scrollOffset={scrollOffset}
            />
          );
        })}
      </View>

      {/* Bottom separator */}
      <View style={styles.bottomAccent}>
        <View style={styles.bottomAccentLine} />
      </View>
    </View>
  );
};

export default memo(RestaurantList);

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 8,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  headingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },

  iconContainer: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: '#FFF0E2',
    borderWidth: 1,
    borderColor: '#FFE3CA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headingTextContainer: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.35,
    color: ORANGE,
    marginBottom: 3,
  },

  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: '#201A16',
    letterSpacing: -0.65,
  },

  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingLeft: 11,
    paddingRight: 8,
    borderRadius: 12,
    backgroundColor: '#FFF1E5',
    borderWidth: 1,
    borderColor: '#FFE3CC',
  },

  seeAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: ORANGE,
    marginRight: 3,
  },

  pressed: {
    opacity: 0.65,
    transform: [{scale: 0.97}],
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },

  bottomAccent: {
    alignItems: 'center',
    marginTop: 12,
  },

  bottomAccentLine: {
    width: 42,
    height: 3,
    borderRadius: 10,
    backgroundColor: '#FFE0C3',
  },
});
