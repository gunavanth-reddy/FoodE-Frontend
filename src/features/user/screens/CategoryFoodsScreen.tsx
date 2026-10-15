import {SafeAreaView} from 'react-native-safe-area-context';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  ForkKnife,
  Star,
  CaretRight,
  ArrowLeft,
  Warning,
} from 'phosphor-react-native';

import {useNavigation, useRoute} from '@react-navigation/native';

import {
  Food,
  getFoodsByCategory,
} from '../../restaurant/services/foodService';
import AsyncImage from '../../../components/images/AsyncImage';

// =====================================================
// ROUTE TYPE
// =====================================================

interface CategoryFoodsRouteParams {
  categoryName: string;
}

// =====================================================
// SCREEN
// =====================================================

const CategoryFoodsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const {
    categoryName = 'All',
  } = (route.params || {}) as CategoryFoodsRouteParams;

  // ===================================================
  // STATES
  // ===================================================

  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ===================================================
  // SPECIAL CATEGORY CHECK
  // ===================================================

  const isAll =
    categoryName.toLowerCase() === 'all' ||
    categoryName.toLowerCase() === 'all foods';

  const isUnder20 =
    categoryName.toLowerCase() === 'under 20 mins' ||
    categoryName.toLowerCase() === 'under 20 min' ||
    categoryName.toLowerCase() === 'under 20 minutes';

  const isVeg =
    categoryName.toLowerCase() === 'veg' ||
    categoryName.toLowerCase() === 'vegetarian';

  const isNonVeg =
    categoryName.toLowerCase() === 'non-veg' ||
    categoryName.toLowerCase() === 'non veg' ||
    categoryName.toLowerCase() === 'nonvegetarian';

  // ===================================================
  // DELIVERY TIME HELPER
  // ===================================================

  const getDeliveryMinutes = (food: Food): number | null => {
    const item = food as any;

    const possibleValues = [
      item.deliveryTime,
      item.deliveryMinutes,
      item.restaurant?.deliveryTime,
    ];

    for (const value of possibleValues) {
      if (typeof value === 'number') {
        return value;
      }

      if (typeof value === 'string') {
        const numbers = value.match(/\d+/g);

        if (numbers && numbers.length > 0) {
          const parsed = Number(numbers[0]);

          if (Number.isFinite(parsed)) {
            return parsed;
          }
        }
      }

      if (
        typeof value === 'object' &&
        value !== null
      ) {
        const min = value.min;

        if (
          typeof min === 'number' &&
          Number.isFinite(min)
        ) {
          return min;
        }
      }
    }

    return null;
  };

  // ===================================================
  // FILTER FOODS
  // ===================================================

  const filterFoods = (data: Food[]): Food[] => {
    let result = data.filter(
      food => food.isAvailable === true,
    );

    // -----------------------------
    // UNDER 20 MINUTES
    // -----------------------------

    if (isUnder20) {
      result = result.filter(food => {
        const minutes = getDeliveryMinutes(food);

        return (
          minutes !== null &&
          minutes < 20
        );
      });
    }

    // -----------------------------
    // VEG
    // -----------------------------

    if (isVeg) {
      result = result.filter(
        food => food.isVegetarian === true,
      );
    }

    // -----------------------------
    // NON-VEG
    // -----------------------------

    if (isNonVeg) {
      result = result.filter(
        food => food.isVegetarian !== true,
      );
    }

    return result;
  };

  // ===================================================
  // FETCH FOODS
  // ===================================================

  useEffect(() => {
    const loadFoods = async () => {
      try {
        setLoading(true);
        setError('');

        /*
         * Special filters need all available foods first.
         *
         * Normal categories can directly use the
         * category API.
         */

        const apiCategory =
          isAll ||
          isUnder20 ||
          isVeg ||
          isNonVeg
            ? 'All'
            : categoryName;

        const data =
          await getFoodsByCategory(apiCategory);

        const availableFoods =
          Array.isArray(data)
            ? data
            : [];

        setFoods(
          filterFoods(availableFoods),
        );
      } catch (err: any) {
        console.log(
          'Category foods error:',
          err,
        );

        setFoods([]);

        setError(
          err?.message ||
            'Unable to load foods.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadFoods();
  }, [categoryName]);

  // ===================================================
  // FOOD PRESS
  // ===================================================

  const handleFoodPress = (food: Food) => {
    const restaurant = (food as any).restaurant;
    if (restaurant && typeof restaurant === 'object') {
      handleOpenRestaurant(restaurant);
      return;
    }
    const restaurantId = (food as any).restaurantId || (food as any).restaurantID;
    if (restaurantId) {
      navigation.navigate('RestaurantDetails', {restaurantId});
    }
  };

  const handleOpenRestaurant = (restaurant: any) => {
    if (
      typeof restaurant === 'object' &&
      restaurant !== null
    ) {
      navigation.navigate(
        'RestaurantDetails',
        {
          restaurant: {
            id: restaurant._id,
            backendId: restaurant._id,

            name: restaurant.name,

            image: undefined,
            coverImage: undefined,

            cuisines: '',

            rating: 0,

            deliveryTime: '20-30 min',

            distance: '',

            priceForTwo: '',

            offer: '',

            freeDelivery: false,

            address:
              'SRM AP University, Neerukonda',

            isVeg: false,

            isActive:
              restaurant.isActive,
          },
        },
      );

      return;
    }

    // ================================================
    // RESTAURANT ID
    // ================================================

    navigation.navigate(
      'RestaurantDetails',
      {
        restaurantId: restaurant,
      },
    );
  };

  // ===================================================
  // BACK BUTTON
  // ===================================================

  const handleBack = () => {
    navigation.goBack();
  };

  // ===================================================
  // HEADER TITLE
  // ===================================================

  const getHeaderTitle = () => {
    if (isAll) {
      return 'All Foods';
    }

    if (isUnder20) {
      return 'Under 20 mins';
    }

    if (isVeg) {
      return 'Veg';
    }

    if (isNonVeg) {
      return 'Non-Veg';
    }

    return categoryName;
  };

  // ===================================================
  // EMPTY MESSAGE
  // ===================================================

  const getEmptyMessage = () => {
    if (isUnder20) {
      return 'No foods available under 20 minutes right now.';
    }

    if (isVeg) {
      return 'No vegetarian foods are available right now.';
    }

    if (isNonVeg) {
      return 'No non-vegetarian foods are available right now.';
    }

    if (isAll) {
      return 'There are no available foods in FoodE right now.';
    }

    return `There are no available foods in ${categoryName} right now.`;
  };

  // ===================================================
  // FOOD CARD
  // ===================================================

  const renderFoodCard = (food: Food) => {
    const restaurant = food.restaurant;

    const restaurantName =
      typeof restaurant === 'object' &&
      restaurant !== null
        ? restaurant.name
        : 'Restaurant';

    const finalPrice =
      food.discountedPrice ??
      food.price;

    return (
      <TouchableOpacity
        key={food._id}
        activeOpacity={0.88}
        onPress={() =>
          handleFoodPress(food)
        }
        style={styles.foodCard}>

        {/* IMAGE */}

        <View style={styles.imageContainer}>
          <AsyncImage
            source={food.image}
            style={styles.foodImage}
            kind="food"
          />

          {/* VEG / NON VEG */}

          <View
            style={[
              styles.foodIndicator,
              {
                borderColor:
                  food.isVegetarian
                    ? '#16A34A'
                    : '#DC2626',
              },
            ]}>
            <View
              style={[
                styles.foodDot,
                {
                  backgroundColor:
                    food.isVegetarian
                      ? '#16A34A'
                      : '#DC2626',
                },
              ]}
            />
          </View>
        </View>

        {/* CONTENT */}

        <View style={styles.foodContent}>
          <Text
            style={styles.foodName}
            numberOfLines={1}>
            {food.name}
          </Text>

          <Text
            style={styles.restaurantName}
            numberOfLines={1}>
            {restaurantName}
          </Text>

          {/* RATING */}

          <View style={styles.ratingRow}>
            {food.rating !== undefined && (
              <>
                <View
                  style={
                    styles.ratingBadge
                  }>
                  <Star
                    size={11}
                    color="#FFFFFF"
                    weight="fill"
                  />

                  <Text
                    style={
                      styles.ratingText
                    }>
                    {food.rating}
                  </Text>
                </View>

                {food.totalReviews !==
                  undefined && (
                  <Text
                    style={
                      styles.reviewsText
                    }>
                    ({food.totalReviews})
                  </Text>
                )}
              </>
            )}
          </View>

          {/* PRICE */}

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              ₹{finalPrice}
            </Text>

            {food.discountedPrice !==
              undefined &&
              food.discountedPrice !==
                null &&
              food.discountedPrice <
                food.price && (
                <Text
                  style={
                    styles.originalPrice
                  }>
                  ₹{food.price}
                </Text>
              )}
          </View>
        </View>

        {/* ARROW */}

        <View
          style={styles.arrowContainer}>
          <CaretRight
            size={20}
            color="#AAAAAA"
            weight="bold"
          />
        </View>
      </TouchableOpacity>
    );
  };

  // ===================================================
  // SCREEN
  // ===================================================

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#FF7A00" barStyle="light-content" hidden={false} translucent={false} />
      {/* ============================================
          HEADER
      ============================================ */}

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBack}
          style={styles.backButton}>

          <ArrowLeft
            size={23}
            color="#171717"
            weight="bold"
          />
        </TouchableOpacity>

        <View
          style={
            styles.headerTextContainer
          }>

          <Text
            style={styles.headerTitle}
            numberOfLines={1}>
            {getHeaderTitle()}
          </Text>

          {!loading && (
            <Text
              style={
                styles.headerSubtitle
              }>
              {foods.length}{' '}
              {foods.length === 1
                ? 'item'
                : 'items'}{' '}
              available
            </Text>
          )}
        </View>
      </View>

      {/* ============================================
          CONTENT
      ============================================ */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }>

        {/* LOADING */}

        {loading && (
          <View
            style={
              styles.loadingContainer
            }>
            <ActivityIndicator
              size="large"
              color="#FF7A00"
            />

            <Text
              style={
                styles.loadingText
              }>
              Loading foods...
            </Text>
          </View>
        )}

        {/* ERROR */}

        {!loading &&
          error !== '' && (
            <View
              style={
                styles.emptyContainer
              }>

              <View
                style={
                  styles.emptyIcon
                }>
                <Warning
                  size={34}
                  color="#FF7A00"
                  weight="duotone"
                />
              </View>

              <Text
                style={
                  styles.emptyTitle
                }>
                Something went wrong
              </Text>

              <Text
                style={
                  styles.emptyText
                }>
                {error}
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  navigation.replace(
                    'CategoryFoods',
                    {
                      categoryName,
                    },
                  )
                }
                style={
                  styles.retryButton
                }>

                <Text
                  style={
                    styles.retryText
                  }>
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          foods.length === 0 && (
            <View
              style={
                styles.emptyContainer
              }>

              <View
                style={
                  styles.emptyIcon
                }>
                <ForkKnife
                  size={34}
                  color="#FF7A00"
                  weight="duotone"
                />
              </View>

              <Text
                style={
                  styles.emptyTitle
                }>
                No foods available
              </Text>

              <Text
                style={
                  styles.emptyText
                }>
                {getEmptyMessage()}
              </Text>
            </View>
          )}

        {/* FOODS */}

        {!loading &&
          !error &&
          foods.length > 0 && (
            <View>
              {foods.map(
                renderFoodCard,
              )}
            </View>
          )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CategoryFoodsScreen;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F1',
  },

  // ===============================================
  // HEADER
  // ===============================================

  header: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 16,
    paddingVertical: 14,

    backgroundColor: '#FFFAF5',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0C2',
  },

  backButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: '#FFF1E4',

    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTextContainer: {
    flex: 1,

    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 21,

    fontWeight: '800',

    color: '#C85C00',
  },

  headerSubtitle: {
    marginTop: 3,

    fontSize: 12,

    color: '#858585',

    fontWeight: '500',
  },

  // ===============================================
  // CONTENT
  // ===============================================

  content: {
    paddingTop: 14,
    paddingBottom: 100,
  },

  // ===============================================
  // FOOD CARD
  // ===============================================

  foodCard: {
    flexDirection: 'row',

    alignItems: 'center',

    marginHorizontal: 16,
    marginBottom: 12,

    padding: 10,

    borderRadius: 18,

    backgroundColor: '#FFFAF5',
    borderWidth: 1,
    borderColor: '#FFD7B5',
    elevation: 3,
    shadowColor: '#C85C00',

    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.05,

    shadowRadius: 5,
  },

  // ===============================================
  // IMAGE
  // ===============================================

  imageContainer: {
    width: 94,
    height: 94,

    borderRadius: 15,

    overflow: 'hidden',

    position: 'relative',

    backgroundColor: '#FFF4E8',

    marginRight: 13,
  },

  foodImage: {
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

  // ===============================================
  // VEG INDICATOR
  // ===============================================

  foodIndicator: {
    position: 'absolute',

    top: 7,
    right: 7,

    width: 18,
    height: 18,

    borderRadius: 4,

    borderWidth: 1.5,

    backgroundColor: '#FFFCF8',

    alignItems: 'center',
    justifyContent: 'center',
  },

  foodDot: {
    width: 7,
    height: 7,

    borderRadius: 4,
  },

  // ===============================================
  // CONTENT
  // ===============================================

  foodContent: {
    flex: 1,

    minWidth: 0,
  },

  foodName: {
    fontSize: 16,

    fontWeight: '800',

    color: '#C85C00',
  },

  restaurantName: {
    marginTop: 4,

    fontSize: 12,

    color: '#858585',

    fontWeight: '500',
  },

  // ===============================================
  // RATING
  // ===============================================

  ratingRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 7,
  },

  ratingBadge: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#22C55E',

    paddingHorizontal: 6,
    paddingVertical: 3,

    borderRadius: 6,
  },

  ratingText: {
    marginLeft: 3,

    color: '#FFFFFF',

    fontSize: 10,

    fontWeight: '800',
  },

  reviewsText: {
    marginLeft: 5,

    fontSize: 11,

    color: '#999999',
  },

  // ===============================================
  // PRICE
  // ===============================================

  priceRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 7,
  },

  price: {
    fontSize: 15,

    fontWeight: '800',

    color: '#FF7A00',
  },

  originalPrice: {
    marginLeft: 8,

    fontSize: 12,

    color: '#AAAAAA',

    textDecorationLine: 'line-through',
  },

  // ===============================================
  // ARROW
  // ===============================================

  arrowContainer: {
    marginLeft: 5,
  },

  // ===============================================
  // LOADING
  // ===============================================

  loadingContainer: {
    alignItems: 'center',

    justifyContent: 'center',

    paddingVertical: 80,
  },

  loadingText: {
    marginTop: 12,

    fontSize: 13,

    color: '#888888',
  },

  // ===============================================
  // EMPTY / ERROR
  // ===============================================

  emptyContainer: {
    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal: 35,

    paddingVertical: 80,
  },

  emptyIcon: {
    width: 70,
    height: 70,

    borderRadius: 35,

    backgroundColor: '#FFF4E8',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 19,

    fontWeight: '800',

    color: '#C85C00',

    textAlign: 'center',
  },

  emptyText: {
    marginTop: 8,

    fontSize: 13,

    lineHeight: 20,

    color: '#777777',

    textAlign: 'center',
  },

  retryButton: {
    marginTop: 18,

    paddingHorizontal: 22,
    paddingVertical: 11,

    borderRadius: 22,

    backgroundColor: '#FF7A00',
  },

  retryText: {
    color: '#FFFFFF',

    fontSize: 13,

    fontWeight: '700',
  },
});