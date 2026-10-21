import React, {useCallback} from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {
  CaretLeft,
  CaretRight,
  User,
  Envelope,
  MapPin,
  Receipt,
  Heart,
  Globe,
  Bell,
  Question,
  ShieldCheck,
  FileText,
  Info,
  SignOut,
  SignIn,
  WhatsappLogo,
} from 'phosphor-react-native';

import {useAuth} from '../../../context/AuthContext';
import {APP_VERSION} from '../../../config/version';

const BG_COLOR = '#F3F4F6';
const CARD_BG = '#FFFFFF';
const ORANGE = '#FF5200';
const TEXT_DARK = '#111827';
const TEXT_MUTED = '#6B7280';
const BORDER_LIGHT = '#EFEFEF';

const WHATSAPP_CHANNEL_URL =
  'https://whatsapp.com/channel/0029VbEDaijD38CV27uyGB0d';

const ProfileScreen = ({navigation}: any) => {
  const {isLoggedIn, user, logout} = useAuth();

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out from FoodE?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
    );
  }, [logout]);

  const handleOpenWhatsApp = useCallback(async () => {
    try {
      await Linking.openURL(WHATSAPP_CHANNEL_URL);
    } catch {
      Alert.alert(
        'WhatsApp Channel',
        'Unable to open WhatsApp. Please visit:\n' + WHATSAPP_CHANNEL_URL,
      );
    }
  }, []);

  const displayName = user?.name?.trim() || 'FoodE User';
  const displayPhone = user?.phone || 'SRM AP Campus';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar
        backgroundColor={BG_COLOR}
        barStyle="dark-content"
        hidden={false}
        translucent={false}
      />

      {/* Top Header */}
      <View style={styles.navBar}>
        {navigation?.canGoBack?.() ? (
          <TouchableOpacity
            style={styles.navBackButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <CaretLeft size={20} color={TEXT_DARK} weight="bold" />
          </TouchableOpacity>
        ) : (
          <View style={styles.navButtonPlaceholder} />
        )}

        <Text style={styles.navTitle}>Settings</Text>

        <View style={styles.navButtonPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never">

        {/* User Identity Banner (when logged in or guest) */}
        {isLoggedIn ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PersonalInfo')}
            style={styles.userBanner}>
            <View style={styles.userAvatarCircle}>
              <User size={24} color={ORANGE} weight="bold" />
            </View>
            <View style={styles.userInfoCol}>
              <Text style={styles.userName} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.userPhone} numberOfLines={1}>
                {displayPhone}
              </Text>
            </View>
            <CaretRight size={18} color="#9CA3AF" weight="bold" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Login')}
            style={styles.guestBanner}>
            <View style={styles.guestIconCircle}>
              <SignIn size={22} color="#FFFFFF" weight="bold" />
            </View>
            <View style={styles.guestInfoCol}>
              <Text style={styles.guestTitle}>Sign in to FoodE</Text>
              <Text style={styles.guestSubtitle}>
                Track orders, view favorites & manage account
              </Text>
            </View>
            <CaretRight size={18} color={ORANGE} weight="bold" />
          </TouchableOpacity>
        )}

        {/* Group 1: Main Settings Card */}
        <View style={styles.card}>
          {/* Email / Personal Info */}
          <TouchableOpacity
            activeOpacity={0.65}
            style={styles.menuRow}
            onPress={() => navigation.navigate('PersonalInfo')}>
            <View style={styles.menuIconContainer}>
              <Envelope size={20} color="#4B5563" weight="regular" />
            </View>
            <Text style={styles.menuTitle}>Email & Account</Text>
            <CaretRight size={16} color="#9CA3AF" weight="bold" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Username / Profile */}
          <TouchableOpacity
            activeOpacity={0.65}
            style={styles.menuRow}
            onPress={() => navigation.navigate('PersonalInfo')}>
            <View style={styles.menuIconContainer}>
              <User size={20} color="#4B5563" weight="regular" />
            </View>
            <Text style={styles.menuTitle}>Username</Text>
            <CaretRight size={16} color="#9CA3AF" weight="bold" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Saved Addresses */}
          <TouchableOpacity
            activeOpacity={0.65}
            style={styles.menuRow}
            onPress={() => navigation.navigate('Address')}>
            <View style={styles.menuIconContainer}>
              <MapPin size={20} color="#4B5563" weight="regular" />
            </View>
            <Text style={styles.menuTitle}>Saved Addresses</Text>
            <CaretRight size={16} color="#9CA3AF" weight="bold" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* My Orders */}
          <TouchableOpacity
            activeOpacity={0.65}
            style={styles.menuRow}
            onPress={() => navigation.navigate('Orders')}>
            <View style={styles.menuIconContainer}>
              <Receipt size={20} color="#4B5563" weight="regular" />
            </View>
            <Text style={styles.menuTitle}>My Orders</Text>
            <CaretRight size={16} color="#9CA3AF" weight="bold" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Favorites */}
          <TouchableOpacity
            activeOpacity={0.65}
            style={styles.menuRow}
            onPress={() => navigation.navigate('Favorites')}>
            <View style={styles.menuIconContainer}>
              <Heart size={20} color="#4B5563" weight="regular" />
            </View>
            <Text style={styles.menuTitle}>Favorites</Text>
            <CaretRight size={16} color="#9CA3AF" weight="bold" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Language */}
          <TouchableOpacity
            activeOpacity={0.65}
            style={styles.menuRow}
            onPress={() => navigation.navigate('Language')}>
            <View style={styles.menuIconContainer}>
              <Globe size={20} color="#4B5563" weight="regular" />
            </View>
            <Text style={styles.menuTitle}>Language</Text>
            <CaretRight size={16} color="#9CA3AF" weight="bold" />
          </TouchableOpacity>
        </View>

        {/* WhatsApp Channel Card */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleOpenWhatsApp}
          style={styles.whatsappCard}>
          <View style={styles.whatsappLeft}>
            <View style={styles.whatsappIconCircle}>
              <WhatsappLogo size={24} color="#FFFFFF" weight="fill" />
            </View>
            <View style={styles.whatsappTextCol}>
              <Text style={styles.whatsappTitle}>Follow us on WhatsApp</Text>
              <Text style={styles.whatsappSubtitle}>
                Get daily menus, exclusive offers & live updates
              </Text>
            </View>
          </View>
          <View style={styles.whatsappActionPill}>
            <Text style={styles.whatsappActionText}>Join</Text>
            <CaretRight size={14} color="#075E54" weight="bold" />
          </View>
        </TouchableOpacity>

        {/* Group 4: App Preferences & Legal */}
        <View style={styles.card}>
          {/* Notifications */}
          <TouchableOpacity
            activeOpacity={0.65}
            style={styles.menuRow}
            onPress={() => navigation.navigate('NotificationSettings')}>
            <View style={styles.menuIconContainer}>
              <Bell size={20} color="#4B5563" weight="regular" />
            </View>
            <Text style={styles.menuTitle}>Notifications</Text>
            <CaretRight size={16} color="#9CA3AF" weight="bold" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Help Center */}
          <TouchableOpacity
            activeOpacity={0.65}
            style={styles.menuRow}
            onPress={() => navigation.navigate('HelpCenter')}>
            <View style={styles.menuIconContainer}>
              <Question size={20} color="#4B5563" weight="regular" />
            </View>
            <Text style={styles.menuTitle}>Help Center</Text>
            <CaretRight size={16} color="#9CA3AF" weight="bold" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Privacy Policy */}
          <TouchableOpacity
            activeOpacity={0.65}
            style={styles.menuRow}
            onPress={() => navigation.navigate('PrivacyPolicy')}>
            <View style={styles.menuIconContainer}>
              <ShieldCheck size={20} color="#4B5563" weight="regular" />
            </View>
            <Text style={styles.menuTitle}>Privacy Policy</Text>
            <CaretRight size={16} color="#9CA3AF" weight="bold" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Terms & Conditions */}
          <TouchableOpacity
            activeOpacity={0.65}
            style={styles.menuRow}
            onPress={() => navigation.navigate('Terms')}>
            <View style={styles.menuIconContainer}>
              <FileText size={20} color="#4B5563" weight="regular" />
            </View>
            <Text style={styles.menuTitle}>Terms & Conditions</Text>
            <CaretRight size={16} color="#9CA3AF" weight="bold" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* About FoodE */}
          <TouchableOpacity
            activeOpacity={0.65}
            style={styles.menuRow}
            onPress={() => navigation.navigate('About')}>
            <View style={styles.menuIconContainer}>
              <Info size={20} color="#4B5563" weight="regular" />
            </View>
            <Text style={styles.menuTitle}>About FoodE</Text>
            <View style={styles.versionBadge}>
              <Text style={styles.versionBadgeText}>v{APP_VERSION}</Text>
              <CaretRight size={16} color="#9CA3AF" weight="bold" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Log out button if logged in */}
        {isLoggedIn && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogout}
            style={styles.logoutButton}>
            <SignOut size={19} color="#DC2626" weight="bold" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        )}

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>FoodE • SRM AP</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },

  navBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    backgroundColor: BG_COLOR,
  },

  navBackButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  navButtonPlaceholder: {
    width: 40,
    height: 40,
  },

  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
    letterSpacing: -0.3,
  },

  scrollView: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },

  // User identity banner
  userBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  userAvatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFF2E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  userInfoCol: {
    flex: 1,
  },

  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DARK,
  },

  userPhone: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 2,
  },

  // Guest banner
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  guestIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  guestInfoCol: {
    flex: 1,
  },

  guestTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_DARK,
  },

  guestSubtitle: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },

  // Grouped white card container
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  menuIconContainer: {
    width: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  menuTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: TEXT_DARK,
    marginLeft: 6,
  },

  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 38,
  },

  // WhatsApp Channel Card
  whatsappCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#075E54',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    shadowColor: '#075E54',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },

  whatsappLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },

  whatsappIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  whatsappTextCol: {
    flex: 1,
  },

  whatsappTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },

  whatsappSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    lineHeight: 15,
  },

  whatsappActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 2,
  },

  whatsappActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#075E54',
  },

  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  versionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_MUTED,
  },

  // Logout button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingVertical: 15,
    marginTop: 4,
    marginBottom: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },

  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
  },

  footer: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 10,
  },

  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});