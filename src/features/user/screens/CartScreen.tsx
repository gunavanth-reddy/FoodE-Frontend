import {SafeAreaView} from 'react-native-safe-area-context';
import React, {useEffect, useState} from 'react';
import {Bicycle, ForkKnife} from 'phosphor-react-native';
import AppBackButton from '../../../components/buttons/AppBackButton';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useNavigation,
} from '@react-navigation/native';

import {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import {
  RootStackParamList,
} from '../../../navigation/AppNavigator';

import {
  useCart,
} from '../../../context/CartContext';

import {
  useAuth,
} from '../../../context/AuthContext';

import EmptyCart from '../components/cart/EmptyCart';

import CartItemCard from '../components/cart/CartItemCard';

import BillSummary from '../components/cart/BillSummary';

// =====================================================
// TYPES
// =====================================================

type CartScreenNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    'Cart'
  >;

// =====================================================
// SCREEN
// =====================================================

const CartScreen: React.FC = () => {

  // ===================================================
  // NAVIGATION
  // ===================================================

  const navigation =
    useNavigation<CartScreenNavigationProp>();

  // ===================================================
  // AUTH
  // ===================================================

  const {
    isLoggedIn,
    loading: authLoading,
  } = useAuth();

  // ===================================================
  // CART
  // ===================================================

  const {
    items,

    subtotal,

    deliveryFee,

    restaurant,

    loading,

    error,

    refreshCart,
    clearCart,
  } = useCart();

  // Total shown in cart: original item subtotal + delivery fee.
  const cartTotal =
    Number(subtotal || 0) + Number(deliveryFee || 0);

  // ===================================================
  // REFRESH
  // ===================================================

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  // ===================================================
  // LOGIN ALERT CONTROL
  // ===================================================

  const [
    loginAlertShown,
    setLoginAlertShown,
  ] = useState(false);

  // ===================================================
  // LOGIN CHECK
  // ===================================================

  useEffect(() => {

    if (
      authLoading ||
      isLoggedIn ||
      loginAlertShown
    ) {
      return;
    }

    setLoginAlertShown(true);

    Alert.alert(
      'Login Required',
      'Please login to access your cart.',
      [
        {
          text: 'Cancel',

          style: 'cancel',

          onPress: () => {

            setLoginAlertShown(false);

            if (
              navigation.canGoBack()
            ) {
              navigation.goBack();
            } else {
              navigation.replace(
                'Main',
              );
            }
          },
        },

        {
          text: 'Login',

          onPress: () => {

            setLoginAlertShown(false);

            navigation.replace(
              'Login',
            );
          },
        },
      ],
    );

  }, [
    authLoading,
    isLoggedIn,
    loginAlertShown,
    navigation,
  ]);

  const handleClearCart = () => {
    Alert.alert(
      'Clear your cart?',
      'All items from this restaurant will be removed.',
      [
        {text: 'Keep Cart', style: 'cancel'},
        {text: 'Clear Cart', style: 'destructive', onPress: () => clearCart()},
      ],
    );
  };

  // ===================================================
  // REFRESH CART
  // ===================================================

  const handleRefresh =
    async () => {

      try {

        setRefreshing(true);

        await refreshCart();

      } finally {

        setRefreshing(false);
      }
    };

  // ===================================================
  // AUTH LOADING
  // ===================================================

  if (authLoading) {

    return (
      <SafeAreaView
        style={styles.container} edges={['top', 'left', 'right']}>

        <View
          style={styles.centerContainer}>

          <ActivityIndicator
            size="large"
            color="#FF7A00"
          />

          <Text
            style={styles.loadingText}>
            Loading your cart...
          </Text>

        </View>

      </SafeAreaView>
    );
  }

  // ===================================================
  // NOT LOGGED IN
  // ===================================================

  if (!isLoggedIn) {

    return (
      <SafeAreaView
        style={styles.container}
        edges={['top', 'left', 'right']}>
      </SafeAreaView>
    );
  }
  // ===================================================
  // INITIAL LOADING
  // ===================================================

  if (
    loading &&
    items.length === 0
  ) {

    return (
      <SafeAreaView
        style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar backgroundColor="#FF7A00" barStyle="light-content" hidden={false} translucent={false} />

        <View
          style={styles.centerContainer}>

          <ActivityIndicator
            size="large"
            color="#FF7A00"
          />

          <Text
            style={styles.loadingText}>
            Loading your cart...
          </Text>

        </View>

      </SafeAreaView>
    );
  }

  // ===================================================
  // EMPTY CART
  // ===================================================

  if (
    !loading &&
    items.length === 0
  ) {

    return (
      <SafeAreaView
        style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar backgroundColor="#FF7A00" barStyle="light-content" hidden={false} translucent={false} />

        <View
          style={styles.emptyHeader}>

          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8}}>
            {navigation.canGoBack() && (
              <AppBackButton />
            )}
            <Text
              style={styles.emptyTitle}>
              My Cart
            </Text>
          </View>

          <Text
            style={styles.emptySubtitle}>
            Your cart is waiting for
            something delicious.
          </Text>

        </View>

        <EmptyCart />

      </SafeAreaView>
    );
  }

  // ===================================================
  // CART
  // ===================================================

  return (
    <SafeAreaView
      style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#FF7A00" barStyle="light-content" hidden={false} translucent={false} />

      <FlatList
        data={items}

        keyExtractor={item =>
          item.foodId
        }

        showsVerticalScrollIndicator={
          false
        }

        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={
              handleRefresh
            }
            tintColor="#FF7A00"
            colors={[
              '#FF7A00',
            ]}
          />
        }

        contentContainerStyle={
          styles.content
        }

        // =================================================
        // HEADER
        // =================================================

        ListHeaderComponent={
          <View>

            {/* ===========================================
                TITLE
            =========================================== */}

            <View
              style={styles.header}>

              <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                {navigation.canGoBack() && (
                  <AppBackButton />
                )}

                <View>

                  <Text
                    style={
                      styles.heading
                    }>
                    My Cart
                  </Text>

                  <Text
                    style={
                      styles.subheading
                    }>
                    {items.length}{' '}
                    {items.length === 1
                      ? 'item'
                      : 'items'}{' '}
                    in your cart
                  </Text>

                </View>
              </View>

              <View
                style={
                  styles.cartBadge
                }>

                <Text
                  style={
                    styles.cartBadgeText
                  }>
                  {items.reduce(
                    (
                      total,
                      item,
                    ) =>
                      total +
                      item.quantity,
                    0,
                  )}
                </Text>

              </View>

            </View>

            {/* ===========================================
                RESTAURANT
            =========================================== */}

            {restaurant && (
              <View
                style={
                  styles.restaurantCard
                }>

                <View
                  style={
                    styles.restaurantIcon
                  }>

                  <ForkKnife size={20} color="#FF7A00" weight="duotone" />

                </View>

                <View
                  style={
                    styles.restaurantInfo
                  }>

                  <Text
                    style={
                      styles.restaurantLabel
                    }>
                    ORDERING FROM
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={
                      styles.restaurantName
                    }>
                    {restaurant.name}
                  </Text>

                </View>

                <View
                  style={
                    styles.singleRestaurantBadge
                  }>

                  <Text
                    style={
                      styles.singleRestaurantText
                    }>
                    1 Restaurant
                  </Text>

                </View>

                <Pressable style={styles.clearCartButton} onPress={handleClearCart}>
                  <Text style={styles.clearCartText}>Clear</Text>
                </Pressable>

              </View>
            )}

            {/* ===========================================
                ERROR
            =========================================== */}

            {error && (
              <View
                style={
                  styles.errorCard
                }>

                <Text
                  style={
                    styles.errorIcon
                  }>
                  ⚠️
                </Text>

                <View
                  style={
                    styles.errorContent
                  }>

                  <Text
                    style={
                      styles.errorTitle
                    }>
                    Cart update issue
                  </Text>

                  <Text
                    style={
                      styles.errorText
                    }
                    numberOfLines={2}>
                    {error}
                  </Text>

                </View>

                <Pressable
                  onPress={
                    handleRefresh
                  }>

                  <Text
                    style={
                      styles.retryText
                    }>
                    Retry
                  </Text>

                </Pressable>

              </View>
            )}

          </View>
        }

        // =================================================
        // ITEMS
        // =================================================

        renderItem={({
          item,
        }) => (

          <CartItemCard
            item={item}
          />

        )}

        // =================================================
        // BILL
        // =================================================

        ListFooterComponent={
          <View>

            <View
              style={
                styles.billContainer
              }>

              <BillSummary
                subtotal={
                  subtotal
                }

                deliveryFee={
                  deliveryFee
                }
              />

            </View>

            {/* ===========================================
                DELIVERY INFORMATION
            =========================================== */}

            <View
              style={
                styles.deliveryCard
              }>

              <View
                style={
                  styles.deliveryIcon
                }>

                <Bicycle size={20} color="#FF7A00" weight="duotone" />

              </View>

              <View
                style={
                  styles.deliveryInfo
                }>

                <Text
                  style={
                    styles.deliveryTitle
                  }>
                  Delivery to
                </Text>

                <Text
                  numberOfLines={1}
                  style={
                    styles.deliveryAddress
                  }>
                  SRM AP University,
                  Neerukonda
                </Text>

              </View>

            </View>

            <View
              style={
                styles.bottomSpace
              }
            />

          </View>
        }
      />

      {/* =================================================
          CHECKOUT BAR
      ================================================= */}

      <View
        style={
          styles.checkoutContainer
        }>

        <View
          style={
            styles.checkoutInner
          }>

          {/* =============================================
              TOTAL
          ============================================= */}

          <View
            style={
              styles.totalContainer
            }>

            <Text
              style={
                styles.totalLabel
              }>
              Total
            </Text>

            <Text
              style={
                styles.totalAmount
              }>
              ₹
              {cartTotal.toFixed(2)}
            </Text>

          </View>

          {/* =============================================
              CHECKOUT
          ============================================= */}

          <Pressable
            disabled={loading}
            onPress={() =>
              navigation.navigate(
                'Checkout',
              )
            }
            style={({pressed}) => [
              styles.checkoutButton,

              pressed &&
                styles.checkoutPressed,

              loading &&
                styles.checkoutDisabled,
            ]}>

            {loading ? (

              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

            ) : (

              <>
                <Text
                  style={
                    styles.checkoutText
                  }>
                  Proceed to Checkout
                </Text>

                <Text
                  style={
                    styles.checkoutArrow
                  }>
                  →
                </Text>
              </>
            )}

          </Pressable>

        </View>

      </View>

    </SafeAreaView>
  );
};

