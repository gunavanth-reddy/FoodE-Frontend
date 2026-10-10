import React, {useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import * as authApi from '../../../api/auth';
import {AppButton, AppInput, AppText} from '../../../components';

const ORANGE = '#FF5A00';
const SRM_DOMAIN = '@srmap.edu.in';

const EmailVerificationScreen = ({navigation}: any) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    setError('');

    if (!normalizedEmail) {
      setError('Enter your SRM AP email address.');
      return;
    }

    // Require a complete email address ending exactly in @srmap.edu.in.
    const emailRegex = /^[a-zA-Z0-9._%+-]+@srmap\.edu\.in$/i;
    if (!emailRegex.test(normalizedEmail) || !normalizedEmail.endsWith(SRM_DOMAIN)) {
      setError('Enter a mail that ends with @srmap.edu.in');
      return;
    }

    const sendEmailOTP = (authApi as any).sendEmailOTP;
    if (typeof sendEmailOTP !== 'function') {
      setError('Email OTP API is not connected yet. Please configure sendEmailOTP in api/auth.');
      return;
    }

    try {
      setLoading(true);
      const response = await sendEmailOTP(normalizedEmail);
      if (!response?.success) {
        setError(response?.message || 'Unable to send verification OTP. Please try again.');
        return;
      }

      navigation.navigate('OTPVerification', {
        type: 'email',
        purpose: 'registration',
        identifier: normalizedEmail,
        developmentOTP: response.developmentOTP,
      });
    } catch (requestError: any) {
      console.log('Email OTP Request Error:', requestError?.response?.data || requestError);
      setError(
        requestError?.response?.data?.message ||
          'Unable to send the OTP. Check your connection and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={ORANGE} translucent={false} />
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View style={styles.hero}>
            <View style={styles.decorCircle} />
            <AppText style={styles.brand}>FoodE</AppText>
            <View style={styles.brandLine} />
            <AppText style={styles.tagline}>FOOD. FAST. FRESH.</AppText>
          </View>

          <View style={styles.card}>
            <View style={styles.handle} />
            <View style={styles.iconCircle}>
              <AppText style={styles.atIcon}>@</AppText>
            </View>
            <AppText style={styles.title}>Verify your SRM AP email</AppText>
            <AppText style={styles.subtitle}>
              Use your official university email to continue creating your FoodE account.
            </AppText>

            <View style={styles.domainNote}>
              <AppText style={styles.domainText}>Only @srmap.edu.in email addresses are accepted.</AppText>
            </View>

            <View style={styles.field}>
              <AppInput
                label="University Email"
                placeholder="yourname@srmap.edu.in"
                value={email}
                onChangeText={value => {
                  setEmail(value.trimStart());
                  setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon="mail-outline"
              />
              {!!error && <AppText style={styles.error}>{error}</AppText>}
            </View>

            <AppButton
              title={loading ? 'Sending OTP...' : 'Verify Email'}
              onPress={handleContinue}
              disabled={loading}
            />
            {loading && <ActivityIndicator color={ORANGE} style={styles.loader} />}

            <AppText style={styles.footerText}>
              Already have an account?{' '}
              <AppText style={styles.link} onPress={() => navigation.navigate('Login')}>
                Sign in
              </AppText>
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default EmailVerificationScreen;

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#FFFFFF'},
  keyboard: {flex: 1},
  scrollContent: {flexGrow: 1, paddingBottom: 24},
  hero: {
    minHeight: 190,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  decorCircle: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    right: -65,
    top: -95,
  },
  brand: {color: '#FFFFFF', fontSize: 52, fontWeight: '900', letterSpacing: -2},
  brandLine: {width: 42, height: 4, borderRadius: 4, backgroundColor: '#FFFFFF', marginTop: 4},
  tagline: {color: '#FFFFFF', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginTop: 8},
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 26,
    marginTop: -24,
    flexGrow: 1,
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.07,
    shadowRadius: 12,
  },
  handle: {width: 38, height: 4, borderRadius: 3, backgroundColor: '#E2E2E2', alignSelf: 'center', marginBottom: 22},
  iconCircle: {width: 54, height: 54, borderRadius: 27, backgroundColor: '#FFF0E8', alignItems: 'center', justifyContent: 'center', marginBottom: 16},
  atIcon: {fontSize: 28, fontWeight: '800', color: ORANGE},
  title: {fontSize: 25, lineHeight: 31, fontWeight: '800', color: '#161616', marginBottom: 8},
  subtitle: {fontSize: 14, lineHeight: 21, color: '#777777', marginBottom: 18},
  domainNote: {backgroundColor: '#FFF7F0', borderColor: '#FFE1D0', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 18},
  domainText: {fontSize: 13, lineHeight: 19, color: '#8A390E', fontWeight: '600'},
  field: {marginBottom: 18},
  error: {fontSize: 13, lineHeight: 18, color: '#D32F2F', marginTop: 6, marginLeft: 4},
  loader: {marginTop: 12},
  footerText: {textAlign: 'center', color: '#777777', fontSize: 13, marginTop: 22},
  link: {color: ORANGE, fontWeight: '800'},
});
