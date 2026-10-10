import {SafeAreaView} from 'react-native-safe-area-context';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  ForkKnife,
  MagnifyingGlass,
  Warning,
} from 'phosphor-react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '../../../navigation/AppNavigator';

import RestaurantHeader from '../components/restaurant/RestaurantHeader';
import RestaurantSearchBar from '../components/restaurant/RestaurantSearchBar';
import MenuCategory from '../components/restaurant/MenuCategory';
import MenuItemCard from '../components/restaurant/MenuItemCard';
import CartBar from '../components/cart/CartBar';

import {
  getRestaurantFoods,
} from '../../restaurant/services/foodService';

import type {
  Food,
} from '../../restaurant/services/foodService';

// =====================================================
// TYPES
// =====================================================

type Props = NativeStackScreenProps<
  RootStackParamList,
  'RestaurantDetails'
>;

type MenuItem = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  price: number;
  discountedPrice?: number | null;
  category: string;
  isAvailable: boolean;
  rating: number;
  totalReviews: number;
  isPopular: boolean;
};

// =====================================================
// COLORS
// =====================================================

const COLORS = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  cream: '#FFF8F1',
  orange: '#FF7A00',
  orangeLight: '#FFF1E4',
  orangeDark: '#C85C00',
  text: '#171B24',
  muted: '#858B95',
  error: '#D92D20',
};

// =====================================================
// SCREEN
// =====================================================

