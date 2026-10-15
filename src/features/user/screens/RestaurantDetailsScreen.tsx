
import {SafeAreaView} from 'react-native-safe-area-context';
import React, {
  useCallback,
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
import {useFocusEffect} from '@react-navigation/native';

import {
  ArrowLeft,
  ForkKnife,
  Heart,
  MapPin,
  MagnifyingGlass,
  Star,
  Warning,
} from 'phosphor-react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../navigation/AppNavigator';

import RestaurantSearchBar from '../components/restaurant/RestaurantSearchBar';
import MenuCategory from '../components/restaurant/MenuCategory';
import MenuItemCard from '../components/restaurant/MenuItemCard';
import CartBar from '../components/cart/CartBar';

import {getRestaurantFoods} from '../../restaurant/services/foodService';
import type {Food} from '../../restaurant/services/foodService';
import {useCart} from '../../../context/CartContext';

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

const COLORS = {
  orange: '#FF5A00',
  orangeLight: '#FFF1E4',
  orangeDark: '#C85C00',
  cream: '#FFFCF6',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  text: '#171B24',
  muted: '#858B95',
  error: '#D92D20',
  brown: '#492008',
};

const RestaurantDetailsScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const {restaurant} = route.params;
  const {addItem} = useCart();

  const restaurantData = restaurant as typeof restaurant & {
    _id?: string;
    id?: string;
    name?: string;
    cuisine?: string;
    foodType?: string;
    rating?: number;
    totalReviews?: number;
    reviews?: any[];
    isOpen?: boolean;
    address?: string;
    location?: string | {address?: string; name?: string};
    city?: string;
  };

  const restaurantId = String(
    restaurantData._id || restaurantData.id || '',
  );

  const restaurantName = restaurantData.name || 'Restaurant';

  const cuisine =
    restaurantData.cuisine ||
    restaurantData.foodType ||
    'Freshly prepared food';

  const rating = Number(restaurantData.rating) || 0;

  const reviewCount =
    Number(restaurantData.totalReviews) ||
    (Array.isArray(restaurantData.reviews)
      ? restaurantData.reviews.length
      : 0);

  const locationText =
    typeof restaurantData.location === 'string'
      ? restaurantData.location
      : restaurantData.location?.address ||
        restaurantData.location?.name ||
        restaurantData.address ||
        restaurantData.city ||
        'Location unavailable';

  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState('Popular');

  const [searchQuery, setSearchQuery] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Load restaurant menu
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
      console.error('FoodE restaurant menu error:', loadError);

      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Failed to load the menu. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useFocusEffect(
    useCallback(() => {
      loadFoods();
    }, [loadFoods]),
  );

  // Refresh menu
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
      console.error('FoodE menu refresh error:', refreshError);

      setError(
        refreshError instanceof Error
          ? refreshError.message
          : 'Failed to refresh the menu.',
      );
    } finally {
      setRefreshing(false);
    }
  }, [restaurantId]);

  // Category name
  const getCategoryName = useCallback((food: Food): string => {
    const category = (food as any).category;

    if (typeof category === 'object' && category !== null) {
      return category.name || 'Other';
    }

    return typeof category === 'string' ? category : 'Other';
  }, []);

  // Format menu items
  const menuItems = useMemo<MenuItem[]>(() => {
    return foods.map(food => {
      const item = food as any;
      const itemRating = Number(item.rating) || 0;

      return {
        id: String(item._id || item.id || ''),
        name: item.name || 'Food Item',
        description: item.description || '',
        image: item.image || null,
        price: Number(item.price) || 0,
        discountedPrice:
          item.discountedPrice != null
            ? Number(item.discountedPrice)
            : null,
        category: getCategoryName(food),
        isAvailable: item.isAvailable !== false,
        rating: itemRating,
        totalReviews: Number(item.totalReviews) || 0,
        isPopular: itemRating >= 4.5,
      };
    });
  }, [foods, getCategoryName]);

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

  // Filter menu
  const filteredMenu = useMemo(() => {
    let items =
      selectedCategory === 'Popular'
        ? menuItems.filter(item => item.isPopular)
        : menuItems.filter(
            item => item.category === selectedCategory,
          );

    if (selectedCategory === 'Popular' && items.length === 0) {
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

  const handleRetry = useCallback(() => {
    setLoading(true);
    void loadFoods();
  }, [loadFoods]);

  // Loading screen
  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'left', 'right']}>
        <StatusBar
          backgroundColor={COLORS.orange}
          barStyle="light-content"
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

  // Error screen
  if (error) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'left', 'right']}>
        <StatusBar
          backgroundColor={COLORS.orange}
          barStyle="light-content"
        />

        <View style={styles.centerContainer}>
          <Warning
            size={42}
            color={COLORS.orange}
            weight="duotone"
          />

          <Text style={styles.errorTitle}>
            Couldn't load this menu
          </Text>

          <Text style={styles.errorText}>{error}</Text>

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

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}>
      <StatusBar
        backgroundColor={COLORS.orange}
        barStyle="light-content"
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
          renderItem={({item}) => (
            <View style={styles.foodCardWrap}>
              <MenuItemCard
                item={item as any}
                onPress={async () => {
                  const foodToAdd = foods.find(
                    food =>
                      String(
                        (food as any)._id ||
                          (food as any).id,
                      ) === String(item.id),
                  );

                  if (!foodToAdd || !item.isAvailable) {
                    return;
                  }

                  try {
                    await addItem(
                      {
                        ...foodToAdd,
                        restaurantName,
                        restaurant:
                          (foodToAdd as any).restaurant ||
                          restaurantData,
                      } as Food,
                      1,
                    );
                  } catch (addError) {
                    console.error(
                      'FoodE add-to-cart error:',
                      addError,
                    );
                  }
                }}
              />
            </View>
          )}
          ListHeaderComponent={
            <View>
              {/* Plain orange background, no restaurant image */}
              <View style={styles.heroArea}>
                <View style={styles.orangeBackground}>
                  <View style={styles.decorativeCircle} />
                  <View style={styles.decorativeCircleSmall} />
                  <View style={styles.decorativeDot} />

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                    onPress={() => navigation.goBack()}
                    style={({pressed}) => [
                      styles.headerButton,
                      styles.backButton,
                      pressed && styles.pressed,
                    ]}>
                    <ArrowLeft
                      size={25}
                      color={COLORS.text}
                      weight="bold"
                    />
                  </Pressable>

                  <View style={styles.brandMark}>
                    <ForkKnife
                      size={23}
                      color={COLORS.orange}
                      weight="bold"
                    />
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      isFavorite
                        ? 'Remove from favorites'
                        : 'Add to favorites'
                    }
                    onPress={() =>
                      setIsFavorite(previous => !previous)
                    }
                    style={({pressed}) => [
                      styles.headerButton,
                      styles.favoriteButton,
                      pressed && styles.pressed,
                    ]}>
                    <Heart
                      size={25}
                      color={
                        isFavorite
                          ? COLORS.orange
                          : COLORS.text
                      }
                      weight={isFavorite ? 'fill' : 'regular'}
                    />
                  </Pressable>
                </View>

                {/* Restaurant information */}
                <View style={styles.restaurantInfoCard}>
                  <Text
                    style={styles.restaurantName}
                    numberOfLines={2}>
                    {restaurantName}
                  </Text>

                  <Text
                    style={styles.restaurantCuisine}
                    numberOfLines={1}>
                    {cuisine}
                  </Text>

                  <View style={styles.badgeRow}>
                    <View style={styles.ratingBadge}>
                      <Star
                        size={17}
                        color="#FFFFFF"
                        weight="fill"
                      />

                      <Text style={styles.badgeText}>
                        {rating.toFixed(1)} · {reviewCount}{' '}
                        {reviewCount === 1 ? 'review' : 'reviews'}
                      </Text>
                    </View>

                    <View style={styles.openBadge}>
                      {/* Simple View dot avoids Circle import errors */}
                      <View style={styles.statusDot} />

                      <Text style={styles.badgeText}>
                        {restaurantData.isOpen === false
                          ? 'Closed'
                          : 'Open'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.locationRow}>
                    <MapPin
                      size={20}
                      color="#FFD1A8"
                      weight="fill"
                    />

                    <Text
                      style={styles.locationText}
                      numberOfLines={2}>
                      {locationText}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Explore menu */}
              <View style={styles.menuSection}>
                <View style={styles.sectionHeadingRow}>
                  <View style={styles.headingTextContainer}>
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
                      {menuItems.length === 1 ? 'item' : 'items'}
                    </Text>
                  </View>
                </View>

                <View style={styles.searchWrap}>
                  <RestaurantSearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>

                {categories.length > 0 && (
                  <View style={styles.categoryWrap}>
                    <MenuCategory
                      categories={categories}
                      onCategorySelect={setSelectedCategory}
                    />
                  </View>
                )}
              </View>

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

        <CartBar bottomOffset={16} />
      </View>
    </SafeAreaView>
  );
};

