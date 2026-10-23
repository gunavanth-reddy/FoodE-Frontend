
import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Easing,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useAuth} from '../../../context/AuthContext';

const ORANGE = '#FF6500';

const SplashScreen = ({navigation}: any) => {
  const {user, token, loading} = useAuth();

  const imageOpacity = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(1.06)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const logoY = useRef(new Animated.Value(18)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(8)).current;
  const glowScale = useRef(new Animated.Value(0.75)).current;
  const glowOpacity = useRef(new Animated.Value(0.12)).current;
  const dot1 = useRef(new Animated.Value(0.35)).current;
  const dot2 = useRef(new Animated.Value(0.35)).current;
  const dot3 = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const entrance = Animated.sequence([
      Animated.parallel([
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(imageScale, {
          toValue: 1,
          friction: 8,
          tension: 35,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 55,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(logoY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(taglineY, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    entrance.start();

    const glow = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowScale, {
            toValue: 1.05,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.24,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(glowScale, {
            toValue: 0.75,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.12,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    const pulseDot = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.35,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
      );

    const dots = Animated.parallel([
      pulseDot(dot1, 0),
      pulseDot(dot2, 180),
      pulseDot(dot3, 360),
    ]);

    glow.start();
    dots.start();

    return () => {
      entrance.stop();
      glow.stop();
      dots.stop();
    };
  }, [
    imageOpacity,
    imageScale,
    logoOpacity,
    logoScale,
    logoY,
    taglineOpacity,
    taglineY,
    glowScale,
    glowOpacity,
    dot1,
    dot2,
    dot3,
  ]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const timer = setTimeout(() => {
      // A missing saved session is the normal guest state on first launch.
      // Protected actions can request login when the guest chooses them.
      if (!user || !token) {
        navigation.replace('Main');
      } else if (user.role === 'restaurant_owner') {
        navigation.replace('RestaurantOwner');
      } else if (user.role === 'admin') {
        navigation.replace('AdminDashboard');
      } else {
        navigation.replace('Main');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [loading, navigation, token, user]);

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      {/* Full-screen FoodE brand image */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: imageOpacity,
            transform: [{scale: imageScale}],
          },
        ]}>
        <Image
          source={require('../../../assets/foode-splash.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
          accessibilityLabel="FoodE branded splash screen"
        />
      </Animated.View>

      {/* Gentle glow */}
      <View pointerEvents="none" style={styles.glowContainer}>
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: glowOpacity,
              transform: [{scale: glowScale}],
            },
          ]}
        />
      </View>

      {/* Supporting brand text */}
      <View pointerEvents="none" style={styles.brandContainer}>
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: taglineOpacity,
              transform: [{translateY: taglineY}],
            },
          ]}>
          GOOD FOOD. GOOD MOOD.
        </Animated.Text>

        <Animated.Text
          style={[
            styles.subTagline,
            {opacity: taglineOpacity},
          ]}>
          Your campus cravings, delivered.
        </Animated.Text>
      </View>

      {/* Three-dot loading animation */}
      <View style={styles.loadingContainer}>
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, {opacity: dot1}]} />
          <Animated.View style={[styles.dot, {opacity: dot2}]} />
          <Animated.View style={[styles.dot, {opacity: dot3}]} />
        </View>

        <Text style={styles.loadingText}>PREPARING YOUR ORDER EXPERIENCE</Text>
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ORANGE,
    overflow: 'hidden',
  },

  backgroundImage: {
    width: '100%',
    height: '100%',
  },

  glowContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  glow: {
    width: 220,
    maxWidth: '70%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: '#FFF4A3',
  },

  brandContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: '19%',
    alignItems: 'center',
  },

  tagline: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(100, 35, 0, 0.3)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 6,
  },

  subTagline: {
    marginTop: 9,
    color: '#FFF5D8',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textAlign: 'center',
  },

  loadingContainer: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.94)',
    elevation: 5,
    shadowColor: '#7C2D12',
    shadowOpacity: 0.13,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
  },

  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 7,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: ORANGE,
  },

  loadingText: {
    color: '#71330D',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
});
