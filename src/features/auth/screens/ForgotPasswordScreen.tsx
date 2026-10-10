import React from 'react';
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Linking,
} from 'react-native';

import {
  Envelope,
  ArrowLeft,
} from 'phosphor-react-native';

import {
  AppButton,
  AppText,
} from '../../../components';

const ORANGE = '#FF5A00';

const ForgotPasswordScreen = ({
  navigation,
}: any) => {

  const handleContactSupport = async () => {
    const email = 'foodeforus@gmail.com';

    try {
      await Linking.openURL(`mailto:${email}`);
    } catch (error) {
      console.log(
        'Unable to open email:',
        error,
      );
    }
  };

  return (
    <View style={styles.screen}>

      {/* ======================================
          STATUS BAR
      ====================================== */}

      <StatusBar
        barStyle="light-content"
        backgroundColor={ORANGE}
        translucent={false}
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={
            styles.scrollContent
          }>

          {/* ==================================
              HERO
          ================================== */}

          <View style={styles.hero}>

            <View
              style={styles.heroCircleLarge}
            />

            <View
              style={styles.heroCircleSmall}
            />

            <View style={styles.heroDot} />

            <View style={styles.heroLine} />

            <View style={styles.brand}>

              <AppText
                style={styles.brandText}>
                FoodE
              </AppText>

              <View
                style={styles.brandLine}
              />

              <AppText
                style={styles.brandTagline}>
                FOOD. FAST. FRESH.
              </AppText>

            </View>

          </View>

          {/* ==================================
              CONTACT CARD
          ================================== */}

          <View style={styles.contactCard}>

            {/* Handle */}

            <View style={styles.handle} />

            {/* =================================
                HEADER
            ================================= */}

            <View style={styles.header}>

              <AppText
                style={styles.title}>
                Forgot Password?
              </AppText>

              <AppText
                style={styles.subtitle}>
                Having trouble accessing your
                FoodE account? Contact us and
                we'll help you.
              </AppText>

            </View>

            {/* =================================
                CONTACT US
            ================================= */}

            <View style={styles.contactBox}>

              <View style={styles.emailIconContainer}>

                <Envelope
                  size={28}
                  color={ORANGE}
                  weight="regular"
                />

              </View>

              <AppText
                style={styles.contactTitle}>
                Contact Us
              </AppText>

              <AppText
                style={styles.contactDescription}>
                For password assistance, please
                contact FoodE support.
              </AppText>

              <TouchableOpacity
                activeOpacity={0.75}
                style={styles.emailButton}
                onPress={handleContactSupport}>

                <Envelope
                  size={20}
                  color="#FFFFFF"
                  weight="fill"
                />

                <AppText
                  style={styles.emailText}>
                  foodeforus@gmail.com
                </AppText>

              </TouchableOpacity>

            </View>

            {/* =================================
                BACK TO LOGIN
            ================================= */}

            <AppButton
              title="Back to Login"
              onPress={() =>
                navigation.goBack()
              }
            />

            {/* =================================
                VERSION
            ================================= */}

            <AppText
              style={styles.version}>
              Version 1.0.0
            </AppText>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </View>
  );
};

export default ForgotPasswordScreen;


// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({

  // ================================================
  // SCREEN
  // ================================================

  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },

  // ================================================
  // HERO
  // ================================================

  hero: {
    minHeight: 190,
    backgroundColor: ORANGE,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  // ================================================
  // BRAND
  // ================================================

  brand: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  brandText: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -2.5,
  },

  brandLine: {
    width: 42,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
  },

  brandTagline: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.2,
    marginTop: 8,
  },

  // ================================================
  // HERO DECORATION
  // ================================================

  heroCircleLarge: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.12)',
    right: -80,
    top: -105,
  },

  heroCircleSmall: {
    position: 'absolute',
    width: 75,
    height: 75,
    borderRadius: 38,
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.14)',
    left: -25,
    bottom: -30,
  },

  heroDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor:
      'rgba(255,255,255,0.25)',
    left: 65,
    top: 100,
  },

  heroLine: {
    position: 'absolute',
    width: 75,
    height: 1,
    backgroundColor:
      'rgba(255,255,255,0.16)',
    right: 55,
    bottom: 65,
    transform: [
      {
        rotate: '-35deg',
      },
    ],
  },

  // ================================================
  // CONTACT CARD
  // ================================================

  contactCard: {
    backgroundColor: '#FFFFFF',

    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,

    paddingHorizontal: 20,
    paddingTop: 13,
    paddingBottom: 30,

    marginTop: -28,

    elevation: 8,

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: -4,
    },

    shadowOpacity: 0.08,
    shadowRadius: 14,
  },

  handle: {
    width: 38,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#E2E2E2',
    alignSelf: 'center',
    marginBottom: 18,
  },

  // ================================================
  // HEADER
  // ================================================

  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#161616',
    marginBottom: 7,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#777777',
  },

  // ================================================
  // CONTACT BOX
  // ================================================

  contactBox: {
    alignItems: 'center',

    backgroundColor: '#FFF7F0',

    borderRadius: 20,

    paddingHorizontal: 18,
    paddingVertical: 24,

    marginBottom: 24,

    borderWidth: 1,
    borderColor: '#FFE4D0',
  },

  emailIconContainer: {
    width: 58,
    height: 58,

    borderRadius: 29,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFE9D9',

    marginBottom: 14,
  },

  contactTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#161616',
    marginBottom: 7,
  },

  contactDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: '#777777',
    marginBottom: 18,
  },

  emailButton: {
    width: '100%',

    minHeight: 52,

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: ORANGE,

    borderRadius: 14,

    paddingHorizontal: 14,
  },

  emailText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 9,
  },

  // ================================================
  // VERSION
  // ================================================

  version: {
    color: '#AAAAAA',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 22,
  },

});