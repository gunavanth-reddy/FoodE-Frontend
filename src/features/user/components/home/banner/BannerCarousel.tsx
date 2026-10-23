import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Alert,
  FlatList,
  LayoutChangeEvent,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';

import BannerCard from './BannerCard';
import {baseBannerData, type BannerItem} from './bannerData';

const AUTO_SCROLL_INTERVAL = 3500;
const bannerData = [...baseBannerData, ...baseBannerData];
const BASE_COUNT = baseBannerData.length;

// =====================================================
// COMPONENT
// =====================================================

const BannerCarousel: React.FC = () => {
  const flatListRef = useRef<FlatList>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerWidthRef = useRef(0);

  const scrollX = useRef(
    new Animated.Value(0),
  ).current;

  const currentIndex = useRef(0);

  const [activeIndex, setActiveIndex] =
    useState(0);

  const timer = useRef<
    ReturnType<typeof setInterval> | null
  >(null);

  // =====================================================
  // STOP AUTO SCROLL
  // =====================================================

  const stopAutoScroll = useCallback(() => {
    if (timer.current !== null) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  // =====================================================
  // START AUTO SCROLL
  // =====================================================

  const startAutoScroll = useCallback(() => {
    stopAutoScroll();

    if (
      bannerData.length <= 1 ||
      containerWidth === 0 ||
      containerWidthRef.current === 0
    ) {
      return;
    }

    timer.current = setInterval(() => {
      const nextIndex = currentIndex.current + 1;

      if (nextIndex >= bannerData.length) {
        currentIndex.current = 0;
        setActiveIndex(0);
        flatListRef.current?.scrollToIndex({
          index: 0,
          animated: false,
        });
        return;
      }

      currentIndex.current = nextIndex;
      setActiveIndex(nextIndex % BASE_COUNT);

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, AUTO_SCROLL_INTERVAL);
  }, [containerWidth, stopAutoScroll]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const measuredWidth = event.nativeEvent.layout.width;
    if (measuredWidth > 0 && measuredWidth !== containerWidthRef.current) {
      containerWidthRef.current = measuredWidth;
      setContainerWidth(measuredWidth);
    }
  };

  // =====================================================
  // AUTO SCROLL LIFECYCLE
  // =====================================================

  useEffect(() => {
    startAutoScroll();

    return () => {
      stopAutoScroll();
    };
  }, [startAutoScroll, stopAutoScroll]);

  // =====================================================
  // MOMENTUM SCROLL
  // =====================================================

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (!containerWidthRef.current) {
      return;
    }
    const offsetX =
      event.nativeEvent.contentOffset.x;

    const index = Math.round(
      offsetX / containerWidthRef.current,
    );

    const safeIndex = Math.max(
      0,
      Math.min(index, bannerData.length - 1),
    );

    currentIndex.current = safeIndex;
    setActiveIndex(safeIndex % BASE_COUNT);

    startAutoScroll();
  };

  const handleBannerPress = useCallback((url?: string) => {
    if (!url) {
      return;
    }

    Linking.openURL(url).catch(error => {
      console.error('FoodE: Unable to open banner link:', error);
      Alert.alert(
        'Unable to Open Link',
        'Please try opening the WhatsApp channel again.',
      );
    });
  }, []);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <View onLayout={handleLayout} style={styles.container}>
      {containerWidth > 0 ? (
        <Animated.FlatList
          ref={flatListRef}
          data={bannerData}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({item}) => (
            <BannerCard
              image={item.image}
              width={containerWidth}
              onPress={
                item.link
                  ? () => handleBannerPress(item.link)
                  : undefined
              }
            />
          )}
          onScrollBeginDrag={stopAutoScroll}
          onMomentumScrollEnd={onMomentumScrollEnd}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: {
                    x: scrollX,
                  },
                },
              },
            ],
            {useNativeDriver: false},
          )}
          getItemLayout={(_, index) => ({
            length: containerWidth,
            offset: containerWidth * index,
            index,
          })}
          onScrollToIndexFailed={info => {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
              });
            }, 300);
          }}
        />
      ) : null}

      {/* PAGINATION DOTS */}

      {baseBannerData.length > 1 && (
        <View style={styles.pagination}>
          {baseBannerData.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.dot,
                index === activeIndex &&
                  styles.activeDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default BannerCarousel;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
    maxWidth: 640,
    position: 'relative',
    marginBottom: 12,
    overflow: 'hidden',
  },

  pagination: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
    backgroundColor:
      'rgba(255,255,255,0.55)',
  },

  activeDot: {
    width: 18,
    backgroundColor: '#FFFCF8',
  },
});
