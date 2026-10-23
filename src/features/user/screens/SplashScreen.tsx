
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

const SplashScreen = ({navigation}: any) => {
  const {user, token, loading} = useAuth();

  const imageOpacity = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(1.08)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.65)).current;
  const titleY = useRef(new Animated.Value(24)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.7)).current;
  const glowOpacity = useRef(new Animated.Value(0.1)).current;
  const dotOpacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const entrance = Animated.sequence([
      Animated.parallel([
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: 900,
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
        Animated.spring(titleScale, {
          toValue: 1,
          friction: 5,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 550,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    ]);

    entrance.start();

    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowScale, {
            toValue: 1.08,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.24,
            duration: 1100,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(glowScale, {
            toValue: 0.7,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.1,
            duration: 1100,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    const dotsAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(dotOpacity, {
          toValue: 0.35,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );

    glowAnimation.start();
    dotsAnimation.start();

    return () => {
      entrance.stop();
      glowAnimation.stop();
      dotsAnimation.stop();
    };
  }, [
    imageOpacity,
    imageScale,
    titleOpacity,
    titleScale,
    titleY,
    taglineOpacity,
    glowScale,
    glowOpacity,
    dotOpacity,
  ]);

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      if (!user || !token) {
        navigation.replace('Login');
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
      <StatusBar backgroundColor="#FF7A00" barStyle="light-content" hidden={false} translucent={false} />

      {/* Full-screen FoodE splash image */}
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
          accessibilityLabel="FoodE splash background"
        />
      </Animated.View>

      {/* Soft animated glow */}
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

      {/* Animated brand name */}
      <View pointerEvents="none" style={styles.brandContainer}>
        <Animated.Text
          style={[
            styles.brandName,
            {
              opacity: titleOpacity,
              transform: [
                {scale: titleScale},
                {translateY: titleY},
              ],
            },
          ]}>
          Food<Text style={styles.brandAccent}>E</Text>
        </Animated.Text>

        <Animated.Text
          style={[styles.tagline, {opacity: taglineOpacity}]}>
          Good food. Good mood.
        </Animated.Text>
      </View>

      {/* Animated loading indicator */}
      <View style={styles.loadingPill}>
        <Animated.View
          style={[styles.loadingDot, {opacity: dotOpacity}]}
        />
        <Text style={styles.loadingText}>
          Fresh food. Coming right up.
        </Text>
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6500',
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
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: '#FFF5A5',
  },

  brandContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: '21%',
    alignItems: 'center',
  },

  brandName: {
    fontSize: 43,
    lineHeight: 52,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.5,
    textShadowColor: 'rgba(100, 35, 0, 0.2)',
    textShadowOffset: {width: 0, height: 3},
    textShadowRadius: 8,
  },

  brandAccent: {
    color: '#FFF176',
  },

  tagline: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: '#FFFFFF',
  },

  loadingPill: {
    position: 'absolute',
    bottom: 42,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    elevation: 5,
    shadowColor: '#7C2D12',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
  },

  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6500',
    marginRight: 9,
  },

  loadingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#66300D',
    letterSpacing: 0.2,
  },
});
