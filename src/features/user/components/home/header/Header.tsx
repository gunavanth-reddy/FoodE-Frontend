
import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  MapPin,
  CaretDown,
  UserCircle,
} from 'phosphor-react-native';

import {
  CompositeNavigationProp,
  useNavigation,
} from '@react-navigation/native';

import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import NotificationButton from './NotificationButton';
import {BottomTabParamList} from '../../../../../navigation/BottomTabNavigator';
import {RootStackParamList} from '../../../../../navigation/AppNavigator';

type HeaderNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

const ORANGE = '#F47721';

const PARTICLES = [
  {left: '8%', top: 15, size: 5, duration: 2600, delay: 0},
  {left: '23%', top: 62, size: 4, duration: 3200, delay: 350},
  {left: '39%', top: 12, size: 3, duration: 2800, delay: 700},
  {left: '53%', top: 75, size: 5, duration: 3400, delay: 200},
  {left: '65%', top: 22, size: 4, duration: 3000, delay: 900},
  {left: '78%', top: 65, size: 3, duration: 2500, delay: 500},
  {left: '91%', top: 18, size: 5, duration: 3600, delay: 100},
  {left: '46%', top: 48, size: 3, duration: 2900, delay: 1200},
];

const FloatingParticle = ({
  particle,
}: {
  particle: (typeof PARTICLES)[number];
}) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: particle.duration,
          delay: particle.delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: particle.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [progress, particle.duration, particle.delay]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const opacity = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.25, 0.85, 0.3],
  });

  const scale = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1.25, 0.8],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          left: particle.left as any,
          top: particle.top,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          opacity,
          transform: [{translateY}, {scale}],
        },
      ]}
    />
  );
};

const Header: React.FC = () => {
  const navigation = useNavigation<HeaderNavigationProp>();

  return (
    <View style={styles.header}>
      {/* Animated particles behind the header content */}
      <View
        pointerEvents="none"
        style={styles.particleLayer}>
        {PARTICLES.map((particle, index) => (
          <FloatingParticle
            key={index}
            particle={particle}
          />
        ))}
      </View>

      <View style={styles.locationBlock}>
        <View style={styles.locationRow}>
          <View style={styles.pinCircle}>
            <MapPin
              size={21}
              color="#FFFFFF"
              weight="fill"
            />
          </View>

          <View style={styles.locationDetails}>
            <Text style={styles.deliveryLabel}>
              DELIVERING TO
            </Text>

            <View style={styles.locationNameRow}>
              <Text
                style={styles.locationText}
                numberOfLines={1}>
                SRM AP, Neerukonda
              </Text>

              <CaretDown
                size={15}
                color="#FFFFFF"
                weight="bold"
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <View style={styles.notificationWrap}>
          <NotificationButton />
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          activeOpacity={0.75}
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}>
          <UserCircle
            size={27}
            color={ORANGE}
            weight="bold"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    width: '100%',
    minHeight: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 17,
    backgroundColor: ORANGE,
    overflow: 'hidden',
    position: 'relative',
  },

  particleLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
  },

  particle: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },

  locationBlock: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    zIndex: 1,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    minWidth: 0,
  },

  pinCircle: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },

  locationDetails: {
    flex: 1,
    minWidth: 0,
  },

  deliveryLabel: {
    color: '#FFE7D6',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  locationNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },

  locationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    flexShrink: 1,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    zIndex: 1,
  },

  notificationWrap: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
