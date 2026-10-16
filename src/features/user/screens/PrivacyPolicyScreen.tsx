
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {
  Linking,
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
  LockKey,
  CheckCircle,
} from 'phosphor-react-native';

const ORANGE = '#FF7A00';

const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {width} = useWindowDimensions();

  const horizontalPadding = Math.min(
    Math.max(width * 0.05, 16),
    24,
  );

  const titleSize = Math.min(
    Math.max(width * 0.075, 25),
    32,
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}>

      <StatusBar
        backgroundColor={ORANGE}
        barStyle="light-content"
        hidden={false}
        translucent={false}
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
            {navigation.canGoBack() && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                activeOpacity={0.7}
                accessibilityLabel="Go back">

                <ArrowLeft
                  size={22}
                  color="#1E232C"
                  weight="bold"
                />
              </TouchableOpacity>
            )}

            <View style={styles.titleIcon}>
              <LockKey
                size={22}
                color={ORANGE}
                weight="regular"
              />
            </View>

            <Text
              style={[styles.title, {fontSize: titleSize}]}
              maxFontSizeMultiplier={1.3}>
              Privacy Policy
            </Text>
          </View>

          <Text style={styles.subtitle}>
            Your privacy matters to us at FoodE.
          </Text>

          <View style={styles.updatedBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.updatedText}>
              Student-focused. Privacy-conscious.
            </Text>
          </View>
        </View>

        {/* Introduction */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.accentBar} />
            <Text style={styles.heading}>Introduction</Text>
          </View>

          <Text style={styles.text}>
            FoodE is a food ordering platform designed for
            the SRM University–AP community. This Privacy
            Policy explains what information we collect,
            how we use it, and how it supports your use of
            the app.
          </Text>

          <Text style={[styles.text, styles.paragraph]}>
            By using FoodE, you acknowledge that your
            information may be processed as described in
            this policy.
          </Text>
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
            FoodE may collect the following information
            when you register and use the platform:
          </Text>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />
            <Text style={styles.text}>
              <Text style={styles.boldText}>
                University verification details:{' '}
              </Text>
              relevant details obtained from or verified
              against SRM University–AP ERP records, where
              authorized and available, to verify student
              eligibility.
            </Text>
          </View>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />
            <Text style={styles.text}>
              <Text style={styles.boldText}>
                Mobile number:{' '}
              </Text>
              used for account identification and
              verification. FoodE does not use email
              addresses as its account registration method.
            </Text>
          </View>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />
            <Text style={styles.text}>
              <Text style={styles.boldText}>
                Order and delivery information:{' '}
              </Text>
              food selections, order history, delivery
              address, and contact details required to
              fulfil your order.
            </Text>
          </View>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />
            <Text style={styles.text}>
              <Text style={styles.boldText}>
                App and notification information:{' '}
              </Text>
              device notification tokens and relevant
              technical information needed to provide
              notifications and operate the app.
            </Text>
          </View>
        </View>

        {/* ERP Verification */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.accentBar} />
            <Text style={styles.heading}>
              University ERP Verification
            </Text>
          </View>

          <Text style={styles.text}>
            FoodE may use authorized SRM University–AP ERP
            information to verify whether a user is eligible
            to access student-focused services.
          </Text>

          <Text style={[styles.text, styles.paragraph]}>
            ERP information is intended for verification
            and related account eligibility purposes. FoodE
            does not intend to use university records for
            unrelated purposes.
          </Text>

          <Text style={[styles.text, styles.paragraph]}>
            Access to ERP information should be limited to
            authorized access and the information necessary
            for verification. FoodE does not claim to be
            an official university service unless formally
            authorized to represent itself as one.
          </Text>
        </View>

        {/* How We Use Information */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.accentBar} />
            <Text style={styles.heading}>
              How We Use Your Information
            </Text>
          </View>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />
            <Text style={styles.text}>
              Register accounts and verify eligible users.
            </Text>
          </View>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />
            <Text style={styles.text}>
              Process food orders and coordinate delivery.
            </Text>
          </View>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />
            <Text style={styles.text}>
              Send order updates, including order confirmation
              and delivery notifications.
            </Text>
          </View>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />
            <Text style={styles.text}>
              Respond to support requests and maintain
              platform safety.
            </Text>
          </View>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />
            <Text style={styles.text}>
              Maintain, troubleshoot, and improve FoodE.
            </Text>
          </View>
        </View>

        {/* Sharing */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.accentBar} />
            <Text style={styles.heading}>
              Information Sharing
            </Text>
          </View>

          <Text style={styles.text}>
            Information necessary to fulfil an order, such
            as the relevant order details and delivery
            contact information, may be shared with the
            restaurant or delivery personnel involved in
            fulfilling that order.
          </Text>

          <Text style={[styles.text, styles.paragraph]}>
            Information may also be processed by service
            providers that support FoodE, such as hosting
            and notification services, or disclosed when
            required by applicable law. We aim to limit
            sharing to what is reasonably necessary for
            these purposes.
          </Text>
        </View>

        {/* Data Protection */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.accentBar} />
            <Text style={styles.heading}>
              Data Protection and Retention
            </Text>
          </View>

          <Text style={styles.text}>
            FoodE aims to use reasonable safeguards to
            protect personal information against
            unauthorized access, disclosure, alteration,
            or loss.
          </Text>

          <Text style={[styles.text, styles.paragraph]}>
            Information is retained for as long as
            reasonably necessary to operate the platform,
            maintain relevant records, resolve disputes,
            and meet applicable legal requirements.
          </Text>

          <View style={styles.privacyNote}>
            <CheckCircle
              size={18}
              color={ORANGE}
              weight="fill"
              style={styles.privacyNoteIcon}
            />
            <Text style={styles.privacyNoteText}>
              We do not sell personal information as a
              business practice.
            </Text>
          </View>
        </View>

        {/* User Rights */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.accentBar} />
            <Text style={styles.heading}>
              Your Choices and Rights
            </Text>
          </View>

          <Text style={styles.text}>
            You can contact the FoodE team to ask about
            your personal information, request correction
            of inaccurate details, or request account
            deletion, subject to applicable legal and
            operational requirements.
          </Text>

          <Text style={[styles.text, styles.paragraph]}>
            You can also manage notification permissions
            through your device settings. Disabling
            notifications may prevent you from receiving
            order updates as push notifications.
          </Text>
        </View>

        {/* Policy Changes */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.accentBar} />
            <Text style={styles.heading}>
              Changes to This Policy
            </Text>
          </View>

          <Text style={styles.text}>
            This policy may be updated as FoodE features,
            university verification processes, or legal
            requirements change. Updated wording will be
            published on this screen along with a revised
            effective date where appropriate.
          </Text>
        </View>

        {/* Contact */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.accentBar} />
            <Text style={styles.heading}>
              Contact FoodE
            </Text>
          </View>

          <Text style={styles.text}>
            For privacy questions, data correction requests,
            or account deletion requests, contact FoodE at
            foodeforus@gmail.com. You can also submit an
            account deletion request without signing in at
            https://foode.site/delete-account.html.
          </Text>

          <Text style={[styles.text, styles.paragraph]}>
            Include the mobile number on your account so
            support can verify and locate it. Never send
            your password or one-time codes.
          </Text>

          <TouchableOpacity
            onPress={() =>
              Linking.openURL('https://foode.site/privacy-policy.html')
            }
            accessibilityRole="link"
            style={styles.publicPolicyLink}>
            <Text style={styles.publicPolicyLinkText}>
              Open the public FoodE Privacy Policy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Linking.openURL('https://foode.site/delete-account.html')
            }
            accessibilityRole="link"
            style={styles.publicPolicyLink}>
            <Text style={styles.publicPolicyLinkText}>
              Request account deletion
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>FoodE Privacy</Text>
          <Text style={styles.footerText}>
            Built for a better campus food experience.
          </Text>
          <Text style={styles.footerSmall}>
            Please review this policy periodically.
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
  },

  scrollView: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
  },

  header: {
    marginBottom: 24,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
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

  boldText: {
    fontWeight: '700',
    color: '#374151',
  },

  paragraph: {
    marginTop: 12,
  },

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

  footer: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 8,
  },

  publicPolicyLink: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingVertical: 4,
  },

  publicPolicyLinkText: {
    color: '#B84E00',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
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

  footerSmall: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
});
