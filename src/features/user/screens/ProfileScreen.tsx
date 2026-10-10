import React from 'react';

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import AppScreen from '../../../components/layout/AppScreen';

import {useAuth} from '../../../context/AuthContext';

import {
  COLORS,
  SPACING,
} from '../components/profile/styles';

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

const ProfileScreen = ({navigation}: any) => {
  const {
    isLoggedIn,
    user,
    logout,
  } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={{flex: 1}} edges={['top', 'left', 'right']}>
      <AppScreen backgroundColor={COLORS.background}>
      <StatusBar
        backgroundColor={COLORS.background}
        barStyle="dark-content"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={true}>

        {/* Profile Header */}
        <ProfileHeader />

        {/* User Profile */}
        <View style={styles.profileCard}>
          {isLoggedIn ? (
            <UserProfileCard user={user} />
          ) : (
            <GuestProfileCard
              onLoginPress={() => navigation.navigate('Login')}
            />
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <QuickActionGrid
            isLoggedIn={isLoggedIn}
            navigation={navigation}
          />
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <MenuSection
            title="Account"
            data={ACCOUNT_MENU}
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <MenuSection
            title="Support"
            data={SUPPORT_MENU}
          />
        </View>

        {/* About Section */}
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
      </AppScreen>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.lg,
  },

  profileCard: {
    marginTop: SPACING.sm,
  },

  section: {
    marginTop: SPACING.sm,
  },

  footer: {
    marginTop: SPACING.sm,
  },
});
