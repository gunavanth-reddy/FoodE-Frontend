import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {ArrowLeft, UserCircle, Bell, ShoppingCart} from 'phosphor-react-native';
import {useNavigation} from '@react-navigation/native';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  home?: boolean;
  restaurantName?: string;
  rightAction?: React.ReactNode;
  onBackPress?: () => void;
  onProfilePress?: () => void;
  onCartPress?: () => void;
  onNotificationPress?: () => void;
  backgroundColor?: string;
  titleColor?: string;
}

const ORANGE = '#FF6B00';

/** Consistent, responsive FoodE app bar inspired by WhatsApp's compact header. */
const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  home = false,
  restaurantName,
  rightAction,
  onBackPress,
  onProfilePress,
  onCartPress,
  onNotificationPress,
  backgroundColor = ORANGE,
  titleColor = '#FFFFFF',
}) => {
  const navigation = useNavigation<any>();
  const {width} = useWindowDimensions();
  const compact = width < 360;
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const canGoBack = showBack && (Boolean(onBackPress) || navigation.canGoBack());
  const handleBack = () => {
    if (onBackPress) onBackPress();
    else if (navigation.canGoBack()) navigation.goBack();
  };
  const openProfile = () => {
    if (onProfilePress) onProfilePress();
    else navigation.navigate('Profile');
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {backgroundColor, opacity: entrance, transform: [{translateY: entrance.interpolate({inputRange: [0, 1], outputRange: [-8, 0]})}]},
      ]}>
      <View style={styles.row}>
        {canGoBack && !home ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={handleBack} style={({pressed}) => [styles.iconButton, styles.backButton, pressed && styles.pressed]}>
            <ArrowLeft size={compact ? 21 : 23} color={titleColor} weight="bold" />
          </Pressable>
        ) : null}
        <View style={styles.titleBlock}>
          <Text style={[styles.title, {color: titleColor, fontSize: compact ? 22 : 25}]} numberOfLines={1}>
            {home ? 'FoodE' : (restaurantName || title)}
          </Text>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        {rightAction ? <View style={styles.customAction}>{rightAction}</View> : home ? (
          <View style={styles.actions}>
            {onNotificationPress ? <Pressable accessibilityRole="button" accessibilityLabel="Notifications" onPress={onNotificationPress} style={({pressed}) => [styles.iconButton, pressed && styles.pressed]}><Bell size={23} color={titleColor} weight="regular" /></Pressable> : null}
            {onCartPress ? <Pressable accessibilityRole="button" accessibilityLabel="Cart" onPress={onCartPress} style={({pressed}) => [styles.iconButton, pressed && styles.pressed]}><ShoppingCart size={23} color={titleColor} weight="regular" /></Pressable> : null}
            <Pressable accessibilityRole="button" accessibilityLabel="Open profile" onPress={openProfile} style={({pressed}) => [styles.iconButton, pressed && styles.pressed]}><UserCircle size={27} color={titleColor} weight="regular" /></Pressable>
          </View>
        ) : <View style={styles.rightSpacer} />}
      </View>
    </Animated.View>
  );
};

export default ScreenHeader;

const styles = StyleSheet.create({
  container: {width: '100%', paddingHorizontal: 16, paddingTop: 9, paddingBottom: 11, zIndex: 10, elevation: 3},
  row: {minHeight: 45, flexDirection: 'row', alignItems: 'center'},
  titleBlock: {flex: 1, minWidth: 0, justifyContent: 'center'},
  title: {fontWeight: '800', letterSpacing: -0.45},
  subtitle: {fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.78)', marginTop: 2},
  actions: {flexDirection: 'row', alignItems: 'center', marginLeft: 8, gap: 3},
  iconButton: {width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center'},
  backButton: {marginRight: 10},
  customAction: {marginLeft: 8},
  rightSpacer: {width: 8},
  pressed: {backgroundColor: 'rgba(255,255,255,0.18)', transform: [{scale: 0.94}]},
});
