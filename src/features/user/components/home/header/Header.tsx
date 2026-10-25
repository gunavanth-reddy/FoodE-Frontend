import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {MapPin, User, Bell, CaretDown} from 'phosphor-react-native';
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

const ORANGE = '#FF7A00';
const LIGHT_ORANGE = '#FFF2EA';

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
    outputRange: [-6, 0],
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
      {/* Delivery location */}
      <View style={styles.locationSection}>
        <View style={styles.locationIcon}>
          <MapPin size={19} color={ORANGE} weight="fill" />
        </View>

        <View style={styles.locationTextBlock}>
          <View style={styles.labelRow}>
            <Text style={styles.deliverLabel}>DELIVERING TO</Text>
          </View>

          <View style={styles.locationRow}>
            <Text style={styles.location} numberOfLines={1}>
              SRM AP, Neerukonda
            </Text>
            <CaretDown size={14} color={ORANGE} weight="bold" style={styles.caretIcon} />
          </View>
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
          <Bell size={20} color="#1E232C" weight="regular" />
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
          <User size={20} color={ORANGE} weight="fill" />
        </Pressable>
      </View>
    </Animated.View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  /* ---------------------------------- */
  /* LOCATION                           */
  /* ---------------------------------- */

  locationSection: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },

  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LIGHT_ORANGE,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#FFE2D1',
  },

  locationTextBlock: {
    flex: 1,
    minWidth: 0,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  deliverLabel: {
    fontSize: 10,
    lineHeight: 14,
    color: '#9CA3AF',
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  location: {
    fontSize: 15,
    lineHeight: 20,
    color: '#1E232C',
    fontWeight: '800',
  },

  caretIcon: {
    marginLeft: 4,
  },

  /* ---------------------------------- */
  /* ACTIONS                            */
  /* ---------------------------------- */

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: ORANGE,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  profileButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: LIGHT_ORANGE,
    borderWidth: 1,
    borderColor: '#FFE2D1',
  },

  pressed: {
    opacity: 0.75,
    transform: [{scale: 0.95}],
  },
});