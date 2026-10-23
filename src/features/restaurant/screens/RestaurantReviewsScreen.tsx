import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AppTextInput from "../../../components/inputs/AppTextInput";

import { SafeAreaView } from "react-native-safe-area-context";

import { useFocusEffect } from "@react-navigation/native";

import {
  getMyReviews,
  respondToReview,
  OwnerReview,
} from "../../user/services/reviewService";

import { useAuth } from "../../../context/AuthContext";

import {
  X,
  Star,
  Storefront,
  ChatCircleText,
  ArrowUpRight,
  PaperPlaneTilt,
} from "phosphor-react-native";

// =====================================================
// TYPES
// =====================================================

type RatingFilter =
  | "ALL"
  | "5"
  | "4"
  | "3"
  | "2"
  | "1";

interface Review {
  id: string;
  customer: string;
  rating: number;
  comment: string;
  food: string;
  date: string;
  response?: string;
}

// =====================================================
// HELPERS
// =====================================================

const formatReviewDate = (
  dateString: string,
): string => {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
};

// =====================================================
// API REVIEW → UI REVIEW
// =====================================================

const mapReview = (
  review: OwnerReview,
): Review => {
  let customer = "Customer";

  if (
    typeof review.user === "object" &&
    review.user !== null
  ) {
    customer =
      review.user.name ||
      "Customer";
  }

  let food = "Restaurant";

  // FIX 1:
  // review.food can be string, object or null
  if (
    review.food &&
    typeof review.food === "object" &&
    "name" in review.food
  ) {
    food =
      review.food.name ||
      "Food item";
  } else if (
    review.food &&
    typeof review.food === "string"
  ) {
    food = "Food item";
  }

  return {
    id: review._id,

    customer,

    rating:
      Number(review.rating) || 0,

    comment:
      review.comment || "",

    food,

    date:
      formatReviewDate(
        review.createdAt,
      ),

    response:
      review.response || "",
  };
};

// =====================================================
// SCREEN
// =====================================================

