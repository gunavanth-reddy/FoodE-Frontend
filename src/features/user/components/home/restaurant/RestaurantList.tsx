import React from 'react';

import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';

import {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import RestaurantCard from './RestaurantCard';

import {
  Restaurant,
} from './restaurantData';

import {useAuth} from '../../../../../context/AuthContext';
import {useFavorites} from '../../../../../context/FavoritesContext';
import {FoodEAlert} from '../../../../../utils/FoodEAlert';

import {
  RootStackParamList,
} from '../../../../../navigation/AppNavigator';

// =====================================================
// TYPES
// =====================================================

interface RestaurantListProps {
  title: string;

  data: Restaurant[];

  onRestaurantPress: (
    restaurant: Restaurant,
  ) => void;

  onSeeAll?: () => void;
}

// =====================================================
// NAVIGATION
// =====================================================

type RestaurantNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

// =====================================================
// RESTAURANT LIST
// =====================================================

const RestaurantList: React.FC<
  RestaurantListProps
> = ({
  title,
  data,
  onRestaurantPress,
  onSeeAll,
}) => {
  // ===================================================
  // NAVIGATION
  // ===================================================

  const navigation =
    useNavigation<RestaurantNavigationProp>();

  // ===================================================
  // AUTH
  // ===================================================

  const {isLoggedIn} = useAuth();

  // ===================================================
  // FAVORITES
  // ===================================================

  const {
    isRestaurantFavorite,
    toggleRestaurantFavorite,
  } = useFavorites();

  // ===================================================
  // GET ID
  // ===================================================

  const getRestaurantId = (
    restaurant: Restaurant,
  ): string => {
    const item =
      restaurant as Restaurant & {
        _id?: string;
        id?: string;
      };

    return String(
      item._id ||
        item.id ||
        '',
    );
  };

  // ===================================================
  // FAVORITE BUTTON
  // ===================================================

  const handleFavoritePress = (restaurant: Restaurant) => {
    if (!isLoggedIn) {
      FoodEAlert.alert(
        'Login Required',
        'Please login to save restaurants to your favorites.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Login', onPress: () => navigation.navigate('Login')},
        ],
      );
      return;
    }

    toggleRestaurantFavorite(restaurant);
  };

  // ===================================================
  // EMPTY
  // ===================================================

  if (data.length === 0) {
    return null;
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <View
      style={styles.container}>

      {/* =================================================
          HEADER
      ================================================= */}

      <View
        style={styles.header}>

        <View
          style={styles.leftSection}>

          <View
            style={styles.accentBar}
          />

          <Text
            style={styles.title}
            numberOfLines={1}>
            {title}
          </Text>

        </View>

        {/* =================================================
            SEE ALL
        ================================================= */}

        {onSeeAll && (
          <Pressable
            onPress={onSeeAll}
            hitSlop={8}
            style={({pressed}) => [
              styles.seeAllButton,
              pressed &&
                styles.pressed,
            ]}>

            <Text
              style={styles.seeAll}>
              See All
            </Text>

          </Pressable>
        )}

      </View>

      {/* =================================================
          RESTAURANT LIST
      ================================================= */}

      <FlatList
        data={data}

        keyExtractor={item =>
          getRestaurantId(item)
        }

        scrollEnabled={false}

        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={
          styles.list
        }

        renderItem={({item}) => (
          <RestaurantCard
            restaurant={item}

            onPress={() =>
              onRestaurantPress(
                item,
              )
            }

            isFavorite={
              isRestaurantFavorite(
                item,
              )
            }

            onFavoritePress={() =>
              handleFavoritePress(
                item,
              )
            }
          />
        )}

        removeClippedSubviews
      />

    </View>
  );
};

export default RestaurantList;

// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({

    container: {
      marginTop: 30,
    },

    // =================================================
    // HEADER
    // =================================================

    header: {
      flexDirection: 'row',

      justifyContent:
        'space-between',

      alignItems: 'center',

      paddingHorizontal: 20,

      marginBottom: 18,
    },

    leftSection: {
      flex: 1,

      flexDirection: 'row',

      alignItems: 'center',

      marginRight: 12,
    },

    accentBar: {
      width: 4,

      height: 22,

      borderRadius: 20,

      backgroundColor:
        '#FF7A00',

      marginRight: 10,
    },

    title: {
      fontSize: 22,

      fontWeight: '700',

      color: '#1F2937',
    },

    // =================================================
    // SEE ALL
    // =================================================

    seeAllButton: {
      paddingVertical: 4,

      paddingHorizontal: 2,
    },

    seeAll: {
      fontSize: 14,

      fontWeight: '600',

      color: '#FF7A00',
    },

    pressed: {
      opacity: 0.6,
    },

    // =================================================
    // LIST
    // =================================================

    list: {
      paddingHorizontal: 16,

      paddingBottom: 10,
    },
  });
