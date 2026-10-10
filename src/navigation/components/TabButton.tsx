import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Pressable,
  Text,
  View,
  StyleSheet,
} from 'react-native';

import {
  House,
  MagnifyingGlass,
  ShoppingCart,
  Receipt,
  UserCircle,
  Icon,
} from 'phosphor-react-native';

type Props = {
  label: string;
  icon: string;
  focused: boolean;
  onPress: () => void;
};

const ORANGE = '#F47721';
const INACTIVE = '#68717D';

const getTabIcon = (icon: string): Icon => {
  switch (icon) {
    case 'home':
    case 'home-outline':
      return House;
    case 'search':
    case 'search-outline':
      return MagnifyingGlass;
    case 'cart':
    case 'cart-outline':
      return ShoppingCart;
    case 'receipt':
    case 'receipt-outline':
      return Receipt;
    case 'person':
    case 'person-outline':
      return UserCircle;
    default:
      return House;
  }
};

const TabButton: React.FC<Props> = ({
  label,
  icon,
  focused,
  onPress,
}) => {
  const IconComponent = getTabIcon(icon);
  const isCart = label === 'Cart';

  const selectionScale = useRef(new Animated.Value(1)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const indicatorWidth = useRef(
    new Animated.Value(focused ? 18 : 0),
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(selectionScale, {
        toValue: focused ? 1.05 : 1,
        speed: 20,
        bounciness: 5,
        useNativeDriver: true,
      }),
      Animated.timing(indicatorWidth, {
        toValue: focused ? 18 : 0,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start();
  }, [focused, selectionScale, indicatorWidth]);

  const animatePress = (pressed: boolean) => {
    Animated.spring(pressScale, {
      toValue: pressed ? 0.9 : 1,
      speed: 22,
      bounciness: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{selected: focused}}
      onPress={onPress}
      onPressIn={() => animatePress(true)}
      onPressOut={() => animatePress(false)}
      style={styles.tabButton}
    >
      <Animated.View
        style={[
          isCart ? styles.cartContainer : styles.regularContainer,
          {
            transform: [
              {scale: selectionScale},
              {scale: pressScale},
            ],
          },
        ]}
      >
        {isCart ? (
          <>
            <View
              style={[
                styles.cartButton,
                focused && styles.cartButtonActive,
              ]}
            >
              <IconComponent
                size={25}
                color="#FFFFFF"
                weight="bold"
              />
            </View>

            <Text
              style={[
                styles.label,
                focused && styles.activeLabel,
              ]}
            >
              Cart
            </Text>

            {focused && <View style={styles.dot} />}
          </>
        ) : (
          <>
            <View
              style={[
                styles.iconHolder,
                focused && styles.activeIconHolder,
              ]}
            >
              <IconComponent
                size={21}
                color={focused ? ORANGE : INACTIVE}
                weight={focused ? 'fill' : 'regular'}
              />
            </View>

            <Text
              style={[
                styles.label,
                focused && styles.activeLabel,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>

            <Animated.View
              style={[
                styles.indicator,
                {
                  width: indicatorWidth,
                  opacity: indicatorWidth.interpolate({
                    inputRange: [0, 18],
                    outputRange: [0, 1],
                  }),
                },
              ]}
            />
          </>
        )}
      </Animated.View>
    </Pressable>
  );
};

export default TabButton;

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    minWidth: 0,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },

  regularContainer: {
    width: '100%',
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconHolder: {
    width: 34,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },

  activeIconHolder: {
    backgroundColor: '#FFF0E5',
  },

  cartContainer: {
    width: '100%',
    height: 82,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -25,
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
    elevation: 7,
    shadowColor: ORANGE,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
  },

  cartButtonActive: {
    shadowOpacity: 0.4,
    elevation: 9,
  },

  label: {
    color: INACTIVE,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
  },

  activeLabel: {
    color: ORANGE,
    fontWeight: '700',
  },

  indicator: {
    height: 3,
    borderRadius: 2,
    backgroundColor: ORANGE,
    marginTop: 3,
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ORANGE,
    marginTop: 2,
  },
});
