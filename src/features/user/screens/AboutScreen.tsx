import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';

import {ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Platform,
  useWindowDimensions,
} from 'react-native';

import {
  ForkKnife,
  Info,
  MapPin,
  Code,
} from 'phosphor-react-native';

const ORANGE = '#FF7A00';

const AboutScreen: React.FC = () => {
  const {width} = useWindowDimensions();

  const horizontalPadding = width < 360 ? 16 : 22;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar
        backgroundColor="#F7F8FA"
        barStyle="dark-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop:
              Platform.OS === 'android'
                ? (StatusBar.currentHeight || 0) + 12
                : 16,
          },
        ]}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            About FoodE
          </Text>

          <Text style={styles.subtitle}>
            Campus Food Delivery
          </Text>
        </View>

        {/* App Branding */}
        <View style={styles.brandCard}>
          <View style={styles.logoContainer}>
            <ForkKnife
              size={38}
              color="#FFFFFF"
              weight="fill"
            />
          </View>

          <Text style={styles.appName}>
            FoodE
          </Text>

          <Text style={styles.tagline}>
            Your cravings, delivered.
          </Text>

          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>
              VERSION 1.0.0
            </Text>
          </View>
        </View>

        {/* About FoodE */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Info
                size={21}
                color={ORANGE}
                weight="regular"
              />
            </View>

            <Text style={styles.heading}>
              About FoodE
            </Text>
          </View>

          <Text style={styles.bodyText}>
            FoodE is a campus-first food delivery platform
            built exclusively for the SRM AP University
            community.
          </Text>

          <Text style={styles.bodyText}>
            Students, faculty and staff can order food
            conveniently from campus dining facilities and
            nearby restaurant partners.
          </Text>
        </View>

        {/* Service Area */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <MapPin
                size={21}
                color={ORANGE}
                weight="regular"
              />
            </View>

            <Text style={styles.heading}>
              Service Area
            </Text>
          </View>

          <Text style={styles.locationName}>
            SRM AP University
          </Text>

          <Text style={styles.bodyText}>
            Neerukonda, Mangalagiri,
            {'\n'}
            Andhra Pradesh, India
          </Text>
        </View>

        {/* Developer */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Code
                size={21}
                color={ORANGE}
                weight="regular"
              />
            </View>

            <Text style={styles.heading}>
              Developed By
            </Text>
          </View>

          <Text style={styles.developerName}>
            UG
          </Text>

          <Text style={styles.bodyText}>
            Built with care for the SRM AP community.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />

          <Text style={styles.footerText}>
            FoodE · Version 1.0.0
          </Text>

          <Text style={styles.copyright}>
            © 2026 FoodE. All rights reserved.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  content: {
    flexGrow: 1,
    paddingBottom: 32,
  },

  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.6,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#858B98',
    fontWeight: '500',
  },

  // Branding Card
  brandCard: {
    backgroundColor: '#FFFCF8',
    borderRadius: 22,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  logoContainer: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#171717',
    letterSpacing: -0.5,
  },

  tagline: {
    fontSize: 13,
    color: '#858B98',
    marginTop: 5,
  },

  versionBadge: {
    backgroundColor: '#FFF2E6',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 15,
  },

  versionText: {
    fontSize: 10,
    fontWeight: '800',
    color: ORANGE,
    letterSpacing: 1,
  },

  // General Cards
  card: {
    backgroundColor: '#FFFCF8',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.035,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF2E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  heading: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  bodyText: {
    fontSize: 14,
    color: '#626B78',
    lineHeight: 22,
    marginBottom: 8,
  },

  locationName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#252525',
    marginBottom: 6,
  },

  developerName: {
    fontSize: 20,
    fontWeight: '800',
    color: ORANGE,
    marginBottom: 6,
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },

  footerDivider: {
    width: 45,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },

  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7B8190',
  },

  copyright: {
    fontSize: 11,
    color: '#A0A5AF',
    marginTop: 6,
    textAlign: 'center',
  },
});