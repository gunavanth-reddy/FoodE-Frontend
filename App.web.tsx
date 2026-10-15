/// <reference lib="dom" />

import React, {useEffect, useState} from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';
import {AuthProvider} from './src/context/AuthContext';
import {CartProvider} from './src/context/CartContext';
import {FavoritesProvider} from './src/context/FavoritesContext';
import {ThemeProvider} from './src/context/ThemeContext';

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.foode';

type BrowserPlatform = 'android' | 'app';

const getBrowserPlatform = (): BrowserPlatform => {
  return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)
    ? 'android'
    : 'app';
};

const AndroidStoreScreen = () => (
  <SafeAreaView style={styles.safeArea}>
    <View style={styles.content}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>FoodE</Text>
      </View>
      <Text style={styles.title}>Get the FoodE app</Text>
      <Text style={styles.description}>
        FoodE is available on Android through the Play Store. Opening it now…
      </Text>
      <Pressable
        accessibilityRole="link"
        onPress={() => window.location.assign(PLAY_STORE_URL)}
        style={styles.button}>
        <Text style={styles.buttonText}>Open Google Play</Text>
      </Pressable>
    </View>
  </SafeAreaView>
);

export default function AppWeb() {
  const {height: viewportHeight} = useWindowDimensions();
  const [browserPlatform, setBrowserPlatform] =
    useState<BrowserPlatform | null>(null);

  useEffect(() => {
    const platform = getBrowserPlatform();
    setBrowserPlatform(platform);

    if (platform === 'android') {
      window.location.replace(PLAY_STORE_URL);
    }
  }, []);

  if (browserPlatform === 'app') {
    return (
      <SafeAreaProvider>
        <View style={[styles.webPage, {minHeight: viewportHeight}]}>
          <View style={[styles.webAppFrame, {minHeight: viewportHeight}]}>
            <ThemeProvider>
              <AuthProvider>
                <CartProvider>
                  <FavoritesProvider>
                    <AppNavigator />
                  </FavoritesProvider>
                </CartProvider>
              </AuthProvider>
            </ThemeProvider>
          </View>
        </View>
      </SafeAreaProvider>
    );
  }

  return browserPlatform === 'android' ? <AndroidStoreScreen /> : null;
}

const styles = StyleSheet.create({
  webPage: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  webAppFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF7F0',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logo: {
    width: 92,
    height: 92,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B00',
    marginBottom: 28,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
  },
  title: {
    color: '#1E1E1E',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    maxWidth: 360,
    color: '#6B7280',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    borderRadius: 12,
    backgroundColor: '#FF6B00',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
