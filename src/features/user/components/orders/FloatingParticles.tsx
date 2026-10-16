import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';

const {width, height} = Dimensions.get('window');

const FloatingCircle = ({
  size,
  left,
  top,
  color,
  duration,
}: {
  size: number;
  left: number;
  top: number;
  color: string;
  duration: number;
}) => {
  const translateY = useRef(
    new Animated.Value(0),
  ).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -20,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [duration, translateY]);

  return (
    <Animated.View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left,
          top,
          backgroundColor: color,
          transform: [{translateY}],
        },
      ]}
    />
  );
};

const FloatingParticles = () => {
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}>
      <FloatingCircle
        size={22}
        left={30}
        top={120}
        color="rgba(255,122,0,0.15)"
        duration={2400}
      />

      <FloatingCircle
        size={16}
        left={width - 70}
        top={180}
        color="rgba(22,163,74,0.15)"
        duration={2000}
      />

      <FloatingCircle
        size={28}
        left={60}
        top={height - 260}
        color="rgba(255,122,0,0.12)"
        duration={2800}
      />

      <FloatingCircle
        size={18}
        left={width - 90}
        top={height - 320}
        color="rgba(22,163,74,0.12)"
        duration={2500}
      />

      <FloatingCircle
        size={14}
        left={width / 2}
        top={90}
        color="rgba(255,122,0,0.18)"
        duration={2300}
      />
    </View>
  );
};

export default FloatingParticles;

const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
  },
});
