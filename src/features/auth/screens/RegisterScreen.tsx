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
  useWindowDimensions,
} from 'react-native';

import {
  registerUser,
  verifySRMAPStudent,
} from '../../../api/auth';

import {ArrowLeft} from 'phosphor-react-native';

import {
  AppInput,
  AppButton,
  AppText,
} from '../../../components';
import {APP_VERSION} from '../../../config/version';

const ORANGE = '#FF5A00';
const GREEN = '#16803D';
const DARK = '#171717';

const RegisterScreen = ({navigation}: any) => {
  const {height: screenHeight, width: screenWidth} =
    useWindowDimensions();

  // SRM AP ERP verification
  const [erpUsername, setErpUsername] = useState('');
  const [erpPassword, setErpPassword] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  // FoodE account details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const heroHeight = Math.max(
    225,
    Math.min(screenHeight * 0.32, 290),
  );

  const getErrorMessage = (
    error: any,
    fallback: string,
  ): string => {
    const message =
      error?.response?.data?.message || error?.message;

    return typeof message === 'string' && message.trim()
      ? message
      : fallback;
  };

  // ==========================================
  // VERIFY SRM AP STUDENT
  // ==========================================

  const handleVerifyStudent = async () => {
    if (isVerifying || isVerified) {
      return;
    }

    if (!erpUsername.trim() || !erpPassword) {
      setVerificationError(
        'Enter your SRM AP registration number and ERP password.',
      );
      return;
    }

    setIsVerifying(true);
    setVerificationError('');
    setIsVerified(false);
    setVerificationToken('');

    try {
      const response = await verifySRMAPStudent({
        username: erpUsername.trim(),
        password: erpPassword,
      });

      if (
        response?.success !== true ||
        !response?.verificationToken
      ) {
        setVerificationError(
          response?.message || 'Student verification failed.',
        );
        return;
      }

      setVerificationToken(response.verificationToken);
      setIsVerified(true);

      // Do not retain the ERP password after verification.
      setErpPassword('');

      Alert.alert(
        'Student Verified',
        'Your SRM AP student identity has been verified.',
      );
    } catch (error: any) {
      setVerificationError(
        getErrorMessage(
          error,
          'Unable to verify your student identity. Please try again.',
        ),
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // ==========================================
  // REGISTER FOOD E ACCOUNT
  // ==========================================

  const handleRegister = async () => {
    if (!isVerified || !verificationToken) {
      Alert.alert(
        'Verification Required',
        'Verify your SRM AP student identity before creating your account.',
      );
      return;
    }

    if (isRegistering || isVerifying) {
      return;
    }

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    setNameError('');
    setPhoneError('');
    setPasswordError('');

    if (trimmedName.length < 2) {
      setNameError('Name must be at least 2 characters.');
      return;
    }

    if (!/^\d{10}$/.test(trimmedPhone)) {
      setPhoneError('Enter a valid 10-digit mobile number.');
      return;
    }

    if (password.length < 8) {
      setPasswordError(
        'Password must contain at least 8 characters.',
      );
      return;
    }

    setIsRegistering(true);

    try {
      const response = await registerUser({
        name: trimmedName,
        phone: trimmedPhone,
        password,
        verificationToken,
      });

      if (response?.success !== true) {
        Alert.alert(
          'Registration Failed',
          response?.message || 'Unable to create your account.',
        );
        return;
      }

      // Clear sensitive values after successful registration.
      setIsVerified(false);
      setVerificationToken('');
      setErpPassword('');
      setPassword('');

      Alert.alert(
        'Account Created',
        'Your FoodE account has been created. You can now log in using your mobile number and password.',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Login'),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        getErrorMessage(
          error,
          'Unable to connect to the FoodE server.',
        ),
      );
    } finally {
      setIsRegistering(false);
    }
  };

  // Changing the ERP username invalidates verification.
  const handleERPUsernameChange = (text: string) => {
    if (isVerified || isVerifying) {
      return;
    }

    setErpUsername(text);
    setVerificationError('');
  };

  const handleERPPasswordChange = (text: string) => {
    if (isVerified || isVerifying) {
      return;
    }

    setErpPassword(text);
    setVerificationError('');
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        hidden={false}
        translucent={false}
        backgroundColor={ORANGE}
        barStyle="light-content"
      />

      {/* Orange branding header */}
      <View style={[styles.hero, {height: heroHeight}]}>
        <View style={styles.heroCircleLarge} />
        <View style={styles.heroCircleSmall} />
        <View style={styles.heroDot} />
        <View style={styles.heroLine} />

        {navigation.canGoBack() && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <ArrowLeft
              size={25}
              color="#FFFFFF"
              weight="bold"
            />
          </TouchableOpacity>
        )}

        <View style={styles.brand}>
          <AppText style={styles.brandText}>FoodE</AppText>
          <View style={styles.brandLine} />
          <AppText style={styles.brandTagline}>
            FOOD. FAST. FRESH.
          </AppText>
        </View>
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

          {/* Heading */}
          <View style={styles.header}>
            <AppText style={styles.title}>
              Create Account
            </AppText>

            <AppText style={styles.subtitle}>
              Verify your SRM AP student identity to join FoodE.
            </AppText>
          </View>

          {/* STEP 1: ERP VERIFICATION */}
          <View style={styles.sectionHeader}>
            <AppText style={styles.sectionTitle}>
              1. SRM AP Student Verification
            </AppText>

            <AppText style={styles.sectionSubtitle}>
              Use your college ERP credentials.
            </AppText>
          </View>

          <View style={styles.field}>
            <AppInput
              label="ERP Username / Registration Number"
              placeholder="Enter your ERP username"
              value={erpUsername}
              onChangeText={handleERPUsernameChange}
              autoCapitalize="none"
              editable={!isVerified && !isVerifying}
            />
          </View>

          <View style={styles.field}>
            <AppInput
              label="ERP Password"
              placeholder="Enter your ERP password"
              value={erpPassword}
              onChangeText={handleERPPasswordChange}
              secureTextEntry
              autoCapitalize="none"
              editable={!isVerified && !isVerifying}
            />
          </View>

          <View
            pointerEvents={
              isVerifying || isVerified ? 'none' : 'auto'
            }
            style={
              isVerifying || isVerified
                ? styles.disabledButton
                : undefined
            }>
            <AppButton
              title={
                isVerifying
                  ? 'Verifying Student...'
                  : 'Verify SRM AP Student'
              }
              onPress={handleVerifyStudent}
            />
          </View>

          {isVerified && (
            <View style={styles.verifiedBox}>
              <AppText style={styles.verifiedTitle}>
                ✓ Verified SRM AP Student
              </AppText>

              <AppText style={styles.verifiedSubtitle}>
                You can now create your FoodE account.
              </AppText>
            </View>
          )}

          {!!verificationError && (
            <AppText style={styles.errorText}>
              {verificationError}
            </AppText>
          )}

          {/* STEP 2: FOOD E ACCOUNT */}
          <View style={styles.sectionHeader}>
            <AppText style={styles.sectionTitle}>
              2. FoodE Account Details
            </AppText>

            <AppText style={styles.sectionSubtitle}>
              {isVerified
                ? 'Complete your account details.'
                : 'Complete verification to unlock these fields.'}
            </AppText>
          </View>

          <View
            pointerEvents={isVerified ? 'auto' : 'none'}
            style={!isVerified ? styles.disabledFields : undefined}>

            {/* Full name */}
            <View style={styles.field}>
              <AppInput
                label="Full Name"
                placeholder="Enter your full name"
                value={name}
                editable={isVerified}
                onChangeText={text => {
                  setName(text);
                  setNameError('');
                }}
                leftIcon="person-outline"
                autoCapitalize="words"
              />

              {!!nameError && (
                <AppText style={styles.errorText}>
                  {nameError}
                </AppText>
              )}
            </View>

            {/* Mobile number */}
            <View style={styles.field}>
              <AppInput
                label="Mobile Number"
                placeholder="Enter your 10-digit mobile number"
                value={phone}
                editable={isVerified}
                onChangeText={text => {
                  setPhone(text.replace(/\D/g, '').slice(0, 10));
                  setPhoneError('');
                }}
                leftIcon="call-outline"
                keyboardType="phone-pad"
              />

              {!!phoneError && (
                <AppText style={styles.errorText}>
                  {phoneError}
                </AppText>
              )}
            </View>

            {/* FoodE password */}
            <View style={styles.field}>
              <AppInput
                label="FoodE Password"
                placeholder="Create a password (minimum 8 characters)"
                value={password}
                editable={isVerified}
                onChangeText={text => {
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
          </View>

          {/* Create account */}
          <View
            pointerEvents={
              isVerified && !isRegistering ? 'auto' : 'none'
            }
            style={
              !isVerified || isRegistering
                ? styles.disabledButton
                : undefined
            }>
            <AppButton
              title={
                isRegistering
                  ? 'Creating Account...'
                  : 'Create Account'
              }
              onPress={handleRegister}
            />
          </View>

          {/* Existing account */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}>
            <AppText style={styles.loginText}>
              Already have an account?{' '}
              <AppText style={styles.loginHighlight}>
                Sign In
              </AppText>
            </AppText>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <AppText style={styles.version}>
              Version {APP_VERSION}
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ORANGE,
  },

  // Orange header
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

  // Back button
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

  // Decorations
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

  // Full-height card
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
    alignSelf: 'center',
    width: 70,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginBottom: 23,
  },

  // Main heading
  header: {
    marginBottom: 22,
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
    lineHeight: 21,
    marginTop: 7,
  },

  // Sections
  sectionHeader: {
    marginTop: 3,
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#262626',
    fontSize: 15,
    fontWeight: '800',
  },

  sectionSubtitle: {
    color: '#777777',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  field: {
    marginBottom: 12,
  },

  // Verification success
  verifiedBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 12,
    marginBottom: 18,
  },

  verifiedTitle: {
    color: GREEN,
    fontSize: 14,
    fontWeight: '800',
  },

  verifiedSubtitle: {
    color: '#166534',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  errorText: {
    color: '#DC2626',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 8,
  },

  disabledFields: {
    opacity: 0.45,
  },

  disabledButton: {
    opacity: 0.5,
  },

  // Sign in
  loginButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },

  loginText: {
    color: '#777777',
    fontSize: 13,
    textAlign: 'center',
  },

  loginHighlight: {
    color: ORANGE,
    fontWeight: '800',
  },

  // Bottom footer
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 12,
  },

  version: {
    color: '#B0B0B0',
    fontSize: 13,
    textAlign: 'center',
  },
});
