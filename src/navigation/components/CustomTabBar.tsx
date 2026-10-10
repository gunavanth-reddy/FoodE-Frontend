import React, {useEffect, useRef} from 'react';
import {
  Alert,
  Animated,
  Pressable,
  Text,
  View,
  StyleSheet,
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

const ORANGE = '#F47721';
const INACTIVE = '#7A8490';

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
  const insets = useSafeAreaInsets();

  const pressScales = useRef(
    tabs.map(() => new Animated.Value(1)),
  ).current;

  const indicatorPosition = useRef(
    new Animated.Value(state.index),
  ).current;

  useEffect(() => {
    Animated.spring(indicatorPosition, {
      toValue: state.index,
      speed: 18,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  }, [state.index, indicatorPosition]);

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
      toValue: pressed ? 0.9 : 1,
      speed: 22,
      bounciness: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View
      style={[
        styles.safeArea,
        {paddingBottom: insets.bottom},
      ]}>
      <View style={styles.bar}>
        <View
          pointerEvents="none"
          style={styles.indicatorTrack}>
          <Animated.View
            style={[
              styles.slidingIndicator,
              {
                transform: [
                  {
                    translateX: indicatorPosition.interpolate({
                      inputRange: [0, tabs.length - 1],
                      outputRange: [0, 0],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>

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
              style={styles.tab}>
              <Animated.View
                style={[
                  styles.content,
                  isCart && styles.cartContent,
                  {transform: [{scale: pressScales[index]}]},
                ]}>
                {isCart ? (
                  <View style={styles.cartButton}>
                    <IconComponent
                      size={25}
                      color="#FFFFFF"
                      weight="bold"
                    />
                  </View>
                ) : (
                  <View style={styles.iconHolder}>
                    <IconComponent
                      size={22}
                      color={focused ? ORANGE : INACTIVE}
                      weight={focused ? 'fill' : 'regular'}
                    />
                  </View>
                )}

                <Text
                  style={[
                    styles.label,
                    focused && styles.activeLabel,
                  ]}
                  numberOfLines={1}>
                  {tab.label}
                </Text>

                {focused && !isCart && (
                  <View style={styles.activeDot} />
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
  safeArea: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },

  bar: {
    height: 66,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 5,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F0E6DF',
    shadowColor: '#24170F',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },

  indicatorTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },

  slidingIndicator: {
    display: 'none',
  },

  tab: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconHolder: {
    width: 36,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  cartContent: {
    marginTop: -16,
  },

  cartButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: ORANGE,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ORANGE,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 7,
  },

  label: {
    marginTop: 3,
    fontSize: 9,
    fontWeight: '600',
    color: INACTIVE,
    textAlign: 'center',
  },

  activeLabel: {
    color: ORANGE,
    fontWeight: '700',
  },

  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ORANGE,
    marginTop: 2,
  },
});
