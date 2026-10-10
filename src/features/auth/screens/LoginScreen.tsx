import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native';

import {loginUser} from '../../../api/auth';

import {
  AppInput,
  AppButton,
  AppText,
} from '../../../components';

import {
  useAuth,
  normalizeUserRole,
} from '../../../context/AuthContext';

const ORANGE = '#FF5A00';

const LoginScreen = ({navigation}: any) => {
  const {login} = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [identifierError, setIdentifierError] =
    useState('');

  const [passwordError, setPasswordError] =
    useState('');

  // ==========================================
  // SIMPLE FOOD E ANIMATION
  // ==========================================

  const logoScale = useRef(
    new Animated.Value(0.88),
  ).current;

  const logoOpacity = useRef(
    new Animated.Value(0),
  ).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 1,
            duration: 700,
            easing: Easing.out(Easing.back(1.4)),
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 700,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(900),
        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 0.94,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 0.82,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(500),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [logoOpacity, logoScale]);

  // ==========================================
  // LOGIN
  // ==========================================

  const handleLogin = async () => {
    const value = identifier.trim();

    // Clear old errors
    setIdentifierError('');
    setPasswordError('');

    // ========================================
    // REQUIRED FIELDS
    // ========================================

    if (!value) {
      setIdentifierError(
        'Phone number is required',
      );
      return;
    }

    if (!password.trim()) {
      setPasswordError(
        'Password is required',
      );
      return;
    }

    // ========================================
    // PHONE VALIDATION
    // ========================================

    const phoneRegex =
      /^[0-9]{10}$/;

    if (!phoneRegex.test(value)) {
      setIdentifierError(
        'Enter a valid 10-digit phone number',
      );
      return;
    }

    // ========================================
    // API LOGIN
    // ========================================

    try {
      const loginData = {
        phone: value,
        password,
      };

      const response =
        await loginUser(loginData);

      // ======================================
      // BACKEND ERROR
      // ======================================

      if (!response.success) {
        setIdentifierError(
          response.message ||
            'Wrong phone number',
        );
        return;
      }

      // ======================================
      // CHECK LOGIN RESPONSE
      // ======================================

      if (
        !response.user ||
        !response.token
      ) {
        setIdentifierError(
          'Invalid login response from server',
        );
        return;
      }

      // ======================================
      // NORMALIZE USER ROLE
      // ======================================

      const normalizedRole =
        normalizeUserRole(
          response.user.role,
        );

      if (!normalizedRole) {
        setIdentifierError(
          'Invalid user role',
        );

        return;
      }

      // ======================================
      // SAVE USER + JWT
      // ======================================

      const normalizedUser = {
        ...response.user,
        role: normalizedRole,
      };

      await login(
        normalizedUser,
        response.token,
      );

      // ======================================
      // ROLE-BASED NAVIGATION
      // ======================================

      // RESTAURANT OWNER
      if (
        normalizedRole ===
        'restaurant_owner'
      ) {
        navigation.replace(
          'RestaurantOwner',
        );

        return;
      }

      // NORMAL CUSTOMER
      if (
        normalizedRole === 'user'
      ) {
        navigation.replace('Main');

        return;
      }

      // ADMIN
      if (
        normalizedRole === 'admin'
      ) {
        navigation.replace(
          'AdminDashboard',
        );

        return;
      }

      // UNKNOWN ROLE
      setIdentifierError(
        'Invalid user role',
      );

    } catch (error: any) {
      console.log(
        'Login Error:',
        error.response?.data ||
          error.message,
      );

      const status =
        error.response?.status;

      const message =
        error.response?.data?.message;

      // ======================================
      // WRONG EMAIL / PHONE
      // ======================================

      if (
        status === 404 ||
        message === 'User not found'
      ) {
        setIdentifierError(
          'Wrong phone number',
        );
        return;
      }

      // ======================================
      // WRONG PASSWORD
      // ======================================

      if (
        status === 401 ||
        message === 'Invalid Password'
      ) {
        setPasswordError(
          'Wrong password',
        );
        return;
      }

      // ======================================
      // SERVER / NETWORK ERROR
      // ======================================

      setIdentifierError(
        'Unable to connect to FoodE server',
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
        }
      >

        {/* ====================================
            EVERYTHING SCROLLS TOGETHER
        ==================================== */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={
            styles.scrollContent
          }
        >

          {/* ==================================
              FOOD E HERO
          ================================== */}

          <View style={styles.hero}>

            {/* Decorative elements */}

            <View
              style={
                styles.heroCircleLarge
              }
            />

            <View
              style={
                styles.heroCircleSmall
              }
            />

            <View
              style={styles.heroDot}
            />

            <View
              style={styles.heroLine}
            />

            {/* Brand */}

            <Animated.View
              style={[
                styles.brand,
                {
                  opacity: logoOpacity,
                  transform: [
                    {scale: logoScale},
                  ],
                },
              ]}
            >

              <AppText
                style={styles.brandText}
              >
                FoodE
              </AppText>

              <View
                style={styles.brandLine}
              />

              <AppText
                style={
                  styles.brandTagline
                }
              >
                FOOD. FAST. FRESH.
              </AppText>

            </Animated.View>

          </View>

          {/* ==================================
              LOGIN CARD
          ================================== */}

          <View
            style={styles.loginCard}
          >

            {/* Handle */}

            <View
              style={styles.handle}
            />

            {/* =================================
                HEADER
            ================================= */}

            <View
              style={styles.header}
            >

              <AppText
                style={styles.title}
              >
                Welcome Back
              </AppText>

              <AppText
                style={styles.subtitle}
              >
                Sign in to continue ordering
                your favorite food.
              </AppText>

            </View>

            {/* =================================
                EMAIL / PHONE
            ================================= */}

            <View
              style={styles.field}
            >

              <AppInput
                label="Phone Number"
                placeholder="Enter your 10-digit phone number"
                value={identifier}
                onChangeText={text => {
                  setIdentifier(
                    text.replace(/[^0-9]/g, ''),
                  );
                  setIdentifierError('');
                }}
                leftIcon="call-outline"
                keyboardType="phone-pad"
              />

              {identifierError ? (
                <AppText
                  style={
                    styles.errorText
                  }
                >
                  {identifierError}
                </AppText>
              ) : null}

            </View>

            {/* =================================
                PASSWORD
            ================================= */}

            <View
              style={styles.field}
            >

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
                <AppText
                  style={
                    styles.errorText
                  }
                >
                  {passwordError}
                </AppText>
              ) : null}

            </View>

            {/* =================================
                FORGOT PASSWORD
            ================================= */}

            <TouchableOpacity
              activeOpacity={0.7}
              style={
                styles.forgotButton
              }
              onPress={() =>
                navigation.navigate(
                  'ForgotPassword',
                )
              }
            >

              <AppText
                style={
                  styles.forgotText
                }
              >
                Forgot Password?
              </AppText>

            </TouchableOpacity>

            {/* =================================
                CONTINUE
            ================================= */}

            <AppButton
              title="Continue"
              onPress={handleLogin}
            />

            {/* =================================
                DIVIDER
            ================================= */}

            <View
              style={
                styles.dividerContainer
              }
            >

              <View
                style={styles.divider}
              />

              <AppText
                style={styles.orText}
              >
                OR
              </AppText>

              <View
                style={styles.divider}
              />

            </View>

            {/* =================================
                REGISTER
            ================================= */}

            <TouchableOpacity
              activeOpacity={0.7}
              style={
                styles.registerButton
              }
              onPress={() =>
                navigation.navigate(
                  'EmailVerification',
                )
              }
            >

              <AppText
                style={
                  styles.registerText
                }
              >
                Create Customer Account
              </AppText>

            </TouchableOpacity>

            {/* =================================
                RESTAURANT PARTNER
            ================================= */}

            <View
              style={
                styles.partnerContainer
              }
            >

              <AppText
                style={
                  styles.partnerTitle
                }
              >
                Restaurant Partner?
              </AppText>

              <TouchableOpacity
                activeOpacity={0.7}
              >

                <AppText
                  style={
                    styles.partnerLink
                  }
                >
                  Contact FoodE Support
                </AppText>

              </TouchableOpacity>

            </View>

            {/* =================================
                VERSION
            ================================= */}

            <AppText
              style={styles.version}
            >
              Version 1.0.0
            </AppText>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </View>
  );
};

