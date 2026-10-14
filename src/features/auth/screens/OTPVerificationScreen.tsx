import React, {useEffect, useState} from 'react';
import {Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View} from 'react-native';
import {ArrowLeft} from 'phosphor-react-native';

import {
  AppButton,
  AppInput,
  AppText,
} from '../../../components';

import {
  verifyEmailOTP,
  verifyPhoneOTP,
  resendEmailOTP,
  resendPhoneOTP,
} from '../../../api/auth';

const OTPVerificationScreen = ({
  navigation,
  route,
}: any) => {
  const {
    type,
    identifier,
    developmentOTP,
    purpose,
  } = route.params || {};

  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);

  // =========================
  // Countdown
  // =========================

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // =========================
  // Verify OTP
  // =========================

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert(
        'Invalid OTP',
        'Please enter the 6-digit OTP.',
      );
      return;
    }

    try {
      setLoading(true);

      let response;

      if (type === 'email') {
        response = await verifyEmailOTP(
          identifier,
          otp,
        );
      } else {
        response = await verifyPhoneOTP(
          identifier,
          otp,
        );
      }

      if (!response.success) {
        Alert.alert(
          'Verification Failed',
          response.message ||
            'Invalid OTP.',
        );
        return;
      }

      Alert.alert(
        'Verified Successfully 🎉',
        type === 'email'
          ? 'Your email has been verified.'
          : 'Your phone number has been verified.',
        [
          {
            text: 'Continue',
            onPress: () => {
              if (type === 'email' && purpose === 'registration') {
                navigation.replace('Register', {verifiedEmail: identifier});
              } else {
                navigation.replace('Login');
              }
            },
          },
        ],
      );

    } catch (error: any) {
      console.log(
        'OTP Verification Error:',
        error.response?.data || error,
      );

      Alert.alert(
        'Verification Failed',
        error.response?.data?.message ||
          'Unable to verify OTP.',
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Resend OTP
  // =========================

  const handleResend = async () => {
    try {
      setLoading(true);

      let response;

      if (type === 'email') {
        response = await resendEmailOTP(
          identifier,
        );
      } else {
        response = await resendPhoneOTP(
          identifier,
        );
      }

      if (!response.success) {
        Alert.alert(
          'Resend Failed',
          response.message ||
            'Unable to resend OTP.',
        );
        return;
      }

      setOtp('');
      setCountdown(60);

      Alert.alert(
        'OTP Sent',
        'A new OTP has been generated.',
      );

      // Temporary development testing
      if (response.developmentOTP) {
        console.log(
          'New FoodE Development OTP:',
          response.developmentOTP,
        );
      }

    } catch (error: any) {
      console.log(
        'Resend OTP Error:',
        error.response?.data || error,
      );

      Alert.alert(
        'Resend Failed',
        error.response?.data?.message ||
          'Unable to resend OTP.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar hidden={true} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.content}>

            {navigation.canGoBack() && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  backgroundColor: '#F8F9FA',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: '#E8ECF4',
                }}
                activeOpacity={0.7}>
                <ArrowLeft size={22} color="#1E232C" weight="bold" />
              </TouchableOpacity>
            )}

        {/* =========================
            Title
        ========================= */}

        <AppText
          style={{
            fontSize: 28,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: 12,
          }}>

          Verify Your Account

        </AppText>

        {/* =========================
            Description
        ========================= */}

        <AppText
          style={{
            textAlign: 'center',
            marginBottom: 8,
          }}>

          We sent a 6-digit OTP to

        </AppText>

        <AppText
          style={{
            textAlign: 'center',
            fontWeight: '700',
            marginBottom: 30,
          }}>

          {identifier}

        </AppText>

        {/* =========================
            Development OTP
        ========================= */}

        {developmentOTP && (
          <AppText
            style={{
              textAlign: 'center',
              marginBottom: 20,
              fontWeight: '600',
            }}>

            Development OTP: {developmentOTP}

          </AppText>
        )}

        {/* =========================
            OTP Input
        ========================= */}

        <AppInput
          label="OTP"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChangeText={value =>
            setOtp(
              value
                .replace(/[^0-9]/g, '')
                .slice(0, 6),
            )
          }
          keyboardType="number-pad"
          leftIcon="keypad-outline"
        />

        {/* =========================
            Verify
        ========================= */}

        <AppButton
          title={
            loading
              ? 'Verifying...'
              : 'Verify OTP'
          }
          onPress={handleVerify}
          disabled={loading}
        />

        {/* =========================
            Resend
        ========================= */}

        <View
          style={{
            alignItems: 'center',
            marginTop: 20,
          }}>

          {countdown > 0 ? (

            <AppText>
              Resend OTP in {countdown}s
            </AppText>

          ) : (

            <AppText
              onPress={handleResend}
              style={{
                fontWeight: '700',
              }}>

              Resend OTP

            </AppText>

          )}

        </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default OTPVerificationScreen;

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#FFFFFF'},
  flex: {flex: 1},
  scrollContent: {flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 24, paddingBottom: 36},
  content: {width: '100%', maxWidth: 520, alignSelf: 'center'},
});
