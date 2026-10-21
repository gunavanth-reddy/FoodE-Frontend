import React, {useRef, useState, useEffect} from 'react';
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {CaretDoubleRight, ArrowRight, Check} from 'phosphor-react-native';

interface SwipeToOrderProps {
  onSwipeComplete: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  onDisabledPress?: () => void;
}

const TRACK_HEIGHT = 56;
const KNOB_SIZE = 46;
const PADDING = 5;

const SwipeToOrder: React.FC<SwipeToOrderProps> = ({
  onSwipeComplete,
  disabled = false,
  loading = false,
  label = 'Swipe to Place Order',
  onDisabledPress,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;

  // Refs to always access the latest values inside PanResponder callbacks
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  const loadingRef = useRef(loading);
  loadingRef.current = loading;

  const isCompletedRef = useRef(isCompleted);
  isCompletedRef.current = isCompleted;

  const onSwipeCompleteRef = useRef(onSwipeComplete);
  onSwipeCompleteRef.current = onSwipeComplete;

  const onDisabledPressRef = useRef(onDisabledPress);
  onDisabledPressRef.current = onDisabledPress;

  const maxTranslateRef = useRef(0);
  const maxTranslate = Math.max(0, containerWidth - KNOB_SIZE - PADDING * 2);
  maxTranslateRef.current = maxTranslate;

  // Reset knob when loading completes or disabled status toggles
  useEffect(() => {
    if (!loading && !disabled) {
      setIsCompleted(false);
      isCompletedRef.current = false;
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: false,
        friction: 7,
      }).start();
    }
  }, [loading, disabled, translateX]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,

      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (disabledRef.current || loadingRef.current || isCompletedRef.current) {
          return false;
        }
        return Math.abs(gestureState.dx) > 3;
      },
      onMoveShouldSetPanResponderCapture: () => false,

      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,

      onPanResponderGrant: () => {
        if (disabledRef.current || loadingRef.current || isCompletedRef.current) {
          return;
        }
        translateX.stopAnimation();
      },

      onPanResponderMove: (_, gestureState) => {
        if (
          disabledRef.current ||
          loadingRef.current ||
          isCompletedRef.current ||
          maxTranslateRef.current <= 0
        ) {
          return;
        }

        const newX = Math.min(
          Math.max(0, gestureState.dx),
          maxTranslateRef.current,
        );
        translateX.setValue(newX);
      },

      onPanResponderRelease: (_, gestureState) => {
        // If disabled, handle tap/press to inform user
        if (disabledRef.current) {
          if (Math.abs(gestureState.dx) < 15) {
            onDisabledPressRef.current?.();
          }
          return;
        }

        if (
          loadingRef.current ||
          isCompletedRef.current ||
          maxTranslateRef.current <= 0
        ) {
          return;
        }

        const currentMax = maxTranslateRef.current;
        const threshold = currentMax * 0.55;

        if (gestureState.dx >= threshold) {
          // Reached completion threshold: snap to end and trigger callback
          setIsCompleted(true);
          isCompletedRef.current = true;
          Animated.timing(translateX, {
            toValue: currentMax,
            duration: 150,
            useNativeDriver: false,
          }).start(() => {
            onSwipeCompleteRef.current?.();
          });
        } else if (Math.abs(gestureState.dx) < 12) {
          // User just tapped: give a playful hint animation nudging the knob right
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: 26,
              duration: 130,
              useNativeDriver: false,
            }),
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: false,
              friction: 5,
              tension: 50,
            }),
          ]).start();
        } else {
          // Release before threshold: spring back to start
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
            friction: 6,
            tension: 50,
          }).start();
        }
      },

      onPanResponderTerminate: () => {
        if (!isCompletedRef.current) {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
            friction: 6,
            tension: 50,
          }).start();
        }
      },
    }),
  ).current;

  // Text opacity fades as user slides the knob
  const textOpacity = translateX.interpolate({
    inputRange: [0, Math.max(1, maxTranslate * 0.45)],
    outputRange: [1, 0.08],
    extrapolate: 'clamp',
  });

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.track,
        disabled && styles.trackDisabled,
        loading && styles.trackLoading,
      ]}
      onLayout={e => {
        const width = e.nativeEvent.layout.width;
        if (width > 0) {
          setContainerWidth(width);
          maxTranslateRef.current = Math.max(0, width - KNOB_SIZE - PADDING * 2);
        }
      }}>
      {/* Background progress fill */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.progressFill,
          {
            width: translateX.interpolate({
              inputRange: [0, Math.max(1, maxTranslate)],
              outputRange: [KNOB_SIZE + PADDING * 2, containerWidth || 200],
              extrapolate: 'clamp',
            }),
          },
        ]}
      />

      {/* Label and arrows */}
      <Animated.View
        pointerEvents="none"
        style={[styles.labelContainer, {opacity: textOpacity}]}>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.loadingText}>Placing Order...</Text>
          </View>
        ) : (
          <View style={styles.labelRow}>
            <Text
              numberOfLines={1}
              style={[styles.labelText, disabled && styles.labelTextDisabled]}>
              {label}
            </Text>
            {!disabled && (
              <CaretDoubleRight
                size={18}
                color="#FFFFFF"
                weight="bold"
                style={styles.chevrons}
              />
            )}
          </View>
        )}
      </Animated.View>

      {/* Draggable Knob */}
      {!loading && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.knob,
            disabled && styles.knobDisabled,
            {
              transform: [{translateX}],
            },
          ]}>
          {isCompleted ? (
            <Check size={22} color="#FF5A00" weight="bold" />
          ) : (
            <ArrowRight
              size={20}
              color={disabled ? '#9CA3AF' : '#FF5A00'}
              weight="bold"
            />
          )}
        </Animated.View>
      )}
    </View>
  );
};

export default SwipeToOrder;

const styles = StyleSheet.create({
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: '#FF5A00',
    justifyContent: 'center',
    padding: PADDING,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#FF5A00',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  trackDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },

  trackLoading: {
    backgroundColor: '#E04E00',
  },

  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: TRACK_HEIGHT / 2,
  },

  labelContainer: {
    position: 'absolute',
    left: KNOB_SIZE + 10,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  labelText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  labelTextDisabled: {
    color: '#9CA3AF',
  },

  chevrons: {
    marginLeft: 6,
    opacity: 0.85,
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  loadingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 5,
  },

  knobDisabled: {
    backgroundColor: '#F3F4F6',
  },
});