const RestaurantDetailsScreen: React.FC<Props> = ({route}) => {
  const {restaurant} = route.params;

  // ===================================================
  // RESTAURANT ID
  // ===================================================

  const restaurantData = restaurant as typeof restaurant & {
    _id?: string;
    id?: string;
    coverImage?: string | null;
    image?: string | null;
    imageUrl?: string | null;
    logo?: string | null;
  };

  const restaurantId = String(
    restaurantData._id || restaurantData.id || '',
  );

  // ===================================================
  // NORMALIZE RESTAURANT IMAGE
  // ===================================================

  const restaurantForDisplay = useMemo(() => {
    const imageCandidates = [
      restaurantData.coverImage,
      restaurantData.image,
      restaurantData.imageUrl,
      restaurantData.logo,
    ];

    const imageUrl =
      imageCandidates.find(
        (value): value is string =>
          typeof value === 'string' &&
          value.trim().length > 0,
      )?.trim() || '';

    return {
      ...restaurantData,
      coverImage: imageUrl,
      image: imageUrl,
    } as typeof restaurant;
  }, [
    restaurantData,
  ]);

  // ===================================================
  // STATES
  // ===================================================

  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState('Popular');

  const [searchQuery, setSearchQuery] = useState('');

  // ===================================================
  // LOAD RESTAURANT FOODS
  // ===================================================

  const loadFoods = useCallback(async () => {
    if (!restaurantId) {
      setError('Restaurant ID is missing.');
      setLoading(false);
      return;
    }

    try {
      setError(null);

      const response = await getRestaurantFoods(restaurantId);

      setFoods(Array.isArray(response) ? response : []);
    } catch (loadError: unknown) {
      console.error(
        'FoodE restaurant menu error:',
        loadError,
      );

      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Failed to load the menu. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    void loadFoods();
  }, [loadFoods]);

  // ===================================================
  // REFRESH
  // ===================================================

  const handleRefresh = useCallback(async () => {
    if (!restaurantId) {
      return;
    }

    try {
      setRefreshing(true);
      setError(null);

      const response = await getRestaurantFoods(restaurantId);

      setFoods(Array.isArray(response) ? response : []);
    } catch (refreshError: unknown) {
      console.error(
        'FoodE menu refresh error:',
        refreshError,
      );

      setError(
        refreshError instanceof Error
          ? refreshError.message
          : 'Failed to refresh the menu.',
      );
    } finally {
      setRefreshing(false);
    }
  }, [restaurantId]);

  // ===================================================
  // CATEGORY NAME
  // ===================================================

  const getCategoryName = useCallback(
    (food: Food): string => {
      const category = (food as any).category;

      if (
        typeof category === 'object' &&
        category !== null
      ) {
        return category.name || 'Other';
      }

      return typeof category === 'string'
        ? category
        : 'Other';
    },
    [],
  );

  // ===================================================
  // FORMAT MENU ITEMS
  // ===================================================

  const menuItems = useMemo<MenuItem[]>(() => {
    return foods.map(food => {
      const item = food as any;

      const price = Number(item.price) || 0;
      const rating = Number(item.rating) || 0;

      return {
        id: String(item._id || item.id || ''),
        name: item.name || 'Food Item',
        description: item.description || '',
        image: item.image || null,
        price,
        discountedPrice:
          item.discountedPrice != null
            ? Number(item.discountedPrice)
            : null,
        category: getCategoryName(food),
        isAvailable: item.isAvailable !== false,
        rating,
        totalReviews: Number(item.totalReviews) || 0,
        isPopular: rating >= 4.5,
      };
    });
  }, [foods, getCategoryName]);

  // ===================================================
  // MENU CATEGORIES
  // ===================================================

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        menuItems
          .map(item => item.category)
          .filter(Boolean),
      ),
    );

    return [
      'Popular',
      ...uniqueCategories.filter(
        category => category !== 'Popular',
      ),
    ];
  }, [menuItems]);

  // ===================================================
  // FILTER MENU
  // ===================================================

  const filteredMenu = useMemo(() => {
    let items =
      selectedCategory === 'Popular'
        ? menuItems.filter(item => item.isPopular)
        : menuItems.filter(
            item => item.category === selectedCategory,
          );

    // Show all foods if none are rated as popular.
    if (
      selectedCategory === 'Popular' &&
      items.length === 0
    ) {
      items = menuItems;
    }

    const query = searchQuery.trim().toLowerCase();

    if (query) {
      items = items.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query),
      );
    }

    return items;
  }, [menuItems, selectedCategory, searchQuery]);

  // ===================================================
  // RETRY
  // ===================================================

  const handleRetry = useCallback(() => {
    setLoading(true);
    void loadFoods();
  }, [loadFoods]);

  // ===================================================
  // LOADING SCREEN
  // ===================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.cream}
        />

        <View style={styles.centerContainer}>
          <ActivityIndicator
            size="large"
            color={COLORS.orange}
          />

          <Text style={styles.loadingText}>
            Preparing the menu...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ===================================================
  // ERROR SCREEN
  // ===================================================

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.cream}
        />

        <View style={styles.centerContainer}>
          <Warning size={42} color={COLORS.orange} weight="duotone" />

          <Text style={styles.errorTitle}>
            Couldn't load this menu
          </Text>

          <Text style={styles.errorText}>
            {error}
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={handleRetry}
            style={({pressed}) => [
              styles.retryButton,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.retryButtonText}>
              Try again
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ===================================================
  // MAIN SCREEN
  // ===================================================

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <View style={styles.container}>
        <FlatList
          data={filteredMenu}
          keyExtractor={(item, index) =>
            item.id || `food-${index}`
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}

          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.orange]}
              tintColor={COLORS.orange}
            />
          }

          // ===========================================
          // FOOD ITEM
          // ===========================================

          renderItem={({item}) => (
            <View style={styles.foodCardWrap}>
              <MenuItemCard
                item={item as any}
                onPress={food =>
                  console.log('Food pressed:', food.name)
                }
              />
            </View>
          )}

          // ===========================================
          // SCREEN HEADER
          // ===========================================

          ListHeaderComponent={
            <View>
              {/* RESTAURANT COVER + BACK BUTTON */}

              <View style={styles.heroArea}>
                <RestaurantHeader
                  restaurant={restaurantForDisplay}
                />
              </View>

              {/* MENU SECTION */}

              <View style={styles.menuSection}>
                <View style={styles.sectionHeadingRow}>
                  <View>
                    <Text style={styles.eyebrow}>
                      FRESHLY MADE FOR YOU
                    </Text>

                    <Text style={styles.menuTitle}>
                      Explore menu
                    </Text>
                  </View>

                  <View style={styles.itemCountPill}>
                    <Text style={styles.itemCountText}>
                      {menuItems.length}{' '}
                      {menuItems.length === 1
                        ? 'item'
                        : 'items'}
                    </Text>
                  </View>
                </View>

                {/* SEARCH */}

                <View style={styles.searchWrap}>
                  <RestaurantSearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>

                {/* CATEGORIES */}

                {categories.length > 0 && (
                  <View style={styles.categoryWrap}>
                    <MenuCategory
                      categories={categories}
                      onCategorySelect={setSelectedCategory}
                    />
                  </View>
                )}
              </View>

              {/* RESULTS HEADER */}

              {menuItems.length > 0 && (
                <View style={styles.resultsHeading}>
                  <Text style={styles.resultsTitle}>
                    {searchQuery.trim()
                      ? 'Search results'
                      : selectedCategory === 'Popular'
                        ? 'Popular picks'
                        : selectedCategory}
                  </Text>

                  <Text style={styles.resultsCount}>
                    {filteredMenu.length}{' '}
                    {filteredMenu.length === 1
                      ? 'dish'
                      : 'dishes'}
                  </Text>
                </View>
              )}
            </View>
          }

          // ===========================================
          // EMPTY MENU
          // ===========================================

          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIllustration}>
                {menuItems.length === 0 ? (
                  <ForkKnife
                    size={34}
                    color={COLORS.orange}
                    weight="duotone"
                  />
                ) : (
                  <MagnifyingGlass
                    size={34}
                    color={COLORS.orange}
                    weight="duotone"
                  />
                )}
              </View>

              <Text style={styles.emptyTitle}>
                {menuItems.length === 0
                  ? 'Menu coming soon'
                  : 'No dishes found'}
              </Text>

              <Text style={styles.emptyText}>
                {menuItems.length === 0
                  ? "This restaurant hasn't added any food items yet. Check back soon!"
                  : 'Try another category or search for something else.'}
              </Text>
            </View>
          }
        />

        {/* CART BAR */}

        <CartBar bottomOffset={16} />
      </View>
    </SafeAreaView>
  );
};