export default CartScreen;

// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        '#F7F8FA',
    },

    // =================================================
    // CENTER
    // =================================================

    centerContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    loadingText: {
      marginTop: 12,
      fontSize: 14,
      fontWeight: '600',
      color: '#6B7280',
    },

    // =================================================
    // EMPTY
    // =================================================

    emptyHeader: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 4,
    },

    headerBackButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },

    emptyTitle: {
      fontSize: 30,
      fontWeight: '800',
      color: '#111827',
    },

    emptySubtitle: {
      marginTop: 5,
      fontSize: 14,
      color: '#6B7280',
    },

    // =================================================
    // CONTENT
    // =================================================

    content: {
      paddingTop: 4,
      paddingBottom: 150,
    },

    // =================================================
    // HEADER
    // =================================================

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',

      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 18,
    },

    heading: {
      fontSize: 30,
      fontWeight: '800',
      color: '#111827',
      letterSpacing: -0.8,
    },

    subheading: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: '500',
      color: '#6B7280',
    },

    cartBadge: {
      width: 44,
      height: 44,

      borderRadius: 22,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        '#FFF0E4',

      borderWidth: 1,
      borderColor:
        '#FFD6B8',
    },

    cartBadgeText: {
      fontSize: 16,
      fontWeight: '800',
      color: '#FF7A00',
    },

    // =================================================
    // RESTAURANT
    // =================================================

    restaurantCard: {
      flexDirection: 'row',
      alignItems: 'center',

      marginHorizontal: 16,
      marginBottom: 18,

      padding: 14,

      borderRadius: 18,

      backgroundColor:
        '#FFFFFF',

      borderWidth: 1,
      borderColor:
        '#F1F1F1',

      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 8,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 2,
    },

    restaurantIcon: {
      width: 44,
      height: 44,

      borderRadius: 14,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        '#FFF4EA',
    },

    restaurantIconText: {
      fontSize: 21,
    },

    restaurantInfo: {
      flex: 1,
      marginLeft: 12,
    },

    restaurantLabel: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1,
      color: '#9CA3AF',
    },

    restaurantName: {
      marginTop: 3,
      fontSize: 16,
      fontWeight: '800',
      color: '#111827',
    },

    singleRestaurantBadge: {
      paddingHorizontal: 9,
      paddingVertical: 6,

      borderRadius: 10,

      backgroundColor:
        '#F7F8FA',
    },

    singleRestaurantText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#6B7280',
    },

    // =================================================
    // ERROR
    // =================================================

    errorCard: {
      flexDirection: 'row',
      alignItems: 'center',

      marginHorizontal: 16,
      marginBottom: 16,

      padding: 12,

      borderRadius: 14,

      backgroundColor:
        '#FFF7ED',

      borderWidth: 1,
      borderColor:
        '#FED7AA',
    },

    errorIcon: {
      fontSize: 18,
      marginRight: 9,
    },

    errorContent: {
      flex: 1,
    },

    errorTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: '#9A3412',
    },

    errorText: {
      marginTop: 2,
      fontSize: 11,
      color: '#C2410C',
    },

    retryText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#EA580C',
      paddingLeft: 8,
    },

    // =================================================
    // BILL
    // =================================================

    billContainer: {
      marginHorizontal: 16,
      marginTop: 4,
      marginBottom: 12,
    },

    // =================================================
    // SOCIAL IMPACT
    // =================================================

    deliveryCard: {
      flexDirection: 'row',
      alignItems: 'center',

      marginHorizontal: 16,

      padding: 14,

      borderRadius: 16,

      backgroundColor:
        '#FFFFFF',

      borderWidth: 1,
      borderColor:
        '#F1F1F1',
    },

    deliveryIcon: {
      width: 42,
      height: 42,

      borderRadius: 13,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        '#F3F4F6',
    },

    deliveryIconText: {
      fontSize: 20,
    },

    deliveryInfo: {
      flex: 1,
      marginLeft: 11,
    },

    deliveryTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: '#9CA3AF',
    },

    deliveryAddress: {
      marginTop: 3,
      fontSize: 13,
      fontWeight: '700',
      color: '#374151',
    },

    bottomSpace: {
      height: 20,
    },

    // =================================================
    // CHECKOUT
    // =================================================

    clearCartButton: {
      paddingHorizontal: 9,
      paddingVertical: 7,
      borderRadius: 10,
      backgroundColor: '#FFF0F0',
      marginLeft: 7,
    },

    clearCartText: {
      fontSize: 11,
      fontWeight: '900',
      color: '#DC2626',
    },

    checkoutContainer: {
      position: 'absolute',

      left: 0,
      right: 0,
      bottom: 0,

      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 14,

      backgroundColor:
        'rgba(247,248,250,0.97)',

      borderTopWidth: 1,
      borderTopColor:
        '#E5E7EB',
    },

    checkoutInner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',

      backgroundColor:
        '#FFFFFF',

      padding: 7,
      paddingLeft: 16,

      borderRadius: 20,

      borderWidth: 1,
      borderColor:
        '#F1F1F1',

      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 12,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 6,
    },

    totalContainer: {
      justifyContent: 'center',
      paddingRight: 10,
    },

    totalLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: '#9CA3AF',
    },

    totalAmount: {
      marginTop: 2,
      fontSize: 20,
      fontWeight: '900',
      color: '#111827',
    },

    checkoutButton: {
      minWidth: 178,
      height: 52,

      paddingHorizontal: 18,

      borderRadius: 15,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        '#FF7A00',

      shadowColor:
        '#FF7A00',

      shadowOpacity: 0.22,
      shadowRadius: 8,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 5,
    },

    checkoutPressed: {
      opacity: 0.82,

      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    checkoutDisabled: {
      opacity: 0.6,
    },

    checkoutText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },

    checkoutArrow: {
      marginLeft: 9,
      color: '#FFFFFF',
      fontSize: 21,
      fontWeight: '700',
    },

  });
