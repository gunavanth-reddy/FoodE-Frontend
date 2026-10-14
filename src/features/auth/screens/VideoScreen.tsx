import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {RootStackParamList} from '../../../navigation/AppNavigator';
import {useAuth} from '../../../context/AuthContext';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'VideoIntro'
>;

const VideoScreen = ({navigation}: Props) => {
  const {user, loading} = useAuth();

  useEffect(() => {
    // Wait until AuthContext finishes restoring the session
    if (loading) {
      return;
    }

    const timer = setTimeout(() => {
      // ================================
      // GUEST
      // ================================
      if (!user) {
        navigation.replace('Main');
        return;
      }

      // ================================
      // ADMIN
      // ================================
      if (user.role === 'admin') {
        navigation.replace('AdminDashboard');
        return;
      }

      // ================================
      // RESTAURANT OWNER
      // ================================
      if (user.role === 'restaurant_owner') {
        navigation.replace('RestaurantOwner');
        return;
      }

      // ================================
      // NORMAL CUSTOMER
      // ================================
      if (user.role === 'user') {
        navigation.replace('Main');
        return;
      }

      // ================================
      // UNKNOWN ROLE
      // ================================
      console.log('Unknown user role:', user.role);

      navigation.replace('Login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [loading, user, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>FoodE</Text>
        <Text style={styles.tagline}>Food. Delivered. Simply.</Text>

        <View style={styles.loader}>
          <View style={styles.loaderDot} />
          <View style={styles.loaderDot} />
          <View style={styles.loaderDot} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    width: '100%',
    maxWidth: 520,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },

  tagline: {
    marginTop: 8,
    fontSize: 15,
    textAlign: 'center',
    color: '#FFFFFF',
    opacity: 0.9,
  },

  loader: {
    flexDirection: 'row',
    marginTop: 35,
    gap: 7,
  },

  loaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});

export default VideoScreen;