export default LoginScreen;


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
    minHeight: 210,
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
    fontSize: 58,
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
  // LOGIN CARD
  // ================================================

  loginCard: {
    backgroundColor: '#FFFFFF',

    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,

    paddingHorizontal: 20,
    paddingTop: 13,
    paddingBottom: 35,

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
    marginBottom: 20,
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
  // FORGOT PASSWORD
  // ================================================

  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 5,
    marginBottom: 16,
  },

  forgotText: {
    color: ORANGE,
    fontSize: 14,
    fontWeight: '700',
  },

  // ================================================
  // DIVIDER
  // ================================================

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E6E6E6',
  },

  orText: {
    color: '#999999',
    fontSize: 13,
    fontWeight: '500',
    marginHorizontal: 12,
  },

  // ================================================
  // REGISTER
  // ================================================

  registerButton: {
    alignItems: 'center',
    marginBottom: 23,
  },

  registerText: {
    color: ORANGE,
    fontSize: 16,
    fontWeight: '800',
  },

  // ================================================
  // RESTAURANT PARTNER
  // ================================================

  partnerContainer: {
    alignItems: 'center',
  },

  partnerTitle: {
    color: '#777777',
    fontSize: 14,
    marginBottom: 5,
  },

  partnerLink: {
    color: ORANGE,
    fontSize: 15,
    fontWeight: '700',
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
