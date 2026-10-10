import React, {useState} from 'react';
import {
  View,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native';


import {registerUser} from '../../../api/auth';

import {
  AppInput,
  AppButton,
  AppText,
} from '../../../components';

const ORANGE = '#FF5A00';

const RegisterScreen = ({navigation, route}: any) => {
  const verifiedEmail = String(route?.params?.verifiedEmail || '').trim().toLowerCase();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] =
    useState('');
  const [passwordError, setPasswordError] =
    useState('');

  // ==========================================
  // REGISTER
  // ==========================================

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const value = phone.trim();

    setNameError('');
    setPhoneError('');
    setPasswordError('');

    // Account creation is available only after university email verification.
    if (!/^[a-zA-Z0-9._%+-]+@srmap\.edu\.in$/i.test(verifiedEmail)) {
      Alert.alert('Verify your email first', 'Please verify your @srmap.edu.in email before creating your FoodE account.', [
        {text: 'Continue', onPress: () => navigation.replace('EmailVerification')},
      ]);
      return;
    }

    // Name
    if (!trimmedName) {
      setNameError('Name is required');
      return;
    }

    if (trimmedName.length < 2) {
      setNameError('Enter a valid name');
      return;
    }

    // Mobile number validation
    if (!value) {
      setPhoneError('Mobile number is required');
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(value)) {
      setPhoneError(
        'Enter a valid 10-digit mobile number',
      );
      return;
    }

    // Password
    if (password.length < 6) {
      setPasswordError(
        'Password must be at least 6 characters',
      );
      return;
    }

    // API
    try {
      const response = await registerUser(({
        name: trimmedName,
        phone: value,
        password,
        email: verifiedEmail,
      }) as any);

      if (!response.success) {
        setPhoneError(
          response.message ||
            'Unable to create account',
        );
        return;
      }

      Alert.alert(
        'Account Created',
        'Your account has been created. Please sign in.',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Login'),
          },
        ],
      );
    } catch (error: any) {
      console.log(
        'Registration Error:',
        error.response?.data || error,
      );

      setPhoneError(
        error.response?.data?.message ||
          'Unable to connect to FoodE server',
      );
    }
  };

  return (
    <View style={styles.screen}>
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

              <View style={styles.brandLine} />

              <AppText
                style={styles.brandTagline}>
                FOOD. FAST. FRESH.
              </AppText>
            </View>

          </View>

          {/* ==================================
              REGISTER CARD
          ================================== */}

          <View style={styles.registerCard}>

            <View style={styles.handle} />

            <View style={styles.header}>
              <AppText style={styles.title}>
                Create Account
              </AppText>

              <AppText style={styles.subtitle}>
                Join FoodE and start ordering
                your favorite food.
              </AppText>
            </View>

            <View style={styles.verifiedEmailBox}>
              <AppText style={styles.verifiedEmailLabel}>Verified university email</AppText>
              <AppText style={styles.verifiedEmailValue}>{verifiedEmail || 'Not verified'}</AppText>
            </View>

            {/* =================================
                FULL NAME
            ================================= */}

            <View style={styles.field}>
              <AppInput
                label="Full Name"
                placeholder="Enter your full name"
                value={name}
                onChangeText={text => {
                  setName(text);
                  setNameError('');
                }}
                leftIcon="person-outline"
                autoCapitalize="words"
              />

              {nameError ? (
                <AppText style={styles.errorText}>
                  {nameError}
                </AppText>
              ) : null}
            </View>

            {/* =================================
                MOBILE NUMBER
            ================================= */}

            <View style={styles.field}>
              <AppInput
                label="Mobile Number"
                placeholder="Enter your 10-digit mobile number"
                value={phone}
                onChangeText={text => {
                  setPhone(text);
                  setPhoneError('');
                }}
                leftIcon="call-outline"
                keyboardType="phone-pad"
                autoCapitalize="none"
              />

              {phoneError ? (
                <AppText style={styles.errorText}>
                  {phoneError}
                </AppText>
              ) : null}
            </View>

            {/* =================================
                PASSWORD
            ================================= */}

            <View style={styles.field}>
              <AppInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  setPasswordError('');
                }}
                leftIcon="lock-closed-outline"
                secureTextEntry
                autoCapitalize="none"
              />

              {passwordError ? (
                <AppText style={styles.errorText}>
                  {passwordError}
                </AppText>
              ) : null}
            </View>

            {/* =================================
                CREATE ACCOUNT
            ================================= */}

            <AppButton
              title="Create Account"
              onPress={handleRegister}
            />

            {/* =================================
                LOGIN
            ================================= */}

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}>

              <AppText style={styles.loginText}>
                Already have an account?{' '}
                <AppText
                  style={styles.loginHighlight}>
                  Sign In
                </AppText>
              </AppText>

            </TouchableOpacity>

            {/* =================================
                VERSION
            ================================= */}

            <AppText style={styles.version}>
              Version 1.0.0
            </AppText>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterScreen;

// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({

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
  // REGISTER CARD
  // ================================================

  verifiedEmailBox: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  verifiedEmailLabel: {fontSize: 11, color: '#777777', marginBottom: 4},
  verifiedEmailValue: {fontSize: 14, fontWeight: '700', color: '#242424'},

  registerCard: {
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
    marginBottom: 18,
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#161616',
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#777777',
  },

  // ================================================
  // FIELDS
  // ================================================

  field: {
    marginBottom: 5,
  },

  errorText: {
    color: '#E53935',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 3,
    marginLeft: 5,
  },

  // ================================================
  // TERMS
  // ================================================

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 3,
  },

  termsTouchable: {
    flex: 1,
    marginLeft: 5,
  },

  checkboxText: {
    color: '#777777',
    fontSize: 13,
    lineHeight: 19,
  },

  termsError: {
    marginBottom: 8,
  },

  // ================================================
  // LOGIN
  // ================================================

  loginButton: {
    alignItems: 'center',
    marginTop: 20,
  },

  loginText: {
    color: '#777777',
    fontSize: 14,
  },

  loginHighlight: {
    color: ORANGE,
    fontWeight: '800',
  },

  // ================================================
  // VERSION
  // ================================================

  version: {
    color: '#AAAAAA',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
  },

});