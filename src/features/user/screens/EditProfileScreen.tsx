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
  ActivityIndicator,
} from 'react-native';
import AppTextInput from "../../../components/inputs/AppTextInput";

import Ionicons from '@react-native-vector-icons/ionicons/static';
import {useNavigation} from '@react-navigation/native';

import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../../context/AuthContext';

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../components/profile/styles';

import type {RootStackParamList} from '../../../navigation/AppNavigator';

// =====================================================
// NAVIGATION TYPE
// =====================================================

type EditProfileNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    'EditProfile'
  >;

// =====================================================
// EDIT PROFILE SCREEN
// =====================================================

const EditProfileScreen: React.FC = () => {
  const navigation =
    useNavigation<EditProfileNavigationProp>();

  const {user, updateProfile} = useAuth();

  // ===================================================
  // FORM STATE
  // ===================================================

  const [name, setName] = useState(
    user?.name ?? '',
  );

  const [phone, setPhone] = useState(
    user?.phone ?? '',
  );

  const [saving, setSaving] = useState(false);

  // ===================================================
  // VALIDATION
  // ===================================================

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert(
        'Name Required',
        'Please enter your name.',
      );

      return false;
    }

    const cleanedPhone = phone.replace(/[\s-]/g, '');

    const validPhone =
      /^(?:\+91)?[6-9]\d{9}$/.test(cleanedPhone);

    if (!validPhone) {
      Alert.alert(
        'Invalid Mobile Number',
        'Please enter a valid 10-digit Indian mobile number.',
      );

      return false;
    }

    return true;
  };

  // ===================================================
  // SAVE PROFILE
  // ===================================================

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
      });

      Alert.alert(
        'Profile Updated',
        'Your profile has been updated successfully.',
        [
          {
            text: 'Continue',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      console.log('Edit Profile Error:', error);

      Alert.alert(
        'Update Failed',
        'Unable to update your profile. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // SCREEN
  // ===================================================

  return (
    <SafeAreaView style={{flex: 1}} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }>

      <StatusBar backgroundColor="#FF7A00" barStyle="light-content" hidden={false} translucent={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* =========================================
            HEADER
        ========================================= */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back">

            <Ionicons
              name="arrow-back-outline"
              size={24}
              color={COLORS.textPrimary}
            />

          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              Edit Profile
            </Text>

            <Text style={styles.headerSubtitle}>
              Update your personal details
            </Text>
          </View>
        </View>

        {/* =========================================
            DEFAULT AVATAR
        ========================================= */}

        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Ionicons
              name="person-circle-outline"
              size={100}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.avatarLabel}>
            Your FoodE Profile
          </Text>

          <Text style={styles.avatarDescription}>
            Your default profile picture
          </Text>
        </View>

        {/* =========================================
            FORM CARD
        ========================================= */}

        <View style={styles.formCard}>

          <Text style={styles.sectionTitle}>
            Personal Information
          </Text>

          {/* NAME */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Full Name
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={21}
                color={COLORS.textSecondary}
              />

              <AppTextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.textLight}
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={50}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* MOBILE NUMBER */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Mobile Number
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="phone-portrait-outline"
                size={21}
                color={COLORS.textSecondary}
              />

              <AppTextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter mobile number"
                placeholderTextColor={COLORS.textLight}
                keyboardType="phone-pad"
                maxLength={13}
                returnKeyType="done"
              />
            </View>

            <Text style={styles.helperText}>
              Enter your 10-digit Indian mobile number.
            </Text>
          </View>

          {/* SAVE BUTTON */}

          <TouchableOpacity
            style={[
              styles.saveButton,
              saving && styles.disabledButton,
            ]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Save profile changes">

            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={21}
                  color="#FFFFFF"
                />

                <Text style={styles.saveButtonText}>
                  Save Changes
                </Text>
              </>
            )}

          </TouchableOpacity>

          {/* CANCEL BUTTON */}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={saving}
            activeOpacity={0.7}>

            <Text style={styles.cancelButtonText}>
              Cancel
            </Text>

          </TouchableOpacity>

        </View>

        {/* FOOTER NOTE */}

        <View style={styles.footerNote}>
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color={COLORS.success}
          />

          <Text style={styles.footerNoteText}>
            Your profile details are stored securely.
          </Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: 40,
  },

  // HEADER

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#FFFCF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.h2,
  },

  headerSubtitle: {
    color: COLORS.textSecondary,
    marginTop: 4,
    ...TYPOGRAPHY.caption,
  },

  // AVATAR

  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },

  avatarContainer: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },

  avatarLabel: {
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.title,
  },

  avatarDescription: {
    color: COLORS.textSecondary,
    marginTop: 4,
    ...TYPOGRAPHY.caption,
  },

  // FORM CARD

  formCard: {
    backgroundColor: '#FFFCF8',
    borderRadius: 24,
    padding: SPACING.xl,
    elevation: 3,
  },

  sectionTitle: {
    color: COLORS.textPrimary,
    marginBottom: SPACING.xl,
    ...TYPOGRAPHY.h3,
  },

  inputGroup: {
    marginBottom: SPACING.lg,
  },

  label: {
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    ...TYPOGRAPHY.title,
  },

  inputContainer: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
  },

  input: {
    flex: 1,
    marginLeft: SPACING.sm,
    paddingVertical: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 15,
  },

  helperText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    ...TYPOGRAPHY.caption,
  },

  // SAVE BUTTON

  saveButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: '#FFFFFF',
    ...TYPOGRAPHY.button,
  },

  // CANCEL BUTTON

  cancelButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },

  cancelButtonText: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.button,
  },

  // FOOTER

  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },

  footerNoteText: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.caption,
  },
});
