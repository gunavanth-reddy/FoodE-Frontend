import React, {useMemo, useState} from 'react';

import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  Heart,
  Compass,
} from 'phosphor-react-native';
import AppBackButton from '../../../components/buttons/AppBackButton';

import {useFocusEffect, useNavigation} from '@react-navigation/native';

import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {RootStackParamList} from '../../../navigation/AppNavigator';

import FavoriteTabs, {FavoriteTab} from '../components/favorites/FavoriteTabs';
import FavoritesHeaderMark from '../components/favorites/FavoritesHeaderMark';
import EmptyFavorites from '../components/favorites/EmptyFavorites';
import RestaurantCard from '../components/home/restaurant/RestaurantCard';

import FoodCard from '../components/home/food/FoodCard';

import {Restaurant} from '../components/home/restaurant/restaurantData';

import {Food} from '../../restaurant/services/foodService';

import {useFavorites} from '../../../context/FavoritesContext';

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
    refreshFavorites,
    loading,
  } = useFavorites();
  const [activeTab, setActiveTab] = useState<FavoriteTab>('foods');

  useFocusEffect(
    React.useCallback(() => {
      refreshFavorites().catch(error => {
        console.warn('Unable to refresh favorites:', error);
      });
    }, [refreshFavorites]),
  );

  // ===================================================
  // TOTAL FAVORITES
  // ===================================================

  const totalFavorites =
    favoriteRestaurants.length +
    favoriteFoods.length;

  const foodGroups = useMemo(() => {
    const groups = new Map<string, {id: string; name: string; foods: Food[]}>();

    favoriteFoods.forEach(food => {
      const restaurant = (food as any).restaurant;
      const restaurantId = typeof restaurant === 'object' && restaurant
        ? String(restaurant._id || '')
        : String(restaurant || (food as any).restaurantId || '');
      const key = restaurantId || 'unknown-restaurant';
      const name = typeof restaurant === 'object' && restaurant
        ? restaurant.name || 'Restaurant'
        : 'Restaurant';
      const group = groups.get(key) || {id: key, name, foods: [] as Food[]};
      group.foods.push(food);
      groups.set(key, group);
    });

    return Array.from(groups.values());
  }, [favoriteFoods]);

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
    const restaurant = (food as any).restaurant;
    if (restaurant && typeof restaurant === 'object') {
      navigation.navigate('RestaurantDetails', {
        restaurant,
        targetFoodId: String((food as any)._id || (food as any).id || ''),
      });
      return;
    }
    const restaurantId = (food as any).restaurantId || (food as any).restaurantID;
    if (restaurantId) {
      navigation.navigate('RestaurantDetails', {
        restaurantId,
        targetFoodId: String((food as any)._id || (food as any).id || ''),
      });
    }
  };

  // ===================================================
  // REMOVE RESTAURANT
  // ===================================================

  const handleRemoveRestaurant = async (restaurant: Restaurant) => {
    await removeRestaurantFavorite(
      restaurant._id || restaurant.backendId || restaurant.id || '',
    );
  };

  // ===================================================
  // REMOVE FOOD
  // ===================================================

  const handleRemoveFood = async (food: Food) => {
    await removeFoodFavorite(food._id);
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={['top', 'left', 'right']}>
        <StatusBar backgroundColor="#FF7A00" barStyle="light-content" hidden={false} translucent={false} />
        <View style={styles.loadingScreen}>
          <FavoritesHeaderMark size={30} containerStyle={styles.loadingIcon} />

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
      <StatusBar backgroundColor="#FF7A00" barStyle="light-content" hidden={false} translucent={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {navigation.canGoBack() && (
              <AppBackButton />
            )}

            <View style={styles.headerTextContainer}>
              <Text style={styles.eyebrow}>YOUR COLLECTION</Text>
              <Text style={styles.title}>Favorites</Text>
              <Text style={styles.subtitle}>
                Everything you love, all in one place.
              </Text>
            </View>

            <FavoritesHeaderMark />
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {favoriteRestaurants.length}
              </Text>
              <Text style={styles.statLabel}>Restaurants</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{favoriteFoods.length}</Text>
              <Text style={styles.statLabel}>Foods</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalFavorites}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
              </View>
        </View>

        <View style={styles.tabsWrapper}>
          <FavoriteTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              {activeTab === 'foods' ? 'Favorite Foods' : 'Favorite Restaurants'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {activeTab === 'foods'
                ? `${favoriteFoods.length} saved ${favoriteFoods.length === 1 ? 'food' : 'foods'}`
                : `${favoriteRestaurants.length} saved ${favoriteRestaurants.length === 1 ? 'restaurant' : 'restaurants'}`}
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {activeTab === 'foods' ? favoriteFoods.length : favoriteRestaurants.length}
            </Text>
          </View>
        </View>

        {activeTab === 'foods' ? (
          foodGroups.length ? (
            foodGroups.map(group => (
              <View key={group.id} style={styles.foodRestaurantGroup}>
                <View style={styles.restaurantHeading}>
                  <Text style={styles.restaurantHeadingText} numberOfLines={1}>
                    {group.name}
                  </Text>
                  <Text style={styles.restaurantHeadingCount}>
                    {group.foods.length} {group.foods.length === 1 ? 'item' : 'items'}
                  </Text>
                </View>
                <FlatList<Food>
                  horizontal
                  data={group.foods}
                  keyExtractor={item => item._id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                  renderItem={({item}) => (
                    <FoodCard
                      food={item}
                      onPress={() => handleFoodPress(item)}
                      showAddButton={false}
                      isFavorite
                      onFavoritePress={() => handleRemoveFood(item)}
                      showFavorite
                    />
                  )}
                />
              </View>
            ))
          ) : (
            <EmptyFavorites />
          )
        ) : favoriteRestaurants.length ? (
          <View style={styles.restaurantList}>
            {favoriteRestaurants.map(restaurant => (
              <RestaurantCard
                key={restaurant._id}
                restaurant={restaurant}
                onPress={() => handleRestaurantPress(restaurant)}
                isFavorite
                onFavoritePress={() => handleRemoveRestaurant(restaurant)}
              />
            ))}
          </View>
        ) : (
          <EmptyFavorites />
        )}

        {!totalFavorites ? (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.exploreButton}
            onPress={goToHome}>
            <Compass size={18} color="#FFFFFF" weight="fill" />
            <Text style={styles.exploreButtonText}>Explore FoodE</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.footerMessage}>
            <Heart size={16} color="#B0B0B0" weight="regular" />
            <Text style={styles.footerText}>Your favorites, always close by.</Text>
          </View>
        )}
      </ScrollView>
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

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
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

  tabsWrapper: {
    marginTop: 10,
  },

  horizontalList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  foodRestaurantGroup: {
    marginTop: 8,
  },

  restaurantHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 10,
  },

  restaurantHeadingText: {
    flex: 1,
    marginRight: 10,
    fontSize: 15,
    fontWeight: '800',
    color: '#33251D',
  },

  restaurantHeadingCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9298A1',
  },

  restaurantList: {
    marginHorizontal: 16,
  },

  // =================================================
  // LIST
  // =================================================

  listContent: {
    paddingBottom: 96,
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
    marginBottom: 18,
    marginLeft: 0,
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
