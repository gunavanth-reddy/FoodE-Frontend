import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const SuccessAnimation = () => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initial success animation
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),

      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Subtle continuous pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.04,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(pulse, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  }, [opacity, pulse, scale]);

  return (
    <View style={styles.container}>
      {/* Outer glow */}
      <Animated.View
        style={[
          styles.glow,
          {
            opacity,
            transform: [{scale: pulse}],
          },
        ]}
      />

      {/* Success circle */}
      <Animated.View
        style={[
          styles.circle,
          {
            opacity,
            transform: [
              {scale},
              {scale: pulse},
            ],
          },
        ]}>
        <Text style={styles.tick}>✓</Text>
      </Animated.View>
    </View>
  );
};

export default SuccessAnimation;

const styles = StyleSheet.create({
  container: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },

  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E9F9EE',
  },

  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,

    backgroundColor: '#16A34A',

    justifyContent: 'center',
    alignItems: 'center',

    elevation: 10,

    shadowColor: '#16A34A',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },

  tick: {
    fontSize: 60,
    color: '#FFFFFF',
    fontWeight: '700',

    marginTop: -3,
  },
});
