import React, {useEffect, useRef} from 'react';
import {
  Alert,
  Animated,
  Pressable,
  Text,
  View,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  House,
  MagnifyingGlass,
  ShoppingCart,
  Receipt,
  UserCircle,
} from 'phosphor-react-native';

import {useAuth} from '../../context/AuthContext';
import {useCart} from '../../context/CartContext';

const PRIMARY_ORANGE = '#FF6B00';
const INACTIVE_COLOR = '#8A92A0';

const tabs = [
  {name: 'Home', label: 'Home', Icon: House},
  {name: 'Search', label: 'Explore', Icon: MagnifyingGlass},
  {name: 'Cart', label: 'Cart', Icon: ShoppingCart},
  {name: 'Orders', label: 'Orders', Icon: Receipt},
  {name: 'Profile', label: 'Profile', Icon: UserCircle},
] as const;

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
}) => {
  const {isLoggedIn} = useAuth();
  const {items} = useCart();
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();

  const totalCartCount = (items || []).reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );

  const pressScales = useRef(
    tabs.map(() => new Animated.Value(1)),
  ).current;

  const tabBounces = useRef(
    tabs.map(() => new Animated.Value(0)),
  ).current;

  // Trigger bounce on tab switch
  useEffect(() => {
    const currentTab = tabs[state.index];
    if (currentTab && tabBounces[state.index]) {
      tabBounces[state.index].setValue(0);
      Animated.sequence([
        Animated.timing(tabBounces[state.index], {
          toValue: -6,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.spring(tabBounces[state.index], {
          toValue: 0,
          friction: 4,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [state.index, tabBounces]);

  const handleTabPress = (tabName: string) => {
    if (
      ['Favorites', 'Orders', 'Profile'].includes(tabName) &&
      !isLoggedIn
    ) {
      Alert.alert('Login Required', 'Please login to continue.', [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Login',
          onPress: () =>
            navigation.getParent()?.navigate('Login' as never),
        },
      ]);
      return;
    }

    const route = state.routes.find(item => item.name === tabName);
    if (!route) return;

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (
      !event.defaultPrevented &&
      state.routes[state.index]?.name !== tabName
    ) {
      navigation.navigate(tabName as never);
    }
  };

  const animatePress = (index: number, pressed: boolean) => {
    Animated.spring(pressScales[index], {
      toValue: pressed ? 0.88 : 1,
      speed: 24,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  };

  const isSmallScreen = width < 360;

  return (
    <View
      style={[
        styles.outerContainer,
        {
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}>
      <View style={styles.floatingDock}>
        {tabs.map((tab, index) => {
          const routeIndex = state.routes.findIndex(
            route => route.name === tab.name,
          );

          if (routeIndex === -1) return null;

          const focused = state.index === routeIndex;
          const isCart = tab.name === 'Cart';
          const IconComponent = tab.Icon;

          return (
            <Pressable
              key={tab.name}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{selected: focused}}
              onPress={() => handleTabPress(tab.name)}
              onPressIn={() => animatePress(index, true)}
              onPressOut={() => animatePress(index, false)}
              style={styles.tabItem}>
              <Animated.View
                style={[
                  styles.tabContent,
                  isCart && styles.cartContent,
                  {
                    transform: [
                      {scale: pressScales[index]},
                      {translateY: tabBounces[index]},
                    ],
                  },
                ]}>
                {isCart ? (
                  <View style={styles.cartButton}>
                    <IconComponent
                      size={24}
                      color="#FFFFFF"
                      weight="bold"
                    />
                    {totalCartCount > 0 && (
                      <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>
                          {totalCartCount > 99 ? '99+' : totalCartCount}
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View
                    style={[
                      styles.iconHolder,
                      focused && styles.activeIconHolder,
                    ]}>
                    <IconComponent
                      size={isSmallScreen ? 20 : 22}
                      color={focused ? PRIMARY_ORANGE : INACTIVE_COLOR}
                      weight={focused ? 'fill' : 'regular'}
                    />
                  </View>
                )}

                <Text
                  style={[
                    styles.tabLabel,
                    focused && styles.activeTabLabel,
                    isCart && styles.cartLabel,
                  ]}
                  numberOfLines={1}>
                  {tab.label}
                </Text>

                {focused && !isCart && (
                  <View style={styles.activePillDot} />
                )}
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default CustomTabBar;

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#171B24',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 16,
  },
  floatingDock: {
    height: 64,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconHolder: {
    width: 38,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  activeIconHolder: {
    backgroundColor: '#FFF2E6',
  },
  cartContent: {
    marginTop: -22,
  },
  cartButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: PRIMARY_ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    shadowColor: PRIMARY_ORANGE,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 9,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 10,
    minWidth: 19,
    height: 19,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  tabLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '600',
    color: INACTIVE_COLOR,
    textAlign: 'center',
  },
  activeTabLabel: {
    color: PRIMARY_ORANGE,
    fontWeight: '800',
  },
  cartLabel: {
    marginTop: 3,
    color: PRIMARY_ORANGE,
    fontWeight: '700',
  },
  activePillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: PRIMARY_ORANGE,
    marginTop: 2,
  },
});
