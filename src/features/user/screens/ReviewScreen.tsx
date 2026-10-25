import {SafeAreaView} from 'react-native-safe-area-context';
import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AppTextInput from "../../../components/inputs/AppTextInput";

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {RootStackParamList} from '../../../navigation/AppNavigator';
import {ForkKnife} from 'phosphor-react-native';
import AppBackButton from '../../../components/buttons/AppBackButton';

import {
  createReview,
} from '../services/reviewService';

import {useAuth} from '../../../context/AuthContext';

// =====================================================
// TYPES
// =====================================================

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Review'
>;

// =====================================================
// STAR RATING
// =====================================================

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
}

const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  size = 34,
}) => {
  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity
          key={star}
          activeOpacity={0.7}
          onPress={() => onChange(star)}
          style={styles.starButton}>
          <Text
            style={[
              styles.star,
              {
                fontSize: size,
                color:
                  star <= value
                    ? '#FFB800'
                    : '#E5E7EB',
              },
            ]}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// =====================================================
// SCREEN
// =====================================================

const ReviewScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const {order} = route.params;

  const {token} = useAuth();

  // ===================================================
  // RESTAURANT RATING
  // ===================================================

  const [
    restaurantRating,
    setRestaurantRating,
  ] = useState(Number(order.review?.rating) || 0);

  // ===================================================
  // FOOD RATINGS
  // ===================================================

  const [
    foodRatings,
    setFoodRatings,
  ] = useState<Record<string, number>>({});

  // ===================================================
  // COMMENT
  // ===================================================

  const [
    comment,
    setComment,
  ] = useState(order.review?.comment || '');

  // ===================================================
  // SUBMITTING
  // ===================================================

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  // ===================================================
  // RESTAURANT ID
  // ===================================================

  const restaurantId =
    typeof order.restaurant === 'object'
      ? order.restaurant._id
      : order.restaurant;

  // ===================================================
  // RESTAURANT NAME
  // ===================================================

  const restaurantName =
    typeof order.restaurant === 'object'
      ? order.restaurant.name ||
        'Restaurant'
      : 'Restaurant';

  // ===================================================
  // UNIQUE FOOD ITEMS
  // ===================================================

  const foodItems = useMemo(() => {
    const uniqueFoods = new Map<string, any>();

    order.items.forEach(item => {
      const foodId =
        typeof item.food === 'object'
          ? item.food._id
          : item.food;

      if (
        foodId &&
        !uniqueFoods.has(foodId)
      ) {
        uniqueFoods.set(foodId, item);
      }
    });

    return Array.from(
      uniqueFoods.entries(),
    ).map(([foodId, item]) => ({
      foodId,
      item,
    }));
  }, [order.items]);

  // ===================================================
  // FOOD NAME
  // ===================================================

  const getFoodName = (item: any) => {
    if (item.name) {
      return item.name;
    }

    if (
      typeof item.food === 'object' &&
      item.food?.name
    ) {
      return item.food.name;
    }

    return 'Food Item';
  };

  // ===================================================
  // UPDATE FOOD RATING
  // ===================================================

  const updateFoodRating = (
    foodId: string,
    rating: number,
  ) => {
    setFoodRatings(previous => ({
      ...previous,
      [foodId]: rating,
    }));
  };

  // ===================================================
  // SUBMIT REVIEW
  // ===================================================

  const handleSubmit = async () => {
    // -------------------------------------------------
    // TOKEN
    // -------------------------------------------------

    if (!token) {
      Alert.alert(
        'Login Required',
        'Your session has expired. Please login again.',
      );

      return;
    }

    // -------------------------------------------------
    // CHECK RESTAURANT ID
    // -------------------------------------------------

    if (!restaurantId) {
      Alert.alert(
        'Error',
        'Restaurant information is missing.',
      );

      return;
    }

    // -------------------------------------------------
    // CHECK RATINGS
    // -------------------------------------------------

    const ratedFoodCount =
      Object.values(foodRatings).filter(
        rating => rating > 0,
      ).length;

    if (
      restaurantRating === 0 &&
      ratedFoodCount === 0
    ) {
      Alert.alert(
        'Rating Required',
        'Please rate the restaurant or at least one food item.',
      );

      return;
    }

    try {
      setSubmitting(true);

      let restaurantSubmitted = false;
      let foodSubmitted = 0;
      let failedReviews = 0;

      // ===============================================
      // RESTAURANT REVIEW
      // ===============================================

      if (restaurantRating > 0) {
        try {
          await createReview(token, {
            orderId: order._id,
            restaurantId,
            rating: restaurantRating,
            comment: comment.trim(),
          });

          restaurantSubmitted = true;
        } catch (error: any) {
          console.log(
            'Restaurant review error:',
            error,
          );

          failedReviews++;
        }
      }

      // ===============================================
      // FOOD REVIEWS
      // ===============================================

      for (
        const [foodId, rating]
        of Object.entries(foodRatings)
      ) {
        if (!rating || rating < 1) {
          continue;
        }

        try {
          await createReview(token, {
            orderId: order._id,
            restaurantId,
            foodId,
            rating,
            comment: '',
          });

          foodSubmitted++;
        } catch (error: any) {
          console.log(
            `Food review error (${foodId}):`,
            error,
          );

          failedReviews++;
        }
      }

      // ===============================================
      // TOTAL SUCCESS
      // ===============================================

      const totalSubmitted =
        (restaurantSubmitted ? 1 : 0) +
        foodSubmitted;

      // ===============================================
      // ALL SUCCESS
      // ===============================================

      if (
        totalSubmitted > 0 &&
        failedReviews === 0
      ) {
        Alert.alert(
          'Review Submitted ⭐',
          'Thank you for sharing your experience!',
          [
            {
              text: 'Done',
              onPress: () => {
                navigation.goBack();
              },
            },
          ],
        );

        return;
      }

      // ===============================================
      // PARTIAL SUCCESS
      // ===============================================

      if (
        totalSubmitted > 0 &&
        failedReviews > 0
      ) {
        Alert.alert(
          'Partially Submitted',
          `${totalSubmitted} review(s) submitted successfully. ${failedReviews} review(s) could not be submitted.`,
          [
            {
              text: 'Done',
              onPress: () => {
                navigation.goBack();
              },
            },
          ],
        );

        return;
      }

      // ===============================================
      // NOTHING SUBMITTED
      // ===============================================

      Alert.alert(
        'Unable to Submit',
        'Your reviews could not be submitted. Some may already have been submitted.',
      );
    } catch (error: any) {
      console.log(
        'Submit review error:',
        error,
      );

      Alert.alert(
        'Unable to Submit Review',
        error?.message ||
          'Something went wrong while submitting your review.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ===================================================
  // RATING MESSAGE
  // ===================================================

  const getRatingMessage = () => {
    switch (restaurantRating) {
      case 5:
        return 'Excellent!';

      case 4:
        return 'Great!';

      case 3:
        return 'Good';

      case 2:
        return 'Could be better';

      case 1:
        return 'We can do better';

      default:
        return 'Select a rating';
    }
  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#FF7A00" barStyle="light-content" hidden={false} translucent={false} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.content
        }>

        {/* =========================================
            HEADER
        ========================================= */}

        <View style={styles.header}>

          <AppBackButton />

          <Text style={styles.headerTitle}>
            Rate & Review
          </Text>

          <View
            style={styles.headerSpacer}
          />

        </View>

        {/* =========================================
            RESTAURANT
        ========================================= */}

        <View
          style={styles.restaurantCard}>

          <View
            style={styles.restaurantIcon}>

            <ForkKnife size={24} color="#FF7A00" weight="duotone" />

          </View>

          <View
            style={styles.restaurantInfo}>

            <Text
              style={
                styles.restaurantLabel
              }>
              Your order from
            </Text>

            <Text
              style={
                styles.restaurantName
              }
              numberOfLines={1}>

              {restaurantName}

            </Text>

            <Text
              style={styles.orderNumber}>

              Order #{order.orderNumber}

            </Text>

          </View>

        </View>

        {/* =========================================
            INTRO
        ========================================= */}

        <View
          style={styles.introSection}>

          <Text style={styles.title}>
            How was your experience?
          </Text>

          <Text
            style={styles.subtitle}>
            Your feedback helps us improve
            FoodE.
          </Text>

        </View>

        {/* =========================================
            RESTAURANT RATING
        ========================================= */}

        <View
          style={styles.ratingCard}>

          <Text
            style={styles.ratingTitle}>
            Rate the restaurant
          </Text>

          <StarRating
            value={restaurantRating}
            onChange={setRestaurantRating}
            size={42}
          />

          <Text
            style={styles.ratingText}>
            {getRatingMessage()}
          </Text>

        </View>

        {/* =========================================
            FOOD RATINGS
        ========================================= */}

        {foodItems.length > 0 && (
          <View
            style={styles.foodSection}>

            <View
              style={styles.foodSectionHeader}>

              <View>
                <Text
                  style={
                    styles.sectionTitle
                  }>
                  Rate your food
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }>
                  Rate individual items from
                  your order.
                </Text>
              </View>

              <Text
                style={styles.optionalText}>
                Optional
              </Text>

            </View>

            {foodItems.map(
              ({foodId, item}) => {

                const currentRating =
                  foodRatings[foodId] || 0;

                return (
                  <View
                    key={foodId}
                    style={styles.foodCard}>

                    <View
                      style={styles.foodInfo}>

                      <Text
                        style={styles.foodName}
                        numberOfLines={1}>

                        {getFoodName(item)}

                      </Text>

                      <Text
                        style={
                          styles.foodQuantity
                        }>

                        Quantity: {item.quantity}

                      </Text>

                    </View>

                    <StarRating
                      value={currentRating}
                      onChange={rating =>
                        updateFoodRating(
                          foodId,
                          rating,
                        )
                      }
                      size={27}
                    />

                  </View>
                );
              },
            )}

          </View>
        )}

        {/* =========================================
            COMMENT
        ========================================= */}

        <View
          style={styles.commentSection}>

          <Text
            style={styles.sectionTitle}>
            Tell us more
          </Text>

          <Text
            style={styles.sectionSubtitle}>
            Share your thoughts about your
            experience.
          </Text>

          <AppTextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Write your review..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
            textAlignVertical="top"
            editable={!submitting}
            style={styles.commentInput}
          />

          <Text
            style={styles.characterCount}>
            {comment.length}/500
          </Text>

        </View>

        {/* =========================================
            ORDER SUMMARY
        ========================================= */}

        <View
          style={styles.orderSummary}>

          <View>

            <Text
              style={styles.summaryLabel}>
              Order total
            </Text>

            <Text
              style={styles.summaryItems}>

              {order.items.length}{' '}

              {order.items.length === 1
                ? 'item'
                : 'items'}

            </Text>

          </View>

          <Text
            style={styles.summaryAmount}>

            ₹{order.total}

          </Text>

        </View>

        {/* =========================================
            SUBMIT
        ========================================= */}

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={submitting}
          onPress={handleSubmit}
          style={[
            styles.submitButton,
            submitting &&
              styles.disabledButton,
          ]}>

          {submitting ? (
            <ActivityIndicator
              color="#FFFFFF"
              size="small"
            />
          ) : (
            <Text
              style={styles.submitText}>
              Submit Review
            </Text>
          )}

        </TouchableOpacity>

        {/* =========================================
            SKIP
        ========================================= */}

        <TouchableOpacity
          activeOpacity={0.7}
          disabled={submitting}
          onPress={() =>
            navigation.goBack()
          }
          style={styles.skipButton}>

          <Text style={styles.skipText}>
            Maybe later
          </Text>

        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  content: {
    paddingBottom: 40,
  },

  // ================================================
  // HEADER
  // ================================================

  header: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    backgroundColor: '#FFFCF8',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F7F7F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    fontSize: 30,
    lineHeight: 32,
    color: '#111827',
    marginTop: -3,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  headerSpacer: {
    width: 40,
  },

  // ================================================
  // RESTAURANT
  // ================================================

  restaurantCard: {
    marginHorizontal: 18,
    marginTop: 22,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFFCF8',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },

  restaurantIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  restaurantEmoji: {
    fontSize: 25,
  },

  restaurantInfo: {
    flex: 1,
    marginLeft: 13,
  },

  restaurantLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 3,
  },

  restaurantName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  orderNumber: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 3,
  },

  // ================================================
  // INTRO
  // ================================================

  introSection: {
    alignItems: 'center',
    paddingHorizontal: 25,
    marginTop: 30,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 7,
    textAlign: 'center',
    lineHeight: 19,
  },

  // ================================================
  // RESTAURANT RATING
  // ================================================

  ratingCard: {
    marginHorizontal: 18,
    marginTop: 24,
    paddingVertical: 24,
    borderRadius: 22,
    backgroundColor: '#FFFCF8',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },

  ratingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 12,
  },

  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  starButton: {
    paddingHorizontal: 4,
  },

  star: {
    fontWeight: '700',
  },

  ratingText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: '#FF7A00',
  },

  // ================================================
  // FOOD
  // ================================================

  foodSection: {
    marginHorizontal: 18,
    marginTop: 22,
  },

  foodSectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 11,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  sectionSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },

  optionalText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    marginTop: 3,
  },

  foodCard: {
    backgroundColor: '#FFFCF8',
    borderRadius: 17,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },

  foodInfo: {
    flex: 1,
    marginRight: 8,
  },

  foodName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  foodQuantity: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },

  // ================================================
  // COMMENT
  // ================================================

  commentSection: {
    marginHorizontal: 18,
    marginTop: 12,
  },

  commentInput: {
    minHeight: 130,
    backgroundColor: '#FFFCF8',
    borderRadius: 18,
    padding: 15,
    fontSize: 13,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#EEEEF0',
  },

  characterCount: {
    textAlign: 'right',
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 5,
  },

  // ================================================
  // ORDER SUMMARY
  // ================================================

  orderSummary: {
    marginHorizontal: 18,
    marginTop: 18,
    padding: 15,
    borderRadius: 17,
    backgroundColor: '#FFF7F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summaryLabel: {
    fontSize: 11,
    color: '#6B7280',
  },

  summaryItems: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 3,
  },

  summaryAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  // ================================================
  // SUBMIT
  // ================================================

  submitButton: {
    marginHorizontal: 18,
    marginTop: 22,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#FF7A00',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },

  disabledButton: {
    opacity: 0.6,
  },

  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // ================================================
  // SKIP
  // ================================================

  skipButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 10,
  },

  skipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
  },
});

export default ReviewScreen;
