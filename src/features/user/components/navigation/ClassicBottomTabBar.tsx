import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  House,
  MagnifyingGlass,
  Heart,
  Receipt,
  UserCircle,
} from 'phosphor-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const ORANGE = '#F47721';
const INACTIVE = '#4B5563';

const ICONS: Record<string, any> = {
  Favorites: Heart,
  Search: MagnifyingGlass,
  Home: House,
  Orders: Receipt,
  Profile: UserCircle,
};

const LABELS: Record<string, string> = {
  Favorites: 'Favorites',
  Search: 'Search',
  Home: 'Home',
  Orders: 'Orders',
  Profile: 'Profile',
};

const DISPLAY_ORDER = [
  'Favorites',
  'Search',
  'Home',
  'Orders',
  'Profile',
];

const ClassicBottomTabBar = ({state, descriptors, navigation}: any) => {
  const insets = useSafeAreaInsets();

  const orderedRoutes = DISPLAY_ORDER
    .map(name => state.routes.find((route: any) => route.name === name))
    .filter(Boolean);

  return (
    <View style={[styles.outer, {paddingBottom: insets.bottom}]}>
      <View style={styles.bar}>
        {orderedRoutes.map((route: any) => {
          const routeIndex = state.routes.findIndex(
            (item: any) => item.key === route.key,
          );

          const {options} = descriptors[route.key];
          const focused = state.index === routeIndex;
          const label =
            options.tabBarLabel ??
            options.title ??
            LABELS[route.name] ??
            route.name;

          const Icon = ICONS[route.name] ?? House;
          const isHome = route.name === 'Home';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () =>
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? {selected: true} : {}}
              accessibilityLabel={
                options.tabBarAccessibilityLabel ?? String(label)
              }
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.8}
              style={[styles.item, isHome && styles.homeItem]}>
              {isHome ? (
                <View style={styles.homeBubble}>
                  <Icon size={25} color="#FFFFFF" weight="fill" />
                </View>
              ) : (
                <Icon
                  size={21}
                  color={focused ? ORANGE : INACTIVE}
                  weight={focused ? 'fill' : 'regular'}
                />
              )}

              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  focused && styles.activeLabel,
                  isHome && styles.homeLabel,
                ]}>
                {label}
              </Text>

              {focused && <View style={styles.indicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default ClassicBottomTabBar;

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#F0E4DA',
  },

  bar: {
    width: '100%',
    minHeight: 65,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    paddingTop: 2,
    paddingBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  item: {
    flex: 1,
    minWidth: 0,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 1,
  },

  homeItem: {
    marginTop: -13,
    height: 70,
    justifyContent: 'flex-start',
  },

  homeBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: ORANGE,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ORANGE,
    shadowOpacity: 0.25,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 3},
    elevation: 6,
  },

  label: {
    color: INACTIVE,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },

  activeLabel: {
    color: ORANGE,
    fontWeight: '800',
  },

  homeLabel: {
    marginTop: 1,
  },

  indicator: {
    position: 'absolute',
    bottom: 0,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: ORANGE,
  },
});
