import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {MapPin, User, Bell} from 'phosphor-react-native';
import {useNavigation} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CompositeNavigationProp} from '@react-navigation/native';

import {BottomTabParamList} from '../../../../../navigation/BottomTabNavigator';
import {RootStackParamList} from '../../../../../navigation/AppNavigator';

type HeaderNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

const ORANGE = '#FF6B00';
const DARK_ORANGE = '#E85D04';
const LIGHT_ORANGE = '#FFF7F0';

const Header: React.FC = () => {
  const navigation = useNavigation<HeaderNavigationProp>();
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(entrance, {
      toValue: 1,
      friction: 8,
      tension: 65,
      useNativeDriver: true,
    }).start();

    return () => entrance.stopAnimation();
  }, [entrance]);

  const translateY = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 0],
  });

  return (
    <Animated.View
      style={[
        styles.header,
        {
          opacity: entrance,
          transform: [{translateY}],
        },
      ]}>
      {/* Soft curved bottom */}
      <View pointerEvents="none" style={styles.bottomCurve} />

      {/* Decorative accents */}
      <View pointerEvents="none" style={styles.decorativeCircle} />
      <View pointerEvents="none" style={styles.decorativeDot} />

      {/* Delivery location */}
      <View style={styles.locationSection}>
        <View style={styles.locationIcon}>
          <MapPin size={17} color={DARK_ORANGE} weight="fill" />
        </View>

        <View style={styles.locationTextBlock}>
          <Text style={styles.deliverLabel}>DELIVERING TO</Text>

          <Text style={styles.location} numberOfLines={1}>
            SRM AP, Neerukonda
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={() => navigation.navigate('Notifications')}
          style={({pressed}) => [
            styles.actionButton,
            pressed && styles.pressed,
          ]}>
          <Bell size={21} color={DARK_ORANGE} weight="regular" />
          <View style={styles.notificationDot} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={() => navigation.navigate('Profile')}
          style={({pressed}) => [
            styles.profileButton,
            pressed && styles.pressed,
          ]}>
          <User size={22} color={DARK_ORANGE} weight="fill" />
        </Pressable>
      </View>
    </Animated.View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    width: '100%',
    minHeight: 82,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 17,

    backgroundColor: LIGHT_ORANGE,

    overflow: 'hidden',

    // Soft floating-card feel
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,

    shadowColor: '#D96A24',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },

  /* ---------------------------------- */
  /* CURVED BOTTOM                      */
  /* ---------------------------------- */

  bottomCurve: {
    position: 'absolute',

    left: -25,
    right: -25,
    bottom: -42,

    height: 72,

    borderRadius: 50,

    backgroundColor: '#FFFFFF',

    opacity: 0.75,
  },

  /* ---------------------------------- */
  /* DECORATION                         */
  /* ---------------------------------- */

  decorativeCircle: {
    position: 'absolute',

    width: 105,
    height: 105,

    borderRadius: 53,

    backgroundColor: '#FFE8D5',

    top: -62,
    right: 60,

    opacity: 0.7,
  },

  decorativeDot: {
    position: 'absolute',

    width: 9,
    height: 9,

    borderRadius: 5,

    backgroundColor: '#FFD2B1',

    right: 128,
    bottom: 15,
  },

  /* ---------------------------------- */
  /* LOCATION                           */
  /* ---------------------------------- */

  locationSection: {
    flex: 1,
    minWidth: 0,

    flexDirection: 'row',
    alignItems: 'center',

    marginRight: 10,

    zIndex: 2,
  },

  locationIcon: {
    width: 37,
    height: 37,

    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#FFE1CA',

    marginRight: 9,

    shadowColor: '#D96A24',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 1,
  },

  locationTextBlock: {
    flex: 1,
    minWidth: 0,
  },

  deliverLabel: {
    fontSize: 9,
    lineHeight: 13,

    color: '#A66A42',

    fontWeight: '800',

    letterSpacing: 0.8,
  },

  location: {
    fontSize: 13,
    lineHeight: 18,

    color: '#3D3028',

    fontWeight: '700',
  },

  /* ---------------------------------- */
  /* ACTIONS                            */
  /* ---------------------------------- */

  actions: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 8,

    zIndex: 2,
  },

  actionButton: {
    width: 40,
    height: 40,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 14,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#FFE3D0',

    shadowColor: '#D96A24',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },

  notificationDot: {
    position: 'absolute',

    top: 7,
    right: 7,

    width: 7,
    height: 7,

    borderRadius: 4,

    backgroundColor: ORANGE,

    borderWidth: 1,
    borderColor: '#FFFFFF',
  },

  profileButton: {
    width: 40,
    height: 40,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 14,

    backgroundColor: '#FFF0E3',

    borderWidth: 1,
    borderColor: '#FFD9BC',

    shadowColor: '#D96A24',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },

  pressed: {
    opacity: 0.7,

    transform: [
      {
        scale: 0.96,
      },
    ],
  },
});