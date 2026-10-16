import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Linking,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

import {loginUser} from '../../../api/auth';
import {AppInput, AppButton, AppText} from '../../../components';
import {
  useAuth,
  normalizeUserRole,
} from '../../../context/AuthContext';
import {APP_VERSION} from '../../../config/version';

const ORANGE = '#FF5A00';
const DARK = '#171717';

const LoginScreen = ({navigation}: any) => {
  const {login} = useAuth();
  const {height: screenHeight, width: screenWidth} =
    useWindowDimensions();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const logoScale = useRef(new Animated.Value(0.88)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  const heroHeight = Math.max(
    225,
    Math.min(screenHeight * 0.32, 290),
  );

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
            toValue: 0.96,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 0.88,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(500),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [logoOpacity, logoScale]);

  const handleLogin = async () => {
    const value = identifier.trim();

    setIdentifierError('');
    setPasswordError('');

    if (!value) {
      setIdentifierError('Phone number is required');
      return;
    }

    if (!/^[0-9]{10}$/.test(value)) {
      setIdentifierError('Enter a valid 10-digit phone number');
      return;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }

    try {
      const response = await loginUser({
        phone: value,
        password,
      });

      if (!response.success) {
        setIdentifierError(
          response.message || 'Unable to log in. Please try again.',
        );
        return;
      }

      if (!response.user || !response.token) {
        setIdentifierError('Invalid login response from server');
        return;
      }

      const normalizedRole = normalizeUserRole(response.user.role);

      if (!normalizedRole) {
        setIdentifierError('Invalid user role');
        return;
      }

      const normalizedUser = {
        ...response.user,
        role: normalizedRole,
      };

      await login(normalizedUser, response.token);

      if (normalizedRole === 'restaurant_owner') {
        navigation.replace('RestaurantOwner');
        return;
      }

      if (normalizedRole === 'user') {
        navigation.replace('Main');
        return;
      }

      if (normalizedRole === 'admin') {
        navigation.replace('AdminDashboard');
        return;
      }

      setIdentifierError('Invalid user role');
    } catch (error: any) {
      console.log(
        'Login Error:',
        error.response?.data || error.message,
      );

      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 404 || message === 'User not found') {
        setIdentifierError('Wrong phone number');
        return;
      }

      if (status === 401 || message === 'Invalid Password') {
        setPasswordError('Wrong password');
        return;
      }

      setIdentifierError('Unable to connect to FoodE server');
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
        <View style={styles.heroCircleLarge} />
        <View style={styles.heroCircleSmall} />
        <View style={styles.heroDot} />
        <View style={styles.heroLine} />

        <Animated.View
          style={[
            styles.brand,
            {
              opacity: logoOpacity,
              transform: [{scale: logoScale}],
            },
          ]}>
          <AppText style={styles.brandText}>FoodE</AppText>
          <View style={styles.brandLine} />
          <AppText style={styles.brandTagline}>
            FOOD. FAST. FRESH.
          </AppText>
        </Animated.View>
      </View>

      {/* Full-height white card */}
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
          <View style={styles.handle} />

          {/* Welcome */}
          <View style={styles.header}>
            <AppText style={styles.title}>Welcome Back</AppText>
            <AppText style={styles.subtitle}>
              Sign in to continue ordering your favorite food.
            </AppText>
          </View>

          {/* Phone number */}
          <View style={styles.field}>
            <AppInput
              label="Phone Number"
              placeholder="Enter your 10-digit phone number"
              value={identifier}
              onChangeText={(text: string) => {
                setIdentifier(
                  text.replace(/[^0-9]/g, '').slice(0, 10),
                );
                setIdentifierError('');
              }}
              leftIcon="call-outline"
              keyboardType="phone-pad"
            />

            {!!identifierError && (
              <AppText style={styles.errorText}>
                {identifierError}
              </AppText>
            )}
          </View>

          {/* Password */}
          <View style={styles.field}>
            <AppInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text: string) => {
                setPassword(text);
                setPasswordError('');
              }}
              leftIcon="lock-closed-outline"
              secureTextEntry
              autoCapitalize="none"
            />

            {!!passwordError && (
              <AppText style={styles.errorText}>
                {passwordError}
              </AppText>
            )}
          </View>

          {/* Forgot password */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.forgotButton}
            onPress={() => navigation.navigate('ForgotPassword')}>
            <AppText style={styles.forgotText}>
              Forgot Password?
            </AppText>
          </TouchableOpacity>

          {/* Continue */}
          <AppButton title="Continue" onPress={handleLogin} />

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <AppText style={styles.orText}>OR</AppText>
            <View style={styles.divider} />
          </View>

          {/* Create account */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}>
            <AppText style={styles.registerText}>
              Create Customer Account
            </AppText>
          </TouchableOpacity>

          {/* Bottom footer */}
          <View style={styles.footer}>
            <AppText style={styles.partnerTitle}>
              Restaurant Partner?
            </AppText>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                // Add your existing FoodE support navigation here.
              }}>
              <AppText style={styles.partnerLink}>
                Contact FoodE Support
              </AppText>
            </TouchableOpacity>

            <View style={styles.legalLinks}>
              <AppText
                style={styles.legalLink}
                accessibilityRole="link"
                onPress={() => Linking.openURL('https://foode.site/privacy-policy.html')}>
                Privacy Policy
              </AppText>
              <AppText
                style={styles.legalLink}
                accessibilityRole="link"
                onPress={() => Linking.openURL('https://foode.site/delete-account.html')}>
                Request Account Deletion
              </AppText>
            </View>

            <AppText style={styles.version}>
              Version {APP_VERSION}
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ORANGE,
  },

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
    marginTop: -4,
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

  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 32,
    fontWeight: '900',
    color: DARK,
    letterSpacing: -0.8,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: '#777777',
    marginTop: 7,
  },

  field: {
    marginBottom: 12,
  },

  errorText: {
    color: '#D93025',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },

  forgotButton: {
    alignSelf: 'flex-end',
    paddingVertical: 3,
    marginTop: 0,
    marginBottom: 19,
  },

  forgotText: {
    color: ORANGE,
    fontSize: 16,
    fontWeight: '800',
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 23,
    marginBottom: 18,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E4E4E4',
  },

  orText: {
    color: '#999999',
    fontSize: 16,
    marginHorizontal: 15,
  },

  registerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
  },

  registerText: {
    color: ORANGE,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },

  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 24,
  },

  partnerTitle: {
    color: '#818181',
    fontSize: 15,
    marginBottom: 8,
  },

  partnerLink: {
    color: ORANGE,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },

  legalLinks: {
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },

  legalLink: {
    color: '#7A3B0A',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  version: {
    color: '#B0B0B0',
    fontSize: 13,
    marginTop: 23,
    textAlign: 'center',
  },
});
