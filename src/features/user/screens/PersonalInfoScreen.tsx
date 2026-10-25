import React, {useState} from 'react';

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AppTextInput from "../../../components/inputs/AppTextInput";

import {useNavigation} from '@react-navigation/native';
import {
  User,
  Check,
  CheckCircle,
  Medal,
  Phone,
  Envelope,
  ArrowRight,
  Info,
  LockKey,
} from 'phosphor-react-native';
import AppBackButton from '../../../components/buttons/AppBackButton';

import {useAuth} from '../../../context/AuthContext';

/* ================= COLORS ================= */

const COLORS = {
  primary: '#FF6B00',
  primaryLight: '#FFF3EB',
  background: '#F8F9FB',
  white: '#FFFFFF',
  text: '#1E1E1E',
  secondaryText: '#757575',
  icon: '#9CA3AF',
  placeholder: '#A0A0A0',
  border: '#EAEAEA',
  inputBackground: '#FAFAFA',
};

/* ================= SCREEN ================= */

const PersonalInfoScreen = () => {
  const navigation = useNavigation<any>();
  const {user} = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(
        'Name Required',
        'Please enter your full name.',
      );
      return;
    }

    if (!phone.trim()) {
      Alert.alert(
        'Mobile Number Required',
        'Please enter your mobile number.',
      );
      return;
    }

    Alert.alert(
      'Coming Soon',
      'Saving profile changes will be available in a future update.',
    );
  };

  return (
    <SafeAreaView style={{flex: 1}} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      
      <StatusBar backgroundColor="#FF7A00" barStyle="light-content" hidden={false} translucent={false} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">

        {/* Header */}
        <View style={styles.header}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
            {navigation.canGoBack() ? (
              <AppBackButton />
            ) : (
              <View style={styles.headerIcon}>
                <User
                  size={24}
                  color={COLORS.primary}
                  weight="regular"
                />
              </View>
            )}

            <View style={{flex: 1}}>
              <Text style={styles.title}>
                Personal Information
              </Text>

              <Text style={styles.subtitle}>
                Manage your personal details
              </Text>
            </View>
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <User
              size={44}
              color={COLORS.primary}
              weight="fill"
            />

            <View style={styles.avatarBadge}>
              <Check
                size={12}
                color={COLORS.white}
                weight="bold"
              />
            </View>
          </View>

          <Text
            style={styles.profileName}
            numberOfLines={1}>
            {name.trim() || 'FoodE User'}
          </Text>

          <View style={styles.memberBadge}>
            <CheckCircle
              size={15}
              color={COLORS.primary}
              weight="fill"
            />

            <Text style={styles.memberText}>
              FoodE Member
            </Text>
          </View>

          <Text style={styles.profileDescription}>
            Your account information
          </Text>
        </View>

        {/* Details Form */}
        <View style={styles.formCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeadingContent}>
              <Text style={styles.sectionTitle}>
                Your Details
              </Text>

              <Text style={styles.sectionSubtitle}>
                Personal information linked to your account
              </Text>
            </View>

            <Medal
              size={24}
              color={COLORS.primary}
              weight="regular"
            />
          </View>

          {/* Full Name */}
          <Text style={styles.label}>
            Full Name
          </Text>

          <View style={styles.inputContainer}>
            <User
              size={20}
              color={COLORS.icon}
              weight="regular"
            />

            <AppTextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={COLORS.placeholder}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              accessibilityLabel="Full name"
            />
          </View>

          {/* Mobile Number */}
          <Text style={styles.label}>
            Mobile Number
          </Text>

          <View style={styles.inputContainer}>
            <Phone
              size={20}
              color={COLORS.icon}
              weight="regular"
            />

            <AppTextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter mobile number"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="phone-pad"
              maxLength={10}
              returnKeyType="next"
              accessibilityLabel="Mobile number"
            />
          </View>

          {/* Email Address */}
          <View style={styles.labelRow}>
            <Text style={styles.label}>
              Email Address
            </Text>

            <Text style={styles.optional}>
              OPTIONAL
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Envelope
              size={20}
              color={COLORS.icon}
              weight="regular"
            />

            <AppTextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              accessibilityLabel="Email address"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.85}
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel="Save changes">

            <CheckCircle
              size={20}
              color={COLORS.white}
              weight="regular"
            />

            <Text style={styles.saveButtonText}>
              Save Changes
            </Text>

            <ArrowRight
              size={18}
              color={COLORS.white}
              weight="bold"
            />
          </TouchableOpacity>

          <View style={styles.helperContainer}>
            <Info
              size={16}
              color={COLORS.secondaryText}
              weight="regular"
            />

            <Text style={styles.helperText}>
              Profile updates will be available in a future FoodE
              update.
            </Text>
          </View>
        </View>

        {/* Privacy Information */}
        <View style={styles.privacyCard}>
          <LockKey
            size={20}
            color={COLORS.primary}
            weight="regular"
          />

          <View style={styles.privacyContent}>
            <Text style={styles.privacyTitle}>
              Your information is private
            </Text>

            <Text style={styles.privacyDescription}>
              Your personal details are used to support your FoodE
              experience.
            </Text>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PersonalInfoScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 36,
  },

  header: {
    marginBottom: 20,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginTop: 6,
    lineHeight: 20,
  },

  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },

  avatarContainer: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  avatarBadge: {
    position: 'absolute',
    right: 0,
    bottom: 1,
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    maxWidth: '100%',
  },

  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    gap: 5,
  },

  memberText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },

  profileDescription: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginTop: 12,
  },

  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },

  sectionHeadingContent: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginTop: 5,
    lineHeight: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 9,
    marginTop: 18,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  optional: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondaryText,
    letterSpacing: 0.5,
  },

  inputContainer: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
  },

  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 10,
    paddingVertical: Platform.OS === 'android' ? 10 : 13,
    includeFontPadding: false,
  },

  saveButton: {
    minHeight: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    paddingHorizontal: 16,
    gap: 10,
    elevation: 3,
  },

  saveButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },

  helperContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 2,
    gap: 7,
  },

  helperText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.secondaryText,
    lineHeight: 18,
  },

  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8F3',
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#FFE7D6',
    gap: 12,
  },

  privacyContent: {
    flex: 1,
  },

  privacyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },

  privacyDescription: {
    fontSize: 12,
    color: COLORS.secondaryText,
    lineHeight: 18,
    marginTop: 5,
  },
});