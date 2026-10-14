import React from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
  useWindowDimensions,
} from 'react-native';

import {AppText, AppButton} from '../../../components';

const ORANGE = '#FF5A00';
const DARK = '#171717';
const SUPPORT_EMAIL = 'foodeforus@gmail.com';

const ForgotPasswordScreen = ({navigation}: any) => {
  const {height: screenHeight, width: screenWidth} =
    useWindowDimensions();

  const heroHeight = Math.max(
    225,
    Math.min(screenHeight * 0.32, 290),
  );

  const handleContactSupport = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      'FoodE Password Assistance',
    )}`;

    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Email unavailable',
          `Please contact FoodE support at ${SUPPORT_EMAIL}`,
        );
      }
    } catch {
      Alert.alert(
        'Contact FoodE Support',
        `Please email ${SUPPORT_EMAIL} for password assistance.`,
      );
    }
  };

  const handleBackToLogin = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        hidden={false}
        translucent={false}
        backgroundColor={ORANGE}
        barStyle="light-content"
      />

      {/* Orange FoodE header */}
      <View style={[styles.hero, {height: heroHeight}]}>
        {/* Decorative elements */}
        <View style={styles.heroCircleLarge} />
        <View style={styles.heroCircleSmall} />
        <View style={styles.heroDot} />
        <View style={styles.heroLine} />

        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.75}
          onPress={handleBackToLogin}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <AppText style={styles.backArrow}>‹</AppText>
        </TouchableOpacity>

        {/* Brand */}
        <View style={styles.brand}>
          <AppText style={styles.brandText}>FoodE</AppText>

          <View style={styles.brandLine} />

          <AppText style={styles.brandTagline}>
            FOOD. FAST. FRESH.
          </AppText>
        </View>
      </View>

      {/* Full-screen white card */}
      <KeyboardAvoidingView
        style={styles.card}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.cardContent,
            {
              minHeight: Math.max(
                0,
                screenHeight - heroHeight + 28,
              ),
              paddingHorizontal: screenWidth < 360 ? 18 : 24,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          overScrollMode="never">

          {/* Handle */}
          <View style={styles.handle} />

          {/* Heading */}
          <View style={styles.header}>
            <AppText style={styles.title}>
              Forgot Password?
            </AppText>

            <AppText style={styles.subtitle}>
              Having trouble accessing your FoodE account?
              {'\n'}
              Contact us and we'll help you get back on track.
            </AppText>
          </View>

          {/* Contact support card */}
          <View style={styles.contactCard}>
            {/* Email icon */}
            <View style={styles.emailIconContainer}>
              <AppText style={styles.emailIcon}>✉</AppText>
            </View>

            <AppText style={styles.contactTitle}>
              Contact Us
            </AppText>

            <AppText style={styles.contactDescription}>
              For password assistance, please contact FoodE
              support.
            </AppText>

            {/* Email button */}
            <TouchableOpacity
              style={styles.emailButton}
              activeOpacity={0.85}
              onPress={handleContactSupport}
              accessibilityRole="button"
              accessibilityLabel={`Email ${SUPPORT_EMAIL}`}>
              <AppText style={styles.emailButtonIcon}>
                ✉
              </AppText>

              <AppText style={styles.emailButtonText}>
                {SUPPORT_EMAIL}
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Back to login */}
          <View style={styles.loginButtonContainer}>
            <AppButton
              title="Back to Login"
              onPress={handleBackToLogin}
            />
          </View>

          {/* Footer stays near the bottom */}
          <View style={styles.footer}>
            <AppText style={styles.version}>
              Version 1.0.0
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ORANGE,
  },

  // Orange branding header
  hero: {
    width: '100%',
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  brand: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },

  brandText: {
    color: '#FFF0DF',
    fontSize: 62,
    fontWeight: '900',
    letterSpacing: -2.5,
  },

  brandLine: {
    width: 72,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#FFF0DF',
    marginTop: 7,
  },

  brandTagline: {
    color: '#FFF0DF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: 10,
  },

  // Header decorations
  heroCircleLarge: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
    right: -80,
    top: -100,
  },

  heroCircleSmall: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    left: -40,
    bottom: -25,
  },

  heroDot: {
    position: 'absolute',
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.25)',
    left: '17%',
    top: '57%',
  },

  heroLine: {
    position: 'absolute',
    width: 120,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.17)',
    right: 45,
    bottom: 55,
    transform: [{rotate: '-35deg'}],
  },

  // Back arrow
  backButton: {
    position: 'absolute',
    top: 20,
    left: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  backArrow: {
    color: '#FFFFFF',
    fontSize: 43,
    lineHeight: 46,
    marginTop: -5,
    fontWeight: '400',
  },

  // Full-height white card
  card: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    marginTop: -28,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    overflow: 'hidden',
    elevation: 0,
  },

  scrollView: {
    flex: 1,
  },

  cardContent: {
    flexGrow: 1,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 18 : 14,
  },

  handle: {
    width: 70,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 23,
  },

  // Heading
  header: {
    marginBottom: 25,
  },

  title: {
    color: DARK,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.8,
  },

  subtitle: {
    color: '#777777',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 9,
  },

  // Contact card
  contactCard: {
    width: '100%',
    backgroundColor: '#FFF8F0',
    borderWidth: 1.5,
    borderColor: '#F9E8D6',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 24,
    alignItems: 'center',
  },

  emailIconContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFEBD6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  emailIcon: {
    color: ORANGE,
    fontSize: 36,
  },

  contactTitle: {
    color: DARK,
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },

  contactDescription: {
    color: '#777777',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 23,
  },

  emailButton: {
    width: '100%',
    minHeight: 60,
    backgroundColor: ORANGE,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },

  emailButtonIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    marginRight: 10,
  },

  emailButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    flexShrink: 1,
    textAlign: 'center',
  },

  // Back to login
  loginButtonContainer: {
    marginTop: 23,
  },

  // Bottom footer
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 25,
  },

  version: {
    color: '#B0B0B0',
    fontSize: 13,
    textAlign: 'center',
  },
});
