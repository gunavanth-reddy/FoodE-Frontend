import React, {useCallback} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useAuth} from '../../../context/AuthContext';

import {SPACING} from '../components/profile/styles';

import ProfileHeader from '../components/profile/components/header';

import {
  GuestProfileCard,
  UserProfileCard,
} from '../components/profile/components/profileCard';

import {QuickActionGrid} from '../components/profile/components/quickActions';
import {MenuSection} from '../components/profile/components/menu';
import Footer from '../components/profile/components/footer';

import {
  ACCOUNT_MENU,
  SUPPORT_MENU,
  ABOUT_MENU,
} from '../components/profile/constants';

const BACKGROUND = '#F7F8FA';

const ProfileScreen = ({navigation}: any) => {
  const {isLoggedIn, user, logout} = useAuth();

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const handleLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}>
      <StatusBar
        backgroundColor={BACKGROUND}
        barStyle="dark-content"
        hidden={false}
        translucent={false}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never">

        {/* Header */}
        <View style={styles.header}>
          <ProfileHeader />
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {isLoggedIn ? (
            <UserProfileCard user={user} />
          ) : (
            <GuestProfileCard onLoginPress={handleLogin} />
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <QuickActionGrid
            isLoggedIn={isLoggedIn}
            navigation={navigation}
          />
        </View>

        {/* Account */}
        <View style={styles.section}>
          <MenuSection
            title="Account"
            data={ACCOUNT_MENU}
          />
        </View>

        {/* Support */}
        <View style={styles.section}>
          <MenuSection
            title="Support"
            data={SUPPORT_MENU}
          />
        </View>

        {/* About */}
        <View style={styles.section}>
          <MenuSection
            title="About"
            data={ABOUT_MENU}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Footer
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  scrollView: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.lg,
    backgroundColor: BACKGROUND,
  },

  header: {
    marginBottom: SPACING.xs,
  },

  profileCard: {
    marginTop: SPACING.xs,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0E5DD',
    backgroundColor: '#FFFFFF',
  },

  section: {
    marginTop: SPACING.md,
  },

  footer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.xs,
  },
});