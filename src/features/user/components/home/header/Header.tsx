import React, {useEffect, useRef} from 'react';
import {Animated, Easing, Pressable, StyleSheet, Text, View} from 'react-native';
import {MapPin, User, Bell} from 'phosphor-react-native';
import {useNavigation} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CompositeNavigationProp} from '@react-navigation/native';
import {BottomTabParamList} from '../../../../../navigation/BottomTabNavigator';
import {RootStackParamList} from '../../../../../navigation/AppNavigator';

type HeaderNavigationProp = CompositeNavigationProp<BottomTabNavigationProp<BottomTabParamList>, NativeStackNavigationProp<RootStackParamList>>;
const ORANGE = '#FF6B00';

const Header: React.FC = () => {
  const navigation = useNavigation<HeaderNavigationProp>();
  const entrance = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(entrance, {toValue: 1, friction: 8, tension: 65, useNativeDriver: true}).start();
    return () => entrance.stopAnimation();
  }, [entrance]);
  const translateY = entrance.interpolate({inputRange: [0, 1], outputRange: [-12, 0]});

  return (
    <Animated.View style={[styles.header, {opacity: entrance, transform: [{translateY}]}]}>
      <View style={styles.brandBlock}>
        <Text style={styles.brand}>FoodE</Text>
        <View style={styles.locationRow}>
          <MapPin size={14} color="#FFE4D2" weight="fill" />
          <Text style={styles.location} numberOfLines={1}>Delivering to SRM AP, Neerukonda</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications" onPress={() => navigation.navigate('Notifications')} style={({pressed}) => [styles.action, pressed && styles.pressed]}>
          <Bell size={23} color="#FFFFFF" weight="regular" />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Open profile" onPress={() => navigation.navigate('Profile')} style={({pressed}) => [styles.profile, pressed && styles.pressed]}>
          <User size={25} color="#FFFFFF" weight="fill" />
        </Pressable>
      </View>
    </Animated.View>
  );
};
export default Header;

const styles = StyleSheet.create({
  header: {width: '100%', minHeight: 78, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 8, paddingBottom: 12, backgroundColor: ORANGE, elevation: 4},
  brandBlock: {flex: 1, minWidth: 0, paddingRight: 10},
  brand: {fontSize: 27, lineHeight: 32, color: '#FFFFFF', fontWeight: '900', letterSpacing: -0.8},
  locationRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 5},
  location: {fontSize: 11, fontWeight: '600', color: '#FFE4D2', flexShrink: 1},
  actions: {flexDirection: 'row', alignItems: 'center', gap: 7},
  action: {width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21},
  profile: {width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)'},
  pressed: {opacity: 0.78, transform: [{scale: 0.94}], backgroundColor: 'rgba(255,255,255,0.2)'},
});
