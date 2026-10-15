import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Storefront,
  Warning,
} from 'phosphor-react-native';
import {
  CompositeNavigationProp,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import {
  BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import {
  RootStackParamList,
} from '../../../navigation/AppNavigator';
import {
  BottomTabParamList,
} from '../../../navigation/BottomTabNavigator';
import Header from '../components/home/header/Header';
import SearchBar from '../components/home/header/SearchBar';
import BannerCarousel from '../components/home/banner/BannerCarousel';
import CategorySection from '../components/home/category/CategorySection';
import FoodList from '../components/home/food/FoodList';
import {
  Food,
  getAllFoods,
} from '../../restaurant/services/foodService';
import RestaurantList from '../components/home/restaurant/RestaurantList';
import {
  Restaurant,
} from '../components/home/restaurant/restaurantData';
import {
  getRestaurants,
} from '../services/restaurantService';
import AboutFoodE from '../components/home/AboutFoodE';

type NavigationProp =
  CompositeNavigationProp<
    BottomTabNavigationProp<
      BottomTabParamList,
      'Home'
    >,
    NativeStackNavigationProp<
      RootStackParamList
    >
  >;

const HomeScreen: React.FC = () => {
  const navigation =
    useNavigation<NavigationProp>();

  const [
    restaurants,
    setRestaurants,
  ] = useState<Restaurant[]>([]);

  const [
    loadingRestaurants,
    setLoadingRestaurants,
  ] = useState(true);

  const [
    restaurantError,
    setRestaurantError,
  ] = useState<string | null>(null);

  const [
    foods,
    setFoods,
  ] = useState<Food[]>([]);

  const [
    loadingFoods,
    setLoadingFoods,
  ] = useState(true);

  const [
    foodError,
    setFoodError,
  ] = useState<string | null>(null);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const loadRestaurants =
    useCallback(async () => {
      try {
        setRestaurantError(null);

        const data =
          await getRestaurants();

        const formattedRestaurants: Restaurant[] =
          data.map(restaurant => {
            const raw =
              restaurant as Restaurant & {
                coverImage?: unknown;
                logo?: unknown;
                image?: unknown;
                imageUrl?: unknown;
                images?: {
                  coverImage?: unknown;
                  logo?: unknown;
                  image?: unknown;
                };
                cuisine?: unknown;
                cuisines?: unknown;
              };

            const getImageUrl = (
              value: unknown,
            ): string => {
              if (typeof value === 'string') {
                return value.trim();
              }

              if (
                value &&
                typeof value === 'object'
              ) {
                const imageObject =
                  value as {
                    url?: unknown;
                    uri?: unknown;
                  };

                if (
                  typeof imageObject.url ===
                  'string'
                ) {
                  return imageObject.url.trim();
                }

                if (
                  typeof imageObject.uri ===
                  'string'
                ) {
                  return imageObject.uri.trim();
                }
              }

              return '';
            };

            const restaurantImage =
              getImageUrl(
                raw.coverImage,
              ) ||
              getImageUrl(
                raw.images?.coverImage,
              ) ||
              getImageUrl(
                raw.image,
              ) ||
              getImageUrl(
                raw.imageUrl,
              ) ||
              getImageUrl(
                raw.images?.image,
              ) ||
              getImageUrl(
                raw.logo,
              ) ||
              getImageUrl(
                raw.images?.logo,
              );

            const rawCuisine =
              raw.cuisine ??
              raw.cuisines;

            const cuisineText =
              Array.isArray(rawCuisine)
                ? rawCuisine
                    .filter(Boolean)
                    .join(' • ')
                : typeof rawCuisine ===
                  'string'
                ? rawCuisine
                : 'Multi Cuisine';

            return {
              ...restaurant,
              _id: restaurant._id,
              image: restaurantImage,
              coverImage:
                getImageUrl(
                  raw.coverImage,
                ) ||
                getImageUrl(
                  raw.images?.coverImage,
                ) ||
                restaurantImage,
              logo:
                getImageUrl(
                  raw.logo,
                ) ||
                getImageUrl(
                  raw.images?.logo,
                ),
              cuisine: cuisineText,
              cuisines: cuisineText,
              rating:
                typeof restaurant.rating ===
                'number'
                  ? restaurant.rating
                  : 0,
              deliveryTime:
                restaurant.deliveryTime ||
                '20-30 min',
              address:
                restaurant.address ||
                (restaurant as any).location ||
                'SRM AP University, Neerukonda',
              isOpen:
                restaurant.isOpen !== false,
              isActive:
                restaurant.isActive !== false,
            } as Restaurant;
          });

        setRestaurants(
          formattedRestaurants,
        );
      } catch (error: any) {
        console.log(
          'Home restaurant error:',
          error,
        );

        setRestaurantError(
          error?.message ||
          'Unable to load restaurants.',
        );
      } finally {
        setLoadingRestaurants(false);
      }
    }, []);

  const loadFoods =
    useCallback(async () => {
      try {
        setFoodError(null);

        const data =
          await getAllFoods();

        setFoods(data);
      } catch (error: any) {
        console.log(
          'Home food error:',
          error,
        );

        setFoodError(
          error?.message ||
          'Unable to load foods.',
        );
      } finally {
        setLoadingFoods(false);
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      loadRestaurants();
      loadFoods();
    }, [loadRestaurants, loadFoods]),
  );

  const onRefresh =
    useCallback(async () => {
      setRefreshing(true);

      try {
        await Promise.all([
          loadRestaurants(),
          loadFoods(),
        ]);
      } finally {
        setRefreshing(false);
      }
    }, [
      loadRestaurants,
      loadFoods,
    ]);

  const under20Minutes =
    useMemo(() => {
      return foods.filter(
        food =>
          food.isAvailable === true &&
          typeof food.preparationTime ===
            'number' &&
          food.preparationTime <= 20,
      );
    }, [foods]);

  const nonVegPicks =
    useMemo(() => {
      return foods.filter(
        food =>
          food.isAvailable === true &&
          (
            food.foodType === 'non-veg' ||
            (
              food.foodType === undefined &&
              food.isVegetarian === false
            )
          ),
      );
    }, [foods]);

  const vegPicks =
    useMemo(() => {
      return foods.filter(
        food =>
          food.isAvailable === true &&
          (
            food.foodType === 'veg' ||
            food.isVegetarian === true
          ),
      );
    }, [foods]);

  const topRatedRestaurants =
    useMemo(() => {
      return [...restaurants].sort(
        (a, b) =>
          (b.rating || 0) -
          (a.rating || 0),
      );
    }, [restaurants]);

  const handleOpenRestaurantFromFood =
    (food: Food) => {
      console.log(
        'Opening restaurant for:',
        food.name,
      );

      const foodRecord = food as Food & {
        restaurantId?: string;
        restaurantID?: string;
        restaurant?: any;
      };

      const restaurantRef =
        foodRecord.restaurant ??
        foodRecord.restaurantId ??
        foodRecord.restaurantID;

      let restaurantId:
        | string
        | undefined;

      if (
        restaurantRef &&
        typeof restaurantRef ===
          'object'
      ) {
        restaurantId =
          restaurantRef._id;
      }

      if (
        typeof restaurantRef ===
        'string'
      ) {
        restaurantId =
          restaurantRef;
      }

      let restaurant =
        restaurants.find(
          item =>
            item._id ===
            restaurantId,
        );

      if (
        !restaurant &&
        restaurantRef &&
        typeof restaurantRef ===
          'object'
      ) {
        restaurant =
          restaurants.find(
            item =>
              item.name ===
              restaurantRef.name,
          );
      }

      if (restaurant) {
        navigation.navigate(
          'RestaurantDetails',
          {restaurant},
        );
        return;
      }

      if (restaurantId) {
        const foodRestaurantName =
          (food as any).restaurantName ||
          (
            typeof restaurantRef === 'object'
              ? restaurantRef.name
              : undefined
          );

        navigation.navigate(
          'RestaurantDetails',
          {
            restaurant: {
              _id: String(restaurantId),
              name:
                typeof foodRestaurantName ===
                  'string' &&
                foodRestaurantName.trim()
                  ? foodRestaurantName
                  : 'Restaurant',
            } as Restaurant,
          },
        );
        return;
      }

      if (
        restaurantRef &&
        typeof restaurantRef === 'object' &&
        (restaurantRef._id || restaurantRef.id)
      ) {
        navigation.navigate(
          'RestaurantDetails',
          {
            restaurant: {
              ...restaurantRef,
              _id: String(
                restaurantRef._id ||
                restaurantRef.id,
              ),
            } as Restaurant,
          },
        );
        return;
      }

      console.log(
        'Restaurant not found for food:',
        food.name,
        restaurantRef,
      );
    };

  const handleFoodPress = (food: Food) => {
    handleOpenRestaurantFromFood(food);
  };

  const handleRetryFoods = () => {
    setLoadingFoods(true);
    loadFoods();
  };

  const handleRetryRestaurants = () => {
    setLoadingRestaurants(true);
    loadRestaurants();
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}>

      <StatusBar backgroundColor="#FF7A00" barStyle="light-content" hidden={false} translucent={false} />

      <View style={styles.body}>
        {/* Static app bar: remains visible while page content scrolls. */}
        <View style={styles.headerContainer}>
          <Header />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces
          contentContainerStyle={
            styles.scrollContent
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#F47721']}
              tintColor="#F47721"
            />
          }>

          {/* Search */}
          <View style={styles.searchContainer}>
            <SearchBar
              onPress={() =>
                navigation.navigate('Search')
              }
            />
          </View>

          {/* Banner */}
          <BannerCarousel />

          {/* Categories */}
          <CategorySection />

          {/* Food sections */}
          {loadingFoods ? (
            <View style={styles.foodLoading}>
              <ActivityIndicator
                size="small"
                color="#F47721"
              />

              <Text style={styles.loadingText}>
                Loading foods...
              </Text>
            </View>
          ) : foodError ? (
            <View style={styles.foodState}>
              <View style={styles.stateIcon}>
                <Warning
                  size={30}
                  color="#F47721"
                  weight="duotone"
                />
              </View>

              <Text style={styles.stateTitle}>
                Unable to load foods
              </Text>

              <Text style={styles.stateText}>
                {foodError}
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.retryButton}
                onPress={handleRetryFoods}>
                <Text style={styles.retryText}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {under20Minutes.length > 0 && (
                <View style={styles.foodSectionWrapper}>
                  <FoodList
                    title="Under 20 Minutes"
                    data={under20Minutes}
                    onSeeAll={() =>
                      navigation.navigate(
                        'CategoryFoods',
                        {
                          categoryName:
                            'Under 20 Minutes',
                        },
                      )
                    }
                    accentColor="#F47721"
                    onFoodPress={handleFoodPress}
                    onAddPress={handleFoodPress}
                  />
                </View>
              )}

              {nonVegPicks.length > 0 && (
                <View style={styles.foodSectionWrapper}>
                  <FoodList
                    title="Non-Veg Picks"
                    data={nonVegPicks}
                    onSeeAll={() =>
                      navigation.navigate(
                        'CategoryFoods',
                        {
                          categoryName: 'Non-Veg',
                        },
                      )
                    }
                    accentColor="#F47721"
                    onFoodPress={handleFoodPress}
                    onAddPress={handleFoodPress}
                  />
                </View>
              )}

              {vegPicks.length > 0 && (
                <View style={styles.foodSectionWrapper}>
                  <FoodList
                    title="Veg Picks"
                    data={vegPicks}
                    onSeeAll={() =>
                      navigation.navigate(
                        'CategoryFoods',
                        {
                          categoryName: 'Veg',
                        },
                      )
                    }
                    accentColor="#F47721"
                    onFoodPress={handleFoodPress}
                    onAddPress={handleFoodPress}
                  />
                </View>
              )}
            </>
          )}

          {/* Restaurants */}
          {loadingRestaurants ? (
            <View style={styles.restaurantLoading}>
              <ActivityIndicator
                size="small"
                color="#F47721"
              />

              <Text style={styles.loadingText}>
                Loading restaurants...
              </Text>
            </View>
          ) : restaurantError ? (
            <View style={styles.restaurantState}>
              <View style={styles.stateIcon}>
                <Storefront
                  size={30}
                  color="#F47721"
                  weight="duotone"
                />
              </View>

              <Text style={styles.stateTitle}>
                Unable to load restaurants
              </Text>

              <Text style={styles.stateText}>
                {restaurantError}
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.retryButton}
                onPress={handleRetryRestaurants}>
                <Text style={styles.retryText}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : restaurants.length === 0 ? (
            <View style={styles.restaurantState}>
              <View style={styles.stateIcon}>
                <Storefront
                  size={30}
                  color="#F47721"
                  weight="duotone"
                />
              </View>

              <Text style={styles.stateTitle}>
                No restaurants yet
              </Text>

              <Text style={styles.stateText}>
                Restaurants will appear here
                when they are created.
              </Text>
            </View>
          ) : (
            <RestaurantList
              title="Restaurants"
              data={topRatedRestaurants}
              onRestaurantPress={restaurant =>
                navigation.navigate(
                  'RestaurantDetails',
                  {restaurant},
                )
              }
            />
          )}

          {/* About FoodE */}
          <AboutFoodE />

          {/* Bottom space */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F47721',
  },

  body: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  scrollContent: {
    paddingBottom: 12,
  },

  headerContainer: {
    width: '100%',
    backgroundColor: '#F47721',
    zIndex: 1,
  },

  searchContainer: {
    backgroundColor: '#F7F8FA',
    paddingTop: 2,
    paddingBottom: 4,
  },

  foodSectionWrapper: {
    position: 'relative',
  },

  foodLoading: {
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#888888',
  },

  foodState: {
    marginHorizontal: 20,
    marginVertical: 15,
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#FFFCF8',
    borderRadius: 18,
    alignItems: 'center',
  },

  restaurantLoading: {
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },

  restaurantState: {
    marginHorizontal: 20,
    marginVertical: 15,
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#FFFCF8',
    borderRadius: 18,
    alignItems: 'center',
  },

  stateIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  stateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#17171B',
    textAlign: 'center',
  },

  stateText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: '#888888',
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F47721',
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  bottomSpacing: {
    height: 64,
  },
});