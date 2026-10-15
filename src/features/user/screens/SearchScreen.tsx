import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import { ArrowLeft, MagnifyingGlass, X, Microphone, Clock, Storefront, ForkKnife, Star, CaretRight, Warning } from 'phosphor-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

import {
  searchFoods,
  getAllFoods,
  Food,
} from '../../restaurant/services/foodService';

import {
  getRestaurants,
} from '../services/restaurantService';

import {
  Restaurant,
} from '../components/home/restaurant/restaurantData';
import AsyncImage from '../../../components/images/AsyncImage';

// =====================================================
// TYPES
// =====================================================

type FilterType =
  | 'All'
  | 'Restaurants'
  | 'Foods';

const filters: FilterType[] = [
  'All',
  'Restaurants',
  'Foods',
];

const RECENT_SEARCHES_KEY =
  '@foode_recent_searches';

const MAX_RECENT_SEARCHES = 8;

// Safely read IDs from local and backend restaurant objects.
const getRestaurantId = (restaurant: Restaurant): string | undefined => {
  const value = restaurant as Restaurant & {
    _id?: string;
    backendId?: string;
    id?: string;
  };

  return value._id || value.backendId || value.id;
};

const getRestaurantCuisine = (restaurant: Restaurant): string => {
  const value = restaurant as Restaurant & {
    cuisine?: string | string[];
    cuisines?: string | string[];
  };

  const cuisine = value.cuisine ?? value.cuisines;
  return Array.isArray(cuisine) ? cuisine.join(', ') : cuisine || '';
};

const getRestaurantImage = (restaurant: Restaurant): string | undefined => {
  const value = restaurant as Restaurant & {
    image?: string;
    logo?: string;
    coverImage?: string;
  };

  return value.image || value.coverImage || value.logo;
};

const formatDeliveryTime = (value: unknown): string => {
  if (!value) {
    return '20-30 min';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return `${value} min`;
  }

  if (typeof value === 'object') {
    const time = value as {
      min?: number;
      max?: number;
    };

    if (
      typeof time.min === 'number' &&
      typeof time.max === 'number'
    ) {
      return `${time.min}-${time.max} min`;
    }

    if (typeof time.min === 'number') {
      return `${time.min} min`;
    }

    if (typeof time.max === 'number') {
      return `${time.max} min`;
    }
  }

  return '20-30 min';
};

// =====================================================
// SEARCH SCREEN
// =====================================================