export default RestaurantDetailsScreen;

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
  },

  orangeBackground: {
    height: 215,
    backgroundColor: COLORS.orange,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  decorativeCircle: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    top: -105,
    right: -50,
  },

  decorativeCircleSmall: {
    position: 'absolute',
    width: 105,
    height: 105,
    borderRadius: 53,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    bottom: -50,
    left: -35,
  },

  decorativeDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.35)',
    left: '20%',
    top: '46%',
  },

  headerButton: {
    position: 'absolute',
    top: 25,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },

  backButton: {
    left: 20,
  },

  favoriteButton: {
    right: 20,
  },

  brandMark: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  restaurantInfoCard: {
    marginTop: -72,
    marginHorizontal: 5,
    paddingHorizontal: 22,
    paddingTop: 23,
    paddingBottom: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    backgroundColor: COLORS.brown,
    elevation: 0,
  },

  restaurantName: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  restaurantCuisine: {
    color: '#FFE0C7',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 7,
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },

  ratingBadge: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 17,
    backgroundColor: COLORS.orange,
  },

  openBadge: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 17,
    backgroundColor: COLORS.orange,
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 17,
  },

  locationText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },

  menuSection: {
    paddingTop: 24,
    paddingBottom: 17,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: COLORS.cream,
  },

  sectionHeadingRow: {
    paddingHorizontal: 20,
    marginBottom: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  headingTextContainer: {
    flex: 1,
  },

  eyebrow: {
    marginBottom: 6,
    color: COLORS.orange,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  menuTitle: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.6,
  },

  itemCountPill: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: COLORS.orangeLight,
  },

  itemCountText: {
    color: COLORS.orangeDark,
    fontSize: 12,
    fontWeight: '800',
  },

  searchWrap: {
    paddingHorizontal: 15,
    marginBottom: 12,
  },

  categoryWrap: {
    marginTop: 2,
  },

  resultsHeading: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  resultsTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '800',
  },

  resultsCount: {
    color: COLORS.muted,
    fontSize: 13,
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

  errorTitle: {
    marginTop: 15,
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
