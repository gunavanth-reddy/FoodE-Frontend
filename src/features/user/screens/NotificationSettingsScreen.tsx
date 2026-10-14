import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  ArrowLeft,
  Bell,
  Clock,
  Sparkle,
} from 'phosphor-react-native';

const ORANGE = '#FF7A00';

const NotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {width} = useWindowDimensions();

  const horizontalPadding = width < 360 ? 16 : 22;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#FF7A00" barStyle="light-content" hidden={false} translucent={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop: 16,
          },
        ]}>

        {/* Back Button */}
        {navigation.canGoBack() && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}>
            <ArrowLeft size={22} color="#1E232C" weight="bold" />
          </TouchableOpacity>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Bell
              size={28}
              color={ORANGE}
              weight="regular"
            />
          </View>

          <Text style={styles.title}>
            Notification Settings
          </Text>

          <Text style={styles.subtitle}>
            Manage how FoodE keeps you informed about your
            orders, offers, and updates.
          </Text>
        </View>

        {/* Coming Soon Card */}
        <View style={styles.comingSoonCard}>
          <View style={styles.comingSoonIconContainer}>
            <Sparkle
              size={34}
              color={ORANGE}
              weight="duotone"
            />
          </View>

          <Text style={styles.comingSoonTitle}>
            Coming Soon
          </Text>

          <Text style={styles.comingSoonDescription}>
            Notification settings are coming soon to FoodE.
            We are working on giving you more control over
            the notifications you receive.
          </Text>

          {/* Feature Preview */}
          <View style={styles.previewBox}>
            <View style={styles.previewIcon}>
              <Clock
                size={20}
                color={ORANGE}
                weight="regular"
              />
            </View>

            <View style={styles.previewTextContainer}>
              <Text style={styles.previewTitle}>
                Notification preferences
              </Text>

              <Text style={styles.previewDescription}>
                Customize your notification preferences
                when this feature becomes available.
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Info */}
        <View style={styles.infoCard}>
          <Bell
            size={21}
            color={ORANGE}
            weight="regular"
          />

          <Text style={styles.infoText}>
            You will continue to receive important
            service-related notifications when necessary.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationSettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  content: {
    flexGrow: 1,
    paddingBottom: 32,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    alignSelf: 'flex-start',
  },

  header: {
    marginBottom: 28,
  },

  headerIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#FFF0E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.6,
  },

  subtitle: {
    fontSize: 14,
    color: '#7B8190',
    lineHeight: 21,
    marginTop: 9,
    maxWidth: 340,
  },

  comingSoonCard: {
    backgroundColor: '#FFFCF8',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',

    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.035,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  comingSoonIconContainer: {
    width: 78,
    height: 78,
    borderRadius: 26,
    backgroundColor: '#FFF0E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  comingSoonTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },

  comingSoonDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: '#7B8190',
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 310,
  },

  previewBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8F1',
    borderRadius: 16,
    padding: 15,
    marginTop: 26,
    borderWidth: 1,
    borderColor: '#FFE9D5',
  },

  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#FFEBD8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  previewTextContainer: {
    flex: 1,
  },

  previewTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#343434',
  },

  previewDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: '#777777',
    marginTop: 5,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8F1',
    borderRadius: 16,
    padding: 15,
    marginTop: 22,
    borderWidth: 1,
    borderColor: '#FFE9D5',
    gap: 11,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    color: '#777777',
  },
});