const SearchScreen = () => {
  const navigation = useNavigation<any>();

  // ===================================================
  // STATES
  // ===================================================

  const [query, setQuery] = useState('');

  const [selectedFilter, setSelectedFilter] =
    useState<FilterType>('All');

  const [restaurants, setRestaurants] =
    useState<Restaurant[]>([]);

  const [allFoods, setAllFoods] =
    useState<Food[]>([]);

  const [foods, setFoods] =
    useState<Food[]>([]);

  const [loadingFoods, setLoadingFoods] =
    useState(true);

  const [searchingFoods, setSearchingFoods] =
    useState(false);

  const [restaurantLoading, setRestaurantLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [recentSearches, setRecentSearches] =
    useState<string[]>([]);

  // ===================================================
  // LOAD RECENT SEARCHES
  // ===================================================

  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        const stored =
          await AsyncStorage.getItem(
            RECENT_SEARCHES_KEY,
          );

        if (stored) {
          const parsed =
            JSON.parse(stored);

          if (Array.isArray(parsed)) {
            setRecentSearches(parsed);
          }
        }
      } catch (error) {
        console.log(
          'Load recent searches error:',
          error,
        );
      }
    };

    loadRecentSearches();
  }, []);

  // ===================================================
  // LOAD RESTAURANTS
  // ===================================================

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setRestaurantLoading(true);

        const data =
          await getRestaurants();

        if (Array.isArray(data)) {
          setRestaurants(
            data as unknown as Restaurant[],
          );
        } else {
          setRestaurants([]);
        }
      } catch (error) {
        console.log(
          'Search restaurant error:',
          error,
        );

        setRestaurants([]);
      } finally {
        setRestaurantLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  // ===================================================
  // LOAD ALL FOODS
  // ===================================================

  useEffect(() => {
    const loadAllFoods = async () => {
      try {
        setLoadingFoods(true);

        const data =
          await getAllFoods();

        if (Array.isArray(data)) {
          setAllFoods(data);
        } else {
          setAllFoods([]);
        }
      } catch (error) {
        console.log(
          'Search all foods error:',
          error,
        );

        setAllFoods([]);
      } finally {
        setLoadingFoods(false);
      }
    };

    loadAllFoods();
  }, []);

  // ===================================================
  // SAVE RECENT SEARCH
  // ===================================================

  const saveRecentSearch = async (
    search: string,
  ) => {
    const trimmed =
      search.trim();

    if (!trimmed) {
      return;
    }

    try {
      const filtered =
        recentSearches.filter(
          item =>
            item.toLowerCase() !==
            trimmed.toLowerCase(),
        );

      const updated = [
        trimmed,
        ...filtered,
      ].slice(
        0,
        MAX_RECENT_SEARCHES,
      );

      setRecentSearches(updated);

      await AsyncStorage.setItem(
        RECENT_SEARCHES_KEY,
        JSON.stringify(updated),
      );
    } catch (error) {
      console.log(
        'Save recent search error:',
        error,
      );
    }
  };

  // ===================================================
  // DELETE RECENT SEARCH
  // ===================================================

  const deleteRecentSearch = async (
    search: string,
  ) => {
    try {
      const updated =
        recentSearches.filter(
          item =>
            item.toLowerCase() !==
            search.toLowerCase(),
        );

      setRecentSearches(updated);

      await AsyncStorage.setItem(
        RECENT_SEARCHES_KEY,
        JSON.stringify(updated),
      );
    } catch (error) {
      console.log(
        'Delete recent search error:',
        error,
      );
    }
  };

  // ===================================================
  // CLEAR ALL RECENT SEARCHES
  // ===================================================

  const clearRecentSearches = async () => {
    try {
      setRecentSearches([]);

      await AsyncStorage.removeItem(
        RECENT_SEARCHES_KEY,
      );
    } catch (error) {
      console.log(
        'Clear recent searches error:',
        error,
      );
    }
  };

  // ===================================================
  // SEARCH FOOD WHEN USER TYPES
  // ===================================================

  useEffect(() => {
    const trimmedQuery =
      query.trim();

    // No search text
    if (!trimmedQuery) {
      setFoods([]);
      setSearchingFoods(false);
      setError(null);
      return;
    }

    // Restaurants filter does not need food search
    if (
      selectedFilter ===
      'Restaurants'
    ) {
      setFoods([]);
      setSearchingFoods(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(
      async () => {
        try {
          setSearchingFoods(true);
          setError(null);

          const result =
            await searchFoods(
              trimmedQuery,
            );

          if (!cancelled) {
            setFoods(
              Array.isArray(result)
                ? result
                : [],
            );
          }
        } catch (error: any) {
          if (!cancelled) {
            console.log(
              'Search food error:',
              error,
            );

            setFoods([]);

            setError(
              error?.message ||
                'Unable to search foods.',
            );
          }
        } finally {
          if (!cancelled) {
            setSearchingFoods(false);
          }
        }
      },
      350,
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    query,
    selectedFilter,
  ]);

  // ===================================================
  // FILTER RESTAURANTS
  // ===================================================

  const filteredRestaurants =
    useMemo(() => {
      const search =
        query.trim().toLowerCase();

      // Empty search → show all restaurants
      if (!search) {
        return restaurants;
      }

      return restaurants.filter(
        restaurant => {
          const name =
            String(
              restaurant.name || '',
            ).toLowerCase();

          const cuisines =
            getRestaurantCuisine(restaurant).toLowerCase();

          return (
            name.includes(search) ||
            cuisines.includes(search)
          );
        },
      );
    }, [
      restaurants,
      query,
    ]);

  // ===================================================
  // FILTER FOODS
  // ===================================================

  const filteredFoods =
    useMemo(() => {
      const search =
        query.trim().toLowerCase();

      // Empty search → show all foods
      if (!search) {
        return allFoods;
      }

      // When searching, use API results
      return foods;
    }, [
      allFoods,
      foods,
      query,
    ]);

  // ===================================================
  // DISPLAYED RESTAURANTS
  // ===================================================

  const displayedRestaurants =
    useMemo(() => {
      if (
        selectedFilter ===
        'Foods'
      ) {
        return [];
      }

      return filteredRestaurants;
    }, [
      selectedFilter,
      filteredRestaurants,
    ]);

  // ===================================================
  // DISPLAYED FOODS
  // ===================================================

  const displayedFoods =
    useMemo(() => {
      if (
        selectedFilter ===
        'Restaurants'
      ) {
        return [];
      }

      return filteredFoods;
    }, [
      selectedFilter,
      filteredFoods,
    ]);

  // ===================================================
  // TOTAL RESULTS
  // ===================================================

  const totalResults =
    useMemo(() => {
      return (
        displayedRestaurants.length +
        displayedFoods.length
      );
    }, [
      displayedRestaurants,
      displayedFoods,
    ]);

  // ===================================================
  // SHOULD SHOW LOADING
  // ===================================================

  const showLoading =
    restaurantLoading ||
    loadingFoods ||
    searchingFoods;

  // ===================================================
  // RESTAURANT PRESS
  // ===================================================

  const handleRestaurantPress = async (
    restaurant: Restaurant,
  ) => {
    await saveRecentSearch(
      restaurant.name,
    );

    navigation.navigate(
      'RestaurantDetails',
      {
        restaurant,
      },
    );
  };

  // ===================================================
  // FOOD PRESS
  // ===================================================

  const handleFoodPress = async (
    food: Food,
  ) => {
    await saveRecentSearch(
      food.name,
    );

    const restaurant = (food as any).restaurant;
    if (restaurant && typeof restaurant === 'object') {
      navigation.navigate('RestaurantDetails', {restaurant});
      return;
    }
    const restaurantId = (food as any).restaurantId || (food as any).restaurantID;
    if (restaurantId) {
      navigation.navigate('RestaurantDetails', {restaurantId});
    }
  };

  // ===================================================
  // FILTER CHIP
  // ===================================================

  const renderFilter = (
    filter: FilterType,
  ) => {
    const active =
      selectedFilter === filter;

    return (
      <TouchableOpacity
        key={filter}
        activeOpacity={0.8}
        onPress={() =>
          setSelectedFilter(
            filter,
          )
        }
        style={[
          styles.filterChip,
          active &&
            styles.activeFilterChip,
        ]}>
        <Text
          style={[
            styles.filterText,
            active &&
              styles.activeFilterText,
          ]}>
          {filter}
        </Text>
      </TouchableOpacity>
    );
  };

  // ===================================================
  // RECENT SEARCH
  // ===================================================

  const renderRecent = ({
    item,
  }: {
    item: string;
  }) => (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => {
        setQuery(item);
        setSelectedFilter('All');
      }}
      style={styles.recentItem}>
      <View
        style={styles.recentIcon}>
        <Clock size={18} color="#777777" weight="regular" />
      </View>

      <Text
        style={styles.recentText}
        numberOfLines={1}>
        {item}
      </Text>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() =>
          deleteRecentSearch(item)
        }
        style={styles.recentDelete}>
        <X size={17} color="#AAAAAA" weight="regular" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // ===================================================
  // RESTAURANT CARD
  // ===================================================

  const renderRestaurant = ({
    item,
  }: {
    item: Restaurant;
  }) => (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() =>
        handleRestaurantPress(item)
      }
      style={styles.resultCard}>
      <View
        style={styles.imageWrapper}>
        <AsyncImage
          source={getRestaurantImage(item)}
          style={styles.resultImage}
          kind="restaurant"
        />

        <View
          style={styles.imageRating}>
          <Star size={11} color="#FFFFFF" weight="fill" />

          <Text
            style={
              styles.imageRatingText
            }>
            {item.rating || '4.0'}
          </Text>
        </View>
      </View>

      <View
        style={styles.resultContent}>
        <Text
          style={styles.resultName}
          numberOfLines={1}>
          {item.name}
        </Text>

        <Text
          style={styles.resultSubtitle}
          numberOfLines={1}>
          {getRestaurantCuisine(item) ||
            'Restaurant'}
        </Text>

        <View
          style={styles.resultMeta}>
          <Clock size={13} color="#777777" weight="regular" />

          <Text
            style={styles.metaText}>
            {formatDeliveryTime(
              item.deliveryTime,
            )}
          </Text>
        </View>
      </View>

      <CaretRight size={19} color="#B0B0B0" weight="bold" />
    </TouchableOpacity>
  );

  // ===================================================
  // FOOD CARD
  // ===================================================

  const renderFood = ({
    item,
  }: {
    item: Food;
  }) => {
    const restaurant =
      item.restaurant;

    let restaurantName =
      'Restaurant';

    if (
      restaurant &&
      typeof restaurant ===
        'object'
    ) {
      restaurantName =
        restaurant.name;
    } else {
      const found =
        restaurants.find(
          rest => getRestaurantId(rest) === String(restaurant),
        );

      restaurantName =
        found?.name ||
        'Restaurant';
    }

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() =>
          handleFoodPress(item)
        }
        style={styles.resultCard}>
        <View
          style={styles.imageWrapper}>
          <AsyncImage
            source={item.image}
            style={styles.resultImage}
            kind="food"
          />

          <View
            style={[
              styles.foodIndicator,
              {
                borderColor:
                  item.isVegetarian
                    ? '#16A34A'
                    : '#DC2626',
              },
            ]}>
            <View
              style={[
                styles.foodIndicatorDot,
                {
                  backgroundColor:
                    item.isVegetarian
                      ? '#16A34A'
                      : '#DC2626',
                },
              ]}
            />
          </View>
        </View>

        <View
          style={styles.resultContent}>
          <Text
            style={styles.resultName}
            numberOfLines={1}>
            {item.name}
          </Text>

          <Text
            style={styles.resultSubtitle}
            numberOfLines={1}>
            {restaurantName}
          </Text>

          <View
            style={styles.resultMeta}>
            {item.rating !==
              undefined && (
              <>
                <Star size={13} color="#F59E0B" weight="fill" />

                <Text
                  style={styles.metaText}>
                  {item.rating}
                </Text>

                <Text
                  style={styles.metaDot}>
                  •
                </Text>
              </>
            )}

            <Text
              style={styles.priceText}>
              ₹
              {item.discountedPrice ??
                item.price}
            </Text>
          </View>
        </View>

        <CaretRight size={19} color="#B0B0B0" weight="bold" />
      </TouchableOpacity>
    );
  };

  // ===================================================
  // EMPTY SEARCH RESULT
  // ===================================================

  const renderEmptyResult = () => {
    // Don't show empty while initial data loads
    if (showLoading) {
      return null;
    }

    if (totalResults > 0) {
      return null;
    }

    const filterText =
      selectedFilter === 'All'
        ? 'foods or restaurants'
        : selectedFilter.toLowerCase();

    if (query.trim()) {
      return (
        <View
          style={styles.emptyContainer}>
          <View
            style={styles.emptyIcon}>
            <MagnifyingGlass size={30} color="#FF7A00" weight="regular" />
          </View>

          <Text
            style={styles.emptyTitle}>
            No results found
          </Text>

          <Text
            style={styles.emptyText}>
            We couldn't find any{' '}
            {filterText} matching
            "{query}".
          </Text>

          <Text
            style={styles.emptyHint}>
            Try another search.
          </Text>
        </View>
      );
    }

    return (
      <View
        style={styles.emptyContainer}>
        <View
          style={styles.emptyIcon}>
          {selectedFilter === 'Restaurants' ? (
            <Storefront size={30} color="#FF7A00" weight="duotone" />
          ) : selectedFilter === 'Foods' ? (
            <ForkKnife size={30} color="#FF7A00" weight="duotone" />
          ) : (
            <MagnifyingGlass size={30} color="#FF7A00" weight="regular" />
          )}
        </View>

        <Text
          style={styles.emptyTitle}>
          No {filterText} available
        </Text>

        <Text
          style={styles.emptyHint}>
          Try another category.
        </Text>
      </View>
    );
  };

  // ===================================================
  // SCREEN
  // ===================================================

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#FF7A00" barStyle="light-content" hidden={false} translucent={false} />
      <FlatList
        data={[]}
        keyExtractor={() =>
          'search-screen'
        }
        showsVerticalScrollIndicator={
          false
        }
        renderItem={null}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            {/* =======================================
                SEARCH BAR
            ======================================= */}

            <View style={styles.searchRow}>
              {navigation.canGoBack() && (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => navigation.goBack()}
                  style={styles.backButton}>
                  <ArrowLeft size={22} color="#1E232C" weight="bold" />
                </TouchableOpacity>
              )}

              <View
                style={[styles.searchContainer, navigation.canGoBack() && {flex: 1}]}>
                <MagnifyingGlass size={21} color="#888888" weight="regular" />

              <TextInput
                autoFocus
                value={query}
                onChangeText={setQuery}
                placeholder="Search food, restaurants..."
                placeholderTextColor="#999999"
                returnKeyType="search"
                style={styles.input}
                onSubmitEditing={() =>
                  saveRecentSearch(query)
                }
              />

              {query.length > 0 && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    setQuery('')
                  }
                  style={styles.iconButton}>
                  <X size={21} color="#999999" weight="bold" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {}}
                style={styles.iconButton}>
                <Microphone size={21} color="#FF7A00" weight="regular" />
              </TouchableOpacity>
            </View>
          </View>

          {/* =======================================
              FILTERS
          ======================================= */}

            <FlatList
              data={filters}
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              keyExtractor={item =>
                item
              }
              contentContainerStyle={
                styles.filterContainer
              }
              renderItem={({
                item,
              }) =>
                renderFilter(item)
              }
            />

            {/* =======================================
                RECENT SEARCHES
            ======================================= */}

            {!query.trim() &&
              recentSearches.length >
                0 && (
                <>
                  <View
                    style={
                      styles.sectionHeader
                    }>
                    <Text
                      style={
                        styles.sectionTitle
                      }>
                      Recent Searches
                    </Text>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={
                        clearRecentSearches
                      }>
                      <Text
                        style={
                          styles.clearText
                        }>
                        Clear all
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <FlatList
                    data={recentSearches}
                    keyExtractor={item =>
                      item
                    }
                    scrollEnabled={false}
                    renderItem={
                      renderRecent
                    }
                  />
                </>
              )}

            {/* =======================================
                INITIAL MESSAGE
            ======================================= */}

            {!query.trim() &&
              recentSearches.length ===
                0 && (
                <View
                  style={
                    styles.startSearch
                  }>
                  <View
                    style={
                      styles.startSearchIcon
                    }>
                    <MagnifyingGlass size={32} color="#FF7A00" weight="regular" />
                  </View>

                  <Text
                    style={
                      styles.startSearchTitle
                    }>
                    What are you craving?
                  </Text>

                  <Text
                    style={
                      styles.startSearchText
                    }>
                    Use the filters below
                    to browse foods and
                    restaurants.
                  </Text>
                </View>
              )}

            {/* =======================================
                LOADING
            ======================================= */}

            {showLoading && (
              <View
                style={
                  styles.loadingContainer
                }>
                <ActivityIndicator
                  size="small"
                  color="#FF7A00"
                />

                <Text
                  style={
                    styles.loadingText
                  }>
                  Loading...
                </Text>
              </View>
            )}

            {/* =======================================
                RESULTS
            ======================================= */}

            {!showLoading && (
              <>
                {totalResults > 0 && (
                  <View
                    style={
                      styles.resultsHeader
                    }>
                    <Text
                      style={
                        styles.sectionTitle
                      }>
                      {query.trim()
                        ? 'Search Results'
                        : selectedFilter ===
                          'All'
                        ? 'Explore'
                        : selectedFilter}
                    </Text>

                    <Text
                      style={
                        styles.resultCount
                      }>
                      {totalResults}{' '}
                      result
                      {totalResults !==
                      1
                        ? 's'
                        : ''}
                    </Text>
                  </View>
                )}

                {/* RESTAURANTS */}

                {displayedRestaurants.length >
                  0 && (
                  <>
                    {selectedFilter ===
                      'All' && (
                      <Text
                        style={
                          styles.subSectionTitle
                        }>
                        Restaurants
                      </Text>
                    )}

                    {displayedRestaurants.map(
                      restaurant => (
                        <View
                          key={
                            getRestaurantId(restaurant) || restaurant.name
                          }>
                          {renderRestaurant(
                            {
                              item:
                                restaurant,
                            },
                          )}
                        </View>
                      ),
                    )}
                  </>
                )}

                {/* FOODS */}

                {displayedFoods.length >
                  0 && (
                  <>
                    {selectedFilter ===
                      'All' && (
                      <Text
                        style={
                          styles.subSectionTitle
                        }>
                        Foods
                      </Text>
                    )}

                    {displayedFoods.map(
                      food => (
                        <View
                          key={
                            food._id
                          }>
                          {renderFood({
                            item: food,
                          })}
                        </View>
                      ),
                    )}
                  </>
                )}

                {/* ERROR */}

                {error && (
                  <View
                    style={
                      styles.errorContainer
                    }>
                    <Warning size={21} color="#DC2626" weight="regular" />

                    <Text
                      style={
                        styles.errorText
                      }>
                      {error}
                    </Text>
                  </View>
                )}

                {/* EMPTY */}

                {renderEmptyResult()}
              </>
            )}
          </>
        }
        ListFooterComponent={
          <View
            style={
              styles.bottomSpacing
            }
          />
        }
      />
    </SafeAreaView>
  );
};

