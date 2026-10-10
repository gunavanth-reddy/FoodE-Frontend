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
  LockKey,
  CheckCircle,
} from 'phosphor-react-native';

const ORANGE = '#FF7A00';

const PrivacyPolicyScreen: React.FC = () => {
  const {width} = useWindowDimensions();

  // Responsive layout
  const horizontalPadding = Math.min(
    Math.max(width * 0.05, 16),
    24,
  );

  const titleSize = Math.min(
    Math.max(width * 0.075, 25),
    32,
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7F8FA"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop: 16,
            paddingBottom: 32,
          },
        ]}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.titleIcon}>
              <LockKey
                size={22}
                color={ORANGE}
                weight="regular"
              />
            </View>

            <Text
              style={[
                styles.title,
                {fontSize: titleSize},
              ]}
              maxFontSizeMultiplier={1.3}>
              Privacy Policy
            </Text>
          </View>

          <Text style={styles.subtitle}>
            Your privacy matters to us.
          </Text>

          <View style={styles.updatedBadge}>
            <View style={styles.statusDot} />

            <Text style={styles.updatedText}>
              Your privacy. Your trust.
            </Text>
          </View>
        </View>

        {/* Information We Collect */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.accentBar} />

            <Text style={styles.heading}>
              Information We Collect
            </Text>
          </View>

          <Text style={styles.description}>
            To provide a smooth food ordering experience,
            FoodE may collect the following information:
          </Text>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />

            <Text style={styles.text}>
              Basic account information such as your name,
              email address, and phone number.
            </Text>
          </View>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />

            <Text style={styles.text}>
              Delivery information required to complete
              your food orders.
            </Text>
          </View>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />

            <Text style={styles.text}>
              Order history to help improve your experience.
            </Text>
          </View>
        </View>

        {/* How We Use Your Information */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.accentBar} />

            <Text style={styles.heading}>
              How We Use Your Information
            </Text>
          </View>

          <Text style={styles.description}>
            Your information helps us provide and improve
            FoodE services.
          </Text>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />

            <Text style={styles.text}>
              Process and deliver your food orders.
            </Text>
          </View>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />

            <Text style={styles.text}>
              Provide customer support when you need help.
            </Text>
          </View>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />

            <Text style={styles.text}>
              Improve FoodE services and user experience.
            </Text>
          </View>
        </View>

        {/* Data Protection */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.accentBar} />

            <Text style={styles.heading}>
              Data Protection
            </Text>
          </View>

          <Text style={styles.text}>
            We do not sell your personal information.
            Your data is securely stored and used only
            for providing FoodE services.
          </Text>

          <View style={styles.privacyNote}>
            <CheckCircle
              size={18}
              color={ORANGE}
              weight="fill"
              style={styles.privacyNoteIcon}
            />

            <Text style={styles.privacyNoteText}>
              We value your privacy and aim to handle
              your information responsibly.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>
            FoodE Privacy
          </Text>

          <Text style={styles.footerText}>
            Your trust matters to us.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',

    paddingTop:
      Platform.OS === 'android'
        ? StatusBar.currentHeight ?? 0
        : 0,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
  },

  // Header
  header: {
    marginBottom: 24,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  titleIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFF0E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  title: {
    flexShrink: 1,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.6,
  },

  subtitle: {
    marginTop: 9,
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },

  updatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0E3',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 14,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: ORANGE,
    marginRight: 7,
  },

  updatedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C45D0A',
  },

  // Policy Cards
  card: {
    width: '100%',
    backgroundColor: '#FFFCF8',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,

    borderWidth: 1,
    borderColor: '#F0F0F0',

    elevation: 2,

    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  accentBar: {
    width: 4,
    height: 23,
    borderRadius: 4,
    backgroundColor: ORANGE,
    marginRight: 10,
  },

  heading: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 24,
  },

  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 14,
  },

  // Policy List Items
  policyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 13,
    width: '100%',
  },

  bullet: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: ORANGE,
    marginTop: 8,
    marginRight: 11,
  },

  text: {
    flex: 1,
    flexShrink: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 23,
  },

  // Privacy Note
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF7F0',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FFE5D0',
  },

  privacyNoteIcon: {
    marginRight: 9,
    marginTop: 1,
  },

  privacyNoteText: {
    flex: 1,
    flexShrink: 1,
    fontSize: 13,
    color: '#7C4A24',
    lineHeight: 20,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 8,
  },

  footerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
  },

  footerText: {
    fontSize: 12,
    color: '#B0B5BE',
    marginTop: 4,
  },
});