const RestaurantReviewsScreen =
  () => {
    const { token } = useAuth();

    const [reviews, setReviews] =
      useState<Review[]>([]);
    const [totalReviewCount, setTotalReviewCount] = useState(0);
    const [ratingSummary, setRatingSummary] = useState({
      averageRating: 0,
      countsByRating: {} as Record<number, number>,
    });
    const [hasMoreReviews, setHasMoreReviews] = useState(false);
    const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
    const currentPage = useRef(1);
    const loadingMoreRef = useRef(false);
    const reviewRequestId = useRef(0);

    const [
      activeFilter,
      setActiveFilter,
    ] = useState<RatingFilter>("ALL");

    const [search, setSearch] =
      useState("");

    const [
      respondingTo,
      setRespondingTo,
    ] = useState<string | null>(null);

    const [
      responseText,
      setResponseText,
    ] = useState("");

    const [loading, setLoading] =
      useState(true);

    const [
      refreshing,
      setRefreshing,
    ] = useState(false);

    const [
      submitting,
      setSubmitting,
    ] = useState(false);

    // =================================================
    // LOAD REVIEWS
    // =================================================

    const loadReviews =
      useCallback(
        async (
          showLoader = true,
        ) => {
          const requestId = ++reviewRequestId.current;
          if (!token) {
            setReviews([]);
            setTotalReviewCount(0);
            setRatingSummary({
              averageRating: 0,
              countsByRating: {},
            });
            setHasMoreReviews(false);
            setLoading(false);
            return;
          }

          try {
            if (showLoader) {
              setLoading(true);
            }

            const result = await getMyReviews(token, 1);
            if (requestId !== reviewRequestId.current) {
              return;
            }

            currentPage.current = 1;
            setReviews(result.reviews.map(mapReview));
            setTotalReviewCount(result.total);
            setRatingSummary(result.summary);
            setHasMoreReviews(result.hasMore);
          } catch (error: any) {
            if (requestId !== reviewRequestId.current) {
              return;
            }
            console.log(
              "Load reviews error:",
              error,
            );

            Alert.alert(
              "Unable to Load Reviews",
              error?.message ||
                "Something went wrong while loading reviews.",
            );
          } finally {
            if (requestId === reviewRequestId.current) {
              setLoading(false);
              setRefreshing(false);
            }
          }
        },
        [token],
      );

      const loadMoreReviews = useCallback(async () => {
        if (!token || !hasMoreReviews || loadingMoreRef.current) {
          return;
        }

        loadingMoreRef.current = true;
        setLoadingMoreReviews(true);
        const requestId = reviewRequestId.current;

        try {
          const nextPage = currentPage.current + 1;
          const result = await getMyReviews(token, nextPage);
          if (requestId !== reviewRequestId.current) {
            return;
          }

          const existingIds = new Set(reviews.map(review => review.id));
          const nextReviews = result.reviews
            .map(mapReview)
            .filter(review => !existingIds.has(review.id));

          currentPage.current = nextPage;
          setReviews(current => [...current, ...nextReviews]);
          setTotalReviewCount(result.total);
          setRatingSummary(result.summary);
          setHasMoreReviews(result.hasMore);
        } catch (error: any) {
          if (requestId !== reviewRequestId.current) {
            return;
          }

          console.error("Load more reviews error:", error);
          Alert.alert(
            "Unable to Load More Reviews",
            error?.message || "Please try again.",
          );
        } finally {
          loadingMoreRef.current = false;
          setLoadingMoreReviews(false);
        }
      }, [hasMoreReviews, reviews, token]);

      const handleReviewsScroll = (
        event: NativeSyntheticEvent<NativeScrollEvent>,
      ) => {
        const {contentOffset, contentSize, layoutMeasurement} =
          event.nativeEvent;

        if (
          contentOffset.y + layoutMeasurement.height >=
          contentSize.height - 260
        ) {
          loadMoreReviews();
        }
      };

    // =================================================
    // LOAD WHEN SCREEN OPENS
    // =================================================

    useFocusEffect(
      useCallback(() => {
        loadReviews();
      }, [loadReviews]),
    );

    // =================================================
    // PULL TO REFRESH
    // =================================================

    const onRefresh =
      useCallback(() => {
        setRefreshing(true);
        loadReviews(false);
      }, [loadReviews]);

    // =================================================
    // FILTER REVIEWS
    // =================================================

    const filteredReviews =
      useMemo(() => {
        return reviews.filter(
          review => {
            const matchesRating =
              activeFilter === "ALL" ||
              review.rating ===
                Number(activeFilter);

            const searchValue =
              search
                .trim()
                .toLowerCase();

            const matchesSearch =
              !searchValue ||
              review.customer
                .toLowerCase()
                .includes(searchValue) ||
              review.comment
                .toLowerCase()
                .includes(searchValue) ||
              review.food
                .toLowerCase()
                .includes(searchValue);

            return (
              matchesRating &&
              matchesSearch
            );
          },
        );
      }, [
        reviews,
        activeFilter,
        search,
      ]);

    const visibleReviewCount =
      activeFilter === "ALL" && !search.trim()
        ? totalReviewCount
        : filteredReviews.length;

    // =================================================
    // RESPONSE
    // =================================================

    const startResponse =
      (review: Review) => {
        setRespondingTo(
          review.id,
        );

        setResponseText(
          review.response || "",
        );
      };

    const cancelResponse =
      () => {
        setRespondingTo(null);
        setResponseText("");
      };

    const submitResponse =
      async (
        reviewId: string,
      ) => {
        if (!responseText.trim()) {
          Alert.alert(
            "Response Required",
            "Please write a response before submitting.",
          );
          return;
        }

        if (!token) {
          Alert.alert(
            "Login Required",
            "Your session has expired. Please login again.",
          );
          return;
        }

        try {
          setSubmitting(true);

          const updatedReview =
            await respondToReview(
              token,
              reviewId,
              responseText,
            );

          setReviews(
            currentReviews =>
              currentReviews.map(
                review =>
                  review.id ===
                  updatedReview._id
                    ? {
                        ...review,
                        response:
                          updatedReview.response ||
                          "",
                      }
                    : review,
              ),
          );

          cancelResponse();

          Alert.alert(
            "Success",
            "Your response has been added successfully.",
          );
        } catch (error: any) {
          console.log(
            "Submit response error:",
            error,
          );

          Alert.alert(
            "Unable to Respond",
            error?.message ||
              "Something went wrong while responding to the review.",
          );
        } finally {
          setSubmitting(false);
        }
      };

    // =================================================
    // RATING COUNTS
    // =================================================

    const totalReviews = totalReviewCount;
    const fiveStarCount = ratingSummary.countsByRating[5] || 0;
    const fourStarCount = ratingSummary.countsByRating[4] || 0;
    const threeStarCount = ratingSummary.countsByRating[3] || 0;
    const twoStarCount = ratingSummary.countsByRating[2] || 0;
    const oneStarCount = ratingSummary.countsByRating[1] || 0;
    const averageRating = ratingSummary.averageRating;

    // =================================================
    // UI
    // =================================================

    return (
      <SafeAreaView
        style={styles.container}
        edges={["top", "left", "right"]}
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          onScroll={handleReviewsScroll}
          scrollEventThrottle={300}
          contentContainerStyle={
            styles.scrollContent
          }
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                onRefresh
              }
              colors={[
                "#FF7A00",
              ]}
              tintColor="#FF7A00"
            />
          }
        >
          {/* HEADER */}

          <View
            style={styles.header}
          >
            <View>
              <Text
                style={
                  styles.smallText
                }
              >
                Restaurant
              </Text>

              <Text
                style={
                  styles.title
                }
              >
                Reviews
              </Text>
            </View>

            <View
              style={
                styles.ratingHeader
              }
            >
              <View style={styles.ratingHeaderContent}>
                <Star
                  size={15}
                  color="#725B00"
                  weight="fill"
                />
                <Text
                  style={
                    styles.ratingHeaderValue
                  }
                >
                  {averageRating.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>

          {/* LOADING */}

          {loading ? (
            <View
              style={
                styles.loadingContainer
              }
            >
              <ActivityIndicator
                size="large"
                color="#FF7A00"
              />

              <Text
                style={
                  styles.loadingText
                }
              >
                Loading reviews...
              </Text>
            </View>
          ) : (
            <>
              {/* RATING OVERVIEW */}

              <View
                style={
                  styles.overviewCard
                }
              >
                <View
                  style={
                    styles.ratingOverview
                  }
                >
                  <Text
                    style={
                      styles.bigRating
                    }
                  >
                    {averageRating.toFixed(
                      1,
                    )}
                  </Text>

                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={14}
                        color="#FFB800"
                        weight="fill"
                      />
                    ))}
                  </View>

                  <Text
                    style={
                      styles.totalReviews
                    }
                  >
                    {totalReviews}{" "}
                    reviews
                  </Text>
                </View>

                <View
                  style={
                    styles.ratingBars
                  }
                >
                  <RatingBar
                    rating={5}
                    count={
                      fiveStarCount
                    }
                    total={
                      totalReviews
                    }
                  />

                  <RatingBar
                    rating={4}
                    count={
                      fourStarCount
                    }
                    total={
                      totalReviews
                    }
                  />

                  <RatingBar
                    rating={3}
                    count={
                      threeStarCount
                    }
                    total={
                      totalReviews
                    }
                  />

                  <RatingBar
                    rating={2}
                    count={
                      twoStarCount
                    }
                    total={
                      totalReviews
                    }
                  />

                  <RatingBar
                    rating={1}
                    count={
                      oneStarCount
                    }
                    total={
                      totalReviews
                    }
                  />
                </View>
              </View>

              {/* SEARCH */}

              <View
                style={
                  styles.searchContainer
                }
              >
                <Text
                  style={
                    styles.searchIcon
                  }
                >
                  🔍
                </Text>

                <AppTextInput
                  value={search}
                  onChangeText={
                    setSearch
                  }
                  placeholder="Search reviews..."
                  placeholderTextColor="#9999A2"
                  style={
                    styles.searchInput
                  }
                />

                {search.length >
                  0 && (
                  <TouchableOpacity
                    onPress={() =>
                      setSearch("")
                    }
                  >
                    <X
                      size={18}
                      color="#8C8C95"
                      weight="bold"
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* FILTERS */}

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.filterContainer
                }
              >
                {[
                  "ALL",
                  "5",
                  "4",
                  "3",
                  "2",
                  "1",
                ].map(
                  filter => {
                    const active =
                      activeFilter ===
                      filter;

                    return (
                      <TouchableOpacity
                        key={
                          filter
                        }
                        activeOpacity={
                          0.8
                        }
                        onPress={() =>
                          setActiveFilter(
                            filter as RatingFilter,
                          )
                        }
                        style={[
                          styles.filterButton,
                          active &&
                            styles.activeFilterButton,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterText,
                            active &&
                              styles.activeFilterText,
                          ]}
                        >
                          {filter === "ALL" ? (
                            "All"
                          ) : (
                            <View style={styles.filterRatingContent}>
                              <Star
                                size={13}
                                color={active ? "#FFFFFF" : "#777780"}
                                weight="fill"
                              />
                              <Text style={[
                                styles.filterText,
                                active && styles.activeFilterText,
                              ]}>
                                {filter}
                              </Text>
                            </View>
                          )}
                        </Text>
                      </TouchableOpacity>
                    );
                  },
                )}
              </ScrollView>

              {/* SECTION HEADER */}

              <View
                style={
                  styles.sectionHeader
                }
              >
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Customer Reviews
                </Text>

                <Text
                  style={
                    styles.reviewCount
                  }
                >
                  {
                    visibleReviewCount
                  }
                </Text>
              </View>

              {/* REVIEWS */}

              {filteredReviews.length ===
              0 ? (
                <View
                  style={
                    styles.emptyCard
                  }
                >
                  <View style={styles.emptyIcon}>
                    <Star
                      size={36}
                      color="#FF7A00"
                      weight="duotone"
                    />
                  </View>

                  <Text
                    style={
                      styles.emptyTitle
                    }
                  >
                    {totalReviews ===
                    0
                      ? "No reviews yet"
                      : "No reviews found"}
                  </Text>

                  <Text
                    style={
                      styles.emptyText
                    }
                  >
                    {totalReviews ===
                    0
                      ? "Customer reviews will appear here."
                      : "Try another filter or search."}
                  </Text>
                </View>
              ) : (
                <View
                  style={
                    styles.reviewsContainer
                  }
                >
                  {filteredReviews.map(
                    review => (
                      <ReviewCard
                        key={
                          review.id
                        }
                        review={
                          review
                        }
                        respondingTo={
                          respondingTo
                        }
                        responseText={
                          responseText
                        }
                        submitting={
                          submitting
                        }
                        onResponseChange={
                          setResponseText
                        }
                        onRespond={() =>
                          startResponse(
                            review,
                          )
                        }
                        onCancelResponse={
                          cancelResponse
                        }
                        onSubmitResponse={() =>
                          submitResponse(
                            review.id,
                          )
                        }
                      />
                    ),
                  )}
                </View>
              )}

              {loadingMoreReviews ? (
                <ActivityIndicator
                  color="#FF7A00"
                  style={styles.loadingMoreReviews}
                />
              ) : null}

              <View
                style={
                  styles.bottomSpace
                }
              />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  };