export default SearchScreen;

// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F7F8FA',
    },

    // ===============================================
    // SEARCH
    // ===============================================

    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginTop: 10,
    },

    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },

    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      height: 52,
      borderRadius: 18,
      backgroundColor: '#FFFCF8',
      borderWidth: 1,
      borderColor: '#EEEEEE',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.06,
      shadowRadius: 6,
    },

    input: {
      flex: 1,
      minWidth: 0,
      marginHorizontal: 8,
      paddingVertical: 0,
      fontSize: 15,
      color: '#222222',
      fontWeight: '500',
    },

    iconButton: {
      padding: 4,
      marginLeft: 4,
    },

    // ===============================================
    // FILTERS
    // ===============================================

    filterContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 4,
    },

    filterChip: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 24,
      backgroundColor: '#EEEEF0',
      marginRight: 10,
    },

    activeFilterChip: {
      backgroundColor: '#FF7A00',
      elevation: 2,
    },

    filterText: {
      color: '#555555',
      fontWeight: '600',
      fontSize: 13,
    },

    activeFilterText: {
      color: '#FFFFFF',
    },

    // ===============================================
    // SECTION
    // ===============================================

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 22,
      marginHorizontal: 16,
      marginBottom: 8,
    },

    sectionTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: '#17171B',
    },

    clearText: {
      fontSize: 13,
      color: '#FF7A00',
      fontWeight: '700',
    },

    resultsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 22,
      marginHorizontal: 16,
      marginBottom: 14,
    },

    resultCount: {
      fontSize: 12,
      color: '#888888',
      fontWeight: '600',
    },

    subSectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: '#555555',
      marginHorizontal: 16,
      marginTop: 4,
      marginBottom: 8,
    },

    // ===============================================
    // RECENT
    // ===============================================

    recentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      paddingVertical: 13,
      borderBottomWidth: 1,
      borderBottomColor: '#EEEEEE',
    },

    recentIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: '#F1F1F1',
      alignItems: 'center',
      justifyContent: 'center',
    },

    recentText: {
      flex: 1,
      marginLeft: 12,
      fontSize: 15,
      color: '#444444',
      fontWeight: '500',
    },

    recentDelete: {
      padding: 5,
    },

    // ===============================================
    // START SEARCH
    // ===============================================

    startSearch: {
      alignItems: 'center',
      marginHorizontal: 35,
      marginTop: 36,
      paddingHorizontal: 20,
    },

    startSearchIcon: {
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor: '#FFF4E8',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
    },

    startSearchTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: '#17171B',
    },

    startSearchText: {
      marginTop: 8,
      fontSize: 13,
      lineHeight: 19,
      color: '#888888',
      textAlign: 'center',
    },

    // ===============================================
    // RESULT CARD
    // ===============================================

    resultCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 10,
      borderRadius: 18,
      backgroundColor: '#FFFCF8',
      borderWidth: 1,
      borderColor: '#EEEEEE',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 5,
    },

    imageWrapper: {
      width: 82,
      height: 82,
      borderRadius: 14,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: '#FFF4E8',
      marginRight: 12,
    },

    resultImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },

    imagePlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFF4E8',
    },

    imageRating: {
      position: 'absolute',
      bottom: 5,
      left: 5,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 8,
      backgroundColor: '#22C55E',
    },

    imageRatingText: {
      marginLeft: 3,
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '800',
    },

    // ===============================================
    // FOOD INDICATOR
    // ===============================================

    foodIndicator: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 17,
      height: 17,
      borderRadius: 3,
      borderWidth: 1.5,
      backgroundColor: '#FFFCF8',
      alignItems: 'center',
      justifyContent: 'center',
    },

    foodIndicatorDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },

    // ===============================================
    // RESULT CONTENT
    // ===============================================

    resultContent: {
      flex: 1,
      minWidth: 0,
    },

    resultName: {
      fontSize: 16,
      fontWeight: '800',
      color: '#17171B',
    },

    resultSubtitle: {
      marginTop: 4,
      fontSize: 12,
      color: '#858585',
      fontWeight: '500',
    },

    resultMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },

    metaText: {
      marginLeft: 4,
      fontSize: 12,
      color: '#777777',
      fontWeight: '600',
    },

    metaDot: {
      marginHorizontal: 7,
      fontSize: 12,
      color: '#BBBBBB',
    },

    priceText: {
      fontSize: 13,
      color: '#FF7A00',
      fontWeight: '800',
    },

    // ===============================================
    // LOADING
    // ===============================================

    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 32,
    },

    loadingText: {
      marginTop: 8,
      fontSize: 13,
      color: '#888888',
    },

    // ===============================================
    // EMPTY
    // ===============================================

    emptyContainer: {
      alignItems: 'center',
      marginHorizontal: 30,
      marginTop: 30,
      paddingVertical: 35,
    },

    emptyIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#FFF4E8',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#17171B',
    },

    emptyText: {
      marginTop: 7,
      fontSize: 13,
      color: '#777777',
      textAlign: 'center',
      lineHeight: 19,
    },

    emptyHint: {
      marginTop: 4,
      fontSize: 12,
      color: '#AAAAAA',
      textAlign: 'center',
    },

    // ===============================================
    // ERROR
    // ===============================================

    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginTop: 20,
      padding: 14,
      borderRadius: 14,
      backgroundColor: '#FEF2F2',
    },

    errorText: {
      flex: 1,
      marginLeft: 10,
      fontSize: 13,
      color: '#B91C1C',
      lineHeight: 18,
    },

    // ===============================================
    // BOTTOM
    // ===============================================

    bottomSpacing: {
      height: 88,
    },
  });