export default RestaurantDetailsScreen;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  listContent: {
    paddingBottom: 170,
  },

  heroArea: {
    backgroundColor: COLORS.cream,
    paddingBottom: 0,
  },



  menuSection: {
    paddingTop: 22,
    paddingBottom: 16,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: '#FFFCF8',
  },

  sectionHeadingRow: {
    paddingHorizontal: 20,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  eyebrow: {
    marginBottom: 5,
    color: COLORS.orange,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  menuTitle: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.6,
  },

  itemCountPill: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.orangeLight,
  },

  itemCountText: {
    color: COLORS.orangeDark,
    fontSize: 12,
    fontWeight: '700',
  },

  searchWrap: {
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  categoryWrap: {
    marginTop: 2,
  },

  resultsHeading: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  resultsTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },

  resultsCount: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
  },

  foodCardWrap: {
    marginHorizontal: 14,
  },

  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: COLORS.cream,
  },

  loadingText: {
    marginTop: 14,
    color: '#555B65',
    fontSize: 14,
    fontWeight: '600',
  },

  errorIcon: {
    marginBottom: 12,
  },

  errorTitle: {
    marginBottom: 8,
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },

  errorText: {
    color: '#777E89',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: COLORS.orange,
  },

  retryButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.8,
  },

  emptyContainer: {
    alignItems: 'center',
    marginHorizontal: 18,
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 26,
    paddingVertical: 34,
    borderRadius: 22,
    backgroundColor: '#FFFCF8',
  },

  emptyIllustration: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderRadius: 38,
    backgroundColor: COLORS.orangeLight,
  },

  emptyIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyText: {
    marginTop: 8,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
