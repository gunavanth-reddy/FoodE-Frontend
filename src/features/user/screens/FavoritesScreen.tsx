import React, {useMemo, useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  Storefront,
  Heart,
  Compass,
} from 'phosphor-react-native';

import {useNavigation} from '@react-navigation/native';

import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {RootStackParamList} from '../../../navigation/AppNavigator';

import FavoriteTabs, {
  FavoriteTab,
} from '../components/favorites/FavoriteTabs';

import RestaurantCard from '../components/home/restaurant/RestaurantCard';

import FoodCard from '../components/home/food/FoodCard';

import {Restaurant} from '../components/home/restaurant/restaurantData';

import {Food} from '../../restaurant/services/foodService';

import {useFavorites} from '../../../context/FavoritesContext';
import {FoodEAlert} from '../../../utils/FoodEAlert';

// =====================================================
// TYPES
// =====================================================

type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

// =====================================================
// SCREEN
// =====================================================

const FavoritesScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  // ===================================================
  // FAVORITES CONTEXT
  // ===================================================

  const {
    favoriteRestaurants,
    favoriteFoods,
    removeRestaurantFavorite,
    removeFoodFavorite,
    loading,
  } = useFavorites();

  // ===================================================
  // ACTIVE TAB
  // ===================================================

  const [activeTab, setActiveTab] =
    useState<FavoriteTab>('restaurants');

  // ===================================================
  // CURRENT DATA
  // ===================================================

  const currentData = useMemo<Array<Restaurant | Food>>(() => {
    if (activeTab === 'restaurants') {
      return favoriteRestaurants as Restaurant[];
    }

    return favoriteFoods as Food[];
  }, [
    activeTab,
    favoriteRestaurants,
    favoriteFoods,
  ]);

  const currentCount = currentData.length;

  // ===================================================
  // TOTAL FAVORITES
  // ===================================================

  const totalFavorites =
    favoriteRestaurants.length +
    favoriteFoods.length;

  // ===================================================
  // HOME
  // ===================================================

  const goToHome = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // ===================================================
  // RESTAURANT PRESS
  // ===================================================

  const handleRestaurantPress = (
    restaurant: Restaurant,
  ) => {
    navigation.navigate('RestaurantDetails', {
      restaurant,
    });
  };

  // ===================================================
  // FOOD PRESS
  // ===================================================

  const handleFoodPress = (food: Food) => {
    console.log(
      'Selected favorite food:',
      food.name,
    );
  };

  // ===================================================
  // REMOVE RESTAURANT
  // ===================================================

  const handleRemoveRestaurant = (
    restaurant: Restaurant,
  ) => {
    FoodEAlert.alert(
      'Remove from Favorites?',
      `Remove ${restaurant.name} from your favorite restaurants?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            removeRestaurantFavorite(
              restaurant._id || restaurant.backendId || restaurant.id || '',
            ),
        },
      ],
    );
  };

  // ===================================================
  // REMOVE FOOD
  // ===================================================

  const handleRemoveFood = (food: Food) => {
    FoodEAlert.alert(
      'Remove from Favorites?',
      `Remove ${food.name} from your favorite foods?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            removeFoodFavorite(food._id),
        },
      ],
    );
  };

  // ===================================================
  // EMPTY STATE
  // ===================================================

  const renderEmptyState = () => {
    const isRestaurantTab =
      activeTab === 'restaurants';

    return (
      <View style={styles.emptyWrapper}>
        <View style={styles.emptyIconContainer}>
          {isRestaurantTab ? (
            <Storefront size={38} color="#FF7A00" weight="duotone" />
          ) : (
            <Heart size={38} color="#FF7A00" weight="regular" />
          )}
        </View>

        <Text style={styles.emptyTitle}>
          {isRestaurantTab
            ? 'No favorite restaurants'
            : 'No favorite foods'}
        </Text>

        <Text style={styles.emptyDescription}>
          {isRestaurantTab
            ? 'Save restaurants you love and find them here anytime.'
            : 'Save your favorite dishes and order them quickly anytime.'}
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.exploreButton}
          onPress={goToHome}>
          <Compass size={18} color="#FFFFFF" weight="fill" />

          <Text style={styles.exploreButtonText}>
            Explore FoodE
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={['top', 'left', 'right']}>
        <View style={styles.loadingScreen}>
          <View style={styles.loadingIcon}>
            <Heart size={30} color="#FF7A00" weight="fill" />
          </View>

          <ActivityIndicator
            size="small"
            color="#FF7A00"
          />

          <Text style={styles.loadingText}>
            Loading your favorites...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ===================================================
  // SCREEN
  // ===================================================

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}>

      <FlatList<Restaurant | Food>
        data={currentData}
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          currentData.length === 0
            ? styles.emptyList
            : styles.listContent
        }

        // =================================================
        // HEADER
        // =================================================

        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View
                  style={styles.headerTextContainer}>
                  <Text style={styles.eyebrow}>
                    YOUR COLLECTION
                  </Text>

                  <Text style={styles.title}>
                    Favorites
                  </Text>

                  <Text style={styles.subtitle}>
                    Everything you love,
                    all in one place.
                  </Text>
                </View>

                <View style={styles.heartContainer}>
                  <Heart size={27} color="#FF7A00" weight="fill" />
                </View>
              </View>

              {/* QUICK STATS */}

              <View style={styles.statsContainer}>
                {/* RESTAURANTS */}

                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {favoriteRestaurants.length}
                  </Text>

                  <Text style={styles.statLabel}>
                    Restaurants
                  </Text>
                </View>

                <View style={styles.statDivider} />

                {/* FOODS */}

                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {favoriteFoods.length}
                  </Text>

                  <Text style={styles.statLabel}>
                    Foods
                  </Text>
                </View>

                <View style={styles.statDivider} />

                {/* TOTAL */}

                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {totalFavorites}
                  </Text>

                  <Text style={styles.statLabel}>
                    Total
                  </Text>
                </View>
              </View>
            </View>

            {/* TABS */}

            <View style={styles.tabsWrapper}>
              <FavoriteTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </View>

            {/* SECTION HEADER */}

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  {activeTab === 'restaurants'
                    ? 'Favorite Restaurants'
                    : 'Favorite Foods'}
                </Text>

                <Text style={styles.sectionSubtitle}>
                  {currentCount === 0
                    ? 'Nothing saved yet'
                    : `${currentCount} saved ${
                        activeTab === 'restaurants'
                          ? 'restaurant'
                          : 'food'
                      }${
                        currentCount !== 1
                          ? 's'
                          : ''
                      }`}
                </Text>
              </View>

              {currentCount > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>
                    {currentCount}
                  </Text>
                </View>
              )}
            </View>
          </>
        }

        // =================================================
        // ITEM
        // =================================================

        renderItem={({item}) => {
          // ===============================================
          // RESTAURANT
          // ===============================================

          if (activeTab === 'restaurants') {
            const restaurant =
              item as Restaurant;

            return (
              <RestaurantCard
                restaurant={restaurant}
                onPress={() =>
                  handleRestaurantPress(
                    restaurant,
                  )
                }
                isFavorite
                onFavoritePress={() =>
                  handleRemoveRestaurant(
                    restaurant,
                  )
                }
              />
            );
          }

          // ===============================================
          // FOOD
          // ===============================================

          const food = item as Food;

          return (
            <FoodCard
              food={food}
              onPress={() =>
                handleFoodPress(food)
              }
              showAddButton={false}
              isFavorite
              onFavoritePress={() =>
                handleRemoveFood(food)
              }
              showFavorite
            />
          );
        }}

        // =================================================
        // EMPTY
        // =================================================

        ListEmptyComponent={
          renderEmptyState()
        }

        // =================================================
        // FOOTER
        // =================================================

        ListFooterComponent={
          currentData.length > 0 ? (
            <View style={styles.footerMessage}>
              <Heart size={16} color="#B0B0B0" weight="regular" />

              <Text style={styles.footerText}>
                Your favorites,
                always close by.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default FavoritesScreen;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  // =================================================
  // CONTAINER
  // =================================================

  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  // =================================================
  // HEADER
  // =================================================

  header: {
    backgroundColor: '#FFFCF8',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.6,
    fontWeight: '800',
    color: '#FF7A00',
    marginBottom: 5,
  },

  title: {
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '900',
    color: '#111827',
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: '#737B87',
  },

  heartContainer: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#FFF4E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  // =================================================
  // STATS
  // =================================================

  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 18,
    backgroundColor: '#F8F8F9',
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#17171B',
  },

  statLabel: {
    marginTop: 3,
    fontSize: 10,
    color: '#858B95',
    fontWeight: '600',
  },

  statDivider: {
    width: 1,
    height: 27,
    backgroundColor: '#E2E4E7',
  },

  // =================================================
  // TABS
  // =================================================

  tabsWrapper: {
    marginTop: 12,
  },

  // =================================================
  // SECTION
  // =================================================

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#17171B',
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#9298A1',
    fontWeight: '500',
  },

  countBadge: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: '#FFF0E3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FF7A00',
  },

  // =================================================
  // LIST
  // =================================================

  listContent: {
    paddingBottom: 96,
  },

  emptyList: {
    flexGrow: 1,
    paddingBottom: 96,
  },

  // =================================================
  // EMPTY
  // =================================================

  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 40,
  },

  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFF4E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#17171B',
    textAlign: 'center',
  },

  emptyDescription: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: '#858B95',
    textAlign: 'center',
    maxWidth: 310,
  },

  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    paddingHorizontal: 24,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FF7A00',
    elevation: 3,
    shadowColor: '#FF7A00',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.22,
    shadowRadius: 6,
  },

  exploreButtonText: {
    marginLeft: 7,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // =================================================
  // LOADING
  // =================================================

  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF4E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#888F99',
    fontWeight: '500',
  },

  // =================================================
  // FOOTER
  // =================================================

  footerMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 30,
  },

  footerText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#A0A5AD',
    fontWeight: '500',
  },
});
