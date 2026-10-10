import {useEffect, useRef} from 'react';
import {
  Animated,
  Easing,
} from 'react-native';

const useSuccessAnimation = () => {
  const titleOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const cardTranslateY = useRef(
    new Animated.Value(60),
  ).current;

  const cardOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const buttonsTranslateY = useRef(
    new Animated.Value(60),
  ).current;

  const buttonsOpacity = useRef(
    new Animated.Value(0),
  ).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(400),

      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),

        Animated.timing(cardTranslateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),

        Animated.timing(buttonsTranslateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return {
    titleOpacity,

    cardOpacity,
    cardTranslateY,

    buttonsOpacity,
    buttonsTranslateY,
  };
};

export default useSuccessAnimation;