// =====================================================
// RATING BAR
// =====================================================

interface RatingBarProps {
  rating: number;
  count: number;
  total: number;
}

const RatingBar: React.FC<
  RatingBarProps
> = ({
  rating,
  count,
  total,
}) => {
  const percentage =
    total === 0
      ? 0
      : (count / total) * 100;

  return (
    <View
      style={
        styles.ratingBarRow
      }
    >
      <Text
        style={
          styles.ratingBarLabel
        }
      >
        {rating}★
      </Text>

      <View
        style={
          styles.ratingBarBackground
        }
      >
        <View
          style={[
            styles.ratingBarFill,
            {
              width: `${percentage}%`,
            },
          ]}
        />
      </View>

      <Text
        style={
          styles.ratingBarCount
        }
      >
        {count}
      </Text>
    </View>
  );
};

// =====================================================
// REVIEW CARD
// =====================================================

interface ReviewCardProps {
  review: Review;
  respondingTo: string | null;
  responseText: string;
  submitting: boolean;
  onResponseChange: (
    value: string,
  ) => void;
  onRespond: () => void;
  onCancelResponse: () => void;
  onSubmitResponse: () => void;
}

const ReviewCard: React.FC<
  ReviewCardProps
> = ({
  review,
  respondingTo,
  responseText,
  submitting,
  onResponseChange,
  onRespond,
  onCancelResponse,
  onSubmitResponse,
}) => {
  const isResponding =
    respondingTo ===
    review.id;

  return (
    <View
      style={
        styles.reviewCard
      }
    >
      {/* CUSTOMER */}

      <View
        style={
          styles.reviewTop
        }
      >
        <View
          style={
            styles.avatar
          }
        >
          <Text
            style={
              styles.avatarText
            }
          >
            {review.customer
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>

        <View
          style={
            styles.customerInfo
          }
        >
          <Text
            style={
              styles.customerName
            }
          >
            {review.customer}
          </Text>

          <Text
            style={
              styles.reviewDate
            }
          >
            {review.date}
          </Text>
        </View>

        <View
          style={
            styles.ratingBadge
          }
        >
          <View style={styles.ratingBadgeContent}>
            <Star
              size={13}
              color="#725B00"
              weight="fill"
            />
            <Text
              style={
                styles.ratingBadgeText
              }
            >
              {review.rating}
            </Text>
          </View>
        </View>
      </View>

      {/* FOOD / RESTAURANT */}

      <View style={styles.foodRow}>
        <Storefront
          size={15}
          color="#FF7A00"
          weight="duotone"
        />
        <Text
          style={
            styles.foodName
          }
        >
          {review.food === "Restaurant"
            ? "Restaurant Review"
            : `Ordered: ${review.food}`}
        </Text>
      </View>

      {/* COMMENT */}

      <Text
        style={
          styles.comment
        }
      >
        {review.comment ||
          "No comment provided."}
      </Text>

      {/* OWNER RESPONSE */}

      {review.response &&
        !isResponding && (
          <View
            style={
              styles.responseCard
            }
          >
            <View style={styles.responseLabelRow}>
              <ChatCircleText
                size={15}
                color="#FF7A00"
                weight="duotone"
              />
              <Text
                style={
                  styles.responseLabel
                }
              >
                Your response
              </Text>
            </View>

            <Text
              style={
                styles.responseText
              }
            >
              {review.response}
            </Text>
          </View>
        )}

      {/* RESPONSE FORM */}

      {isResponding ? (
        <View
          style={
            styles.responseForm
          }
        >
          <AppTextInput
            value={
              responseText
            }
            onChangeText={
              onResponseChange
            }
            placeholder="Write your response..."
            placeholderTextColor="#9999A2"
            multiline
            textAlignVertical="top"
            editable={
              !submitting
            }
            maxLength={500}
            style={
              styles.responseInput
            }
          />

          <Text
            style={
              styles.characterCount
            }
          >
            {responseText.length}/500
          </Text>

          <View
            style={
              styles.responseActions
            }
          >
            <TouchableOpacity
              activeOpacity={
                0.8
              }
              disabled={
                submitting
              }
              onPress={
                onCancelResponse
              }
              style={
                styles.cancelButton
              }
            >
              <Text
                style={
                  styles.cancelText
                }
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={
                0.8
              }
              disabled={
                submitting
              }
              onPress={
                onSubmitResponse
              }
              style={[
                styles.submitButton,
                submitting &&
                  styles.disabledButton,
              ]}
            >
              {submitting ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <View style={styles.buttonContent}>
                  <PaperPlaneTilt
                    size={15}
                    color="#FFFFFF"
                    weight="bold"
                  />
                  <Text
                    style={
                      styles.submitText
                    }
                  >
                    Respond
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={
            0.7
          }
          onPress={
            onRespond
          }
          style={
            styles.respondButton
          }
        >
          <View style={styles.buttonContent}>
            <ArrowUpRight
              size={15}
              color="#FF7A00"
              weight="bold"
            />
            <Text
              style={
                styles.respondText
              }
            >
              {review.response
                ? "Edit Response"
                : "Reply to Review"}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#F8F8FA",
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },

    // HEADER

    header: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginBottom: 20,
    },

    smallText: {
      fontSize: 13,
      color: "#8A8A93",
      marginBottom: 4,
    },

    title: {
      fontSize: 28,
      fontWeight: "800",
      color: "#17171B",
    },

    ratingHeader: {
      backgroundColor:
        "#FFF7D9",
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 13,
    },

    ratingHeaderContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    ratingHeaderValue: {
      fontSize: 12,
      fontWeight: "800",
      color: "#725B00",
    },

    // LOADING

    loadingContainer: {
      minHeight: 300,
      alignItems: "center",
      justifyContent:
        "center",
    },

    loadingText: {
      marginTop: 12,
      fontSize: 13,
      color: "#777780",
    },

    // OVERVIEW

    overviewCard: {
      backgroundColor:
        "#17171B",
      borderRadius: 22,
      padding: 20,
      flexDirection:
        "row",
      alignItems:
        "center",
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#2A2A30",
    },

    ratingOverview: {
      width: 105,
      alignItems:
        "center",
    },

    bigRating: {
      color: "#FFFFFF",
      fontSize: 34,
      fontWeight: "800",
    },

    stars: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      marginTop: 4,
    },

    totalReviews: {
      color: "#9999A2",
      fontSize: 10,
      marginTop: 5,
    },

    ratingBars: {
      flex: 1,
      marginLeft: 10,
      gap: 7,
    },

    ratingBarRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    ratingBarLabel: {
      width: 27,
      color: "#FFFFFF",
      fontSize: 9,
      fontWeight: "700",
    },

    ratingBarBackground: {
      flex: 1,
      height: 5,
      borderRadius: 5,
      backgroundColor:
        "#35353B",
      overflow: "hidden",
    },

    ratingBarFill: {
      height: "100%",
      borderRadius: 5,
      backgroundColor:
        "#FFB800",
    },

    ratingBarCount: {
      width: 20,
      textAlign:
        "right",
      color: "#9999A2",
      fontSize: 9,
    },

    // SEARCH

    searchContainer: {
      height: 50,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 16,
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal: 15,
      marginBottom: 15,
    },

    searchIcon: {
      fontSize: 17,
      marginRight: 9,
    },

    searchInput: {
      flex: 1,
      marginLeft: 9,
      fontSize: 13,
      color: "#17171B",
    },

    clearSearch: {
      fontSize: 14,
      color: "#8C8C95",
      paddingLeft: 10,
    },

    // FILTERS

    filterContainer: {
      gap: 9,
      paddingBottom: 22,
    },

    filterButton: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 13,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor: "#EEEEF2",
    },

    activeFilterButton: {
      backgroundColor:
        "#FF7A00",
    },

    filterText: {
      fontSize: 11,
      fontWeight: "700",
      color: "#777780",
    },

    filterRatingContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    activeFilterText: {
      color: "#FFFFFF",
    },

    // SECTION

    sectionHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginBottom: 14,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: "#17171B",
    },

    reviewCount: {
      minWidth: 25,
      height: 25,
      borderRadius: 9,
      backgroundColor:
        "#FFFFFF",
      textAlign:
        "center",
      textAlignVertical:
        "center",
      fontSize: 11,
      fontWeight: "700",
      color: "#777780",
      paddingTop: 5,
    },

    // REVIEWS

    reviewsContainer: {
      gap: 12,
    },
    loadingMoreReviews: {
      paddingVertical: 18,
    },

    reviewCard: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: "#EEEEF2",
    },

    reviewTop: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    avatar: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor:
        "#FFF1E6",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    avatarText: {
      fontSize: 16,
      fontWeight: "800",
      color: "#FF7A00",
    },

    customerInfo: {
      flex: 1,
      marginLeft: 11,
    },

    customerName: {
      fontSize: 13,
      fontWeight: "800",
      color: "#17171B",
    },

    reviewDate: {
      fontSize: 10,
      color: "#9999A2",
      marginTop: 3,
    },

    ratingBadge: {
      backgroundColor:
        "#FFF7D9",
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 9,
    },

    ratingBadgeContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    ratingBadgeText: {
      fontSize: 10,
      fontWeight: "800",
      color: "#725B00",
    },

    foodRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 13,
    },

    foodName: {
      fontSize: 10,
      color: "#FF7A00",
      fontWeight: "700",
    },

    comment: {
      fontSize: 12,
      lineHeight: 18,
      color: "#5F5F68",
      marginTop: 8,
    },

    // RESPONSE

    responseCard: {
      backgroundColor:
        "#F8F8FA",
      borderRadius: 13,
      padding: 12,
      marginTop: 13,
      borderLeftWidth: 3,
      borderLeftColor:
        "#FF7A00",
    },

    responseLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 4,
    },

    responseLabel: {
      fontSize: 10,
      fontWeight: "800",
      color: "#17171B",
    },

    responseText: {
      fontSize: 11,
      lineHeight: 17,
      color: "#707079",
    },

    respondButton: {
      alignSelf:
        "flex-start",
      marginTop: 13,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor:
        "#FFF1E6",
    },

    respondText: {
      color: "#FF7A00",
      fontSize: 10,
      fontWeight: "800",
    },

    responseForm: {
      marginTop: 13,
    },

    responseInput: {
      minHeight: 80,
      backgroundColor:
        "#F8F8FA",
      borderRadius: 13,
      padding: 12,
      fontSize: 12,
      color: "#17171B",
    },

    characterCount: {
      textAlign: "right",
      fontSize: 9,
      color: "#9999A2",
      marginTop: 4,
    },

    responseActions: {
      flexDirection:
        "row",
      justifyContent:
        "flex-end",
      gap: 9,
      marginTop: 9,
    },

    cancelButton: {
      paddingHorizontal: 13,
      paddingVertical: 9,
      borderRadius: 10,
      backgroundColor:
        "#F1F1F2",
    },

    cancelText: {
      fontSize: 10,
      fontWeight: "700",
      color: "#66666E",
    },

    submitButton: {
      minWidth: 70,
      minHeight: 36,
      paddingHorizontal: 15,
      paddingVertical: 9,
      borderRadius: 10,
      backgroundColor:
        "#FF7A00",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    disabledButton: {
      opacity: 0.6,
    },

    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },

    submitText: {
      fontSize: 10,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    // EMPTY

    emptyCard: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      paddingVertical: 45,
      alignItems:
        "center",
      borderWidth: 1,
      borderColor: "#EEEEF2",
    },

    emptyIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor: "#FFF1E6",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },

    emptyTitle: {
      fontSize: 15,
      fontWeight: "800",
      color: "#17171B",
    },

    emptyText: {
      fontSize: 12,
      color: "#909099",
      marginTop: 5,
    },

    bottomSpace: {
      height: 70,
    },
  });

export default RestaurantReviewsScreen;
