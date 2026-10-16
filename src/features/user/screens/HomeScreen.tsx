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
      loadFoods();
    }, [loadFoods]),
  );

  const onRefresh =
    useCallback(async () => {
      setRefreshing(true);

      try {
        await loadFoods();
      } finally {
        setRefreshing(false);
      }
    }, [loadFoods]);

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

      if (
        restaurantRef &&
        typeof restaurantRef === 'object' &&
        (restaurantRef._id || restaurantRef.id)
      ) {
        navigation.navigate('RestaurantDetails', {
          restaurant: {
            ...restaurantRef,
            _id: String(restaurantRef._id || restaurantRef.id),
          },
        });
        return;
      }

      if (
        typeof restaurantRef === 'string' &&
        restaurantRef
      ) {
        navigation.navigate('RestaurantDetails', {
          restaurantId: restaurantRef,
        });
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

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}>

      <StatusBar backgroundColor="#FF7A00" barStyle="light-content" hidden={false} translucent={false} />

      <View style={styles.body}>
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

          {/* The brand/location header scrolls naturally with the feed. */}
          <View style={styles.headerContainer}>
            <Header />
          </View>

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
    backgroundColor: '#FFF8F2',
  },

  body: {
    flex: 1,
    backgroundColor: '#FFF9F4',
  },

  scrollContent: {
    paddingBottom: 28,
  },

  headerContainer: {
    width: '100%',
    backgroundColor: '#F47721',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    marginBottom: 10,
  },

  searchContainer: {
    backgroundColor: '#FFF9F4',
    paddingTop: 2,
    paddingBottom: 10,
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