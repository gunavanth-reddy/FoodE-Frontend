import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';

import {
  Question,
  Envelope,
  Globe,
  Clock,
  Warning,
} from 'phosphor-react-native';
import AppBackButton from '../../../components/buttons/AppBackButton';

const ORANGE = '#FF7A00';

const HelpCenterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {width} = useWindowDimensions();

  // Responsive spacing and typography
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
      <StatusBar backgroundColor="#FF7A00" barStyle="light-content" hidden={false} translucent={false} />

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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            {navigation.canGoBack() && (
              <AppBackButton />
            )}

            <View style={styles.titleIcon}>
              <Question
                size={24}
                color={ORANGE}
                weight="bold"
              />
            </View>

            <Text
              style={[
                styles.title,
                {fontSize: titleSize},
              ]}
              maxFontSizeMultiplier={1.3}>
              Help Center
            </Text>
          </View>

          <Text style={styles.subtitle}>
            We're here to help you.
          </Text>
        </View>

        {/* FAQ Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.accentBar} />

            <Text style={styles.heading}>
              Frequently Asked Questions
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.question}>
              How do I place an order?
            </Text>

            <Text style={styles.answer}>
              Browse restaurants, add your favourite food
              to your cart, and complete checkout.
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.faqItem}>
            <Text style={styles.question}>
              Can I cancel an order?
            </Text>

            <Text style={styles.answer}>
              Orders can be cancelled before the
              restaurant starts preparing your food.
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.faqItem}>
            <Text style={styles.question}>
              Where is FoodE available?
            </Text>

            <Text style={styles.answer}>
              FoodE v1 currently serves SRM AP University
              and nearby campus areas.
            </Text>
          </View>
        </View>

        {/* Contact Support */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.accentBar} />

            <Text style={styles.heading}>
              Contact Support
            </Text>
          </View>

          <Text style={styles.cardDescription}>
            Need help? Reach out to our support team.
          </Text>

          <View style={styles.contactItem}>
            <View style={styles.contactIcon}>
              <Envelope
                size={21}
                color={ORANGE}
                weight="regular"
              />
            </View>

            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>
                Email
              </Text>

              <Text
                style={styles.contactValue}
                selectable>
                foodeforus@gmail.com
              </Text>
            </View>
          </View>

          <View style={styles.contactItem}>
            <View style={styles.contactIcon}>
              <Globe
                size={21}
                color={ORANGE}
                weight="regular"
              />
            </View>

            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>
                Website
              </Text>

              <Text
                style={styles.contactValue}
                selectable>
                www.foode.app
              </Text>
            </View>
          </View>

          <View style={styles.contactItem}>
            <View style={styles.contactIcon}>
              <Clock
                size={21}
                color={ORANGE}
                weight="regular"
              />
            </View>

            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>
                Support Hours
              </Text>

              <Text style={styles.contactValue}>
                Monday – Sunday
              </Text>

              <Text style={styles.contactSubValue}>
                9:00 AM – 9:00 PM
              </Text>
            </View>
          </View>
        </View>

        {/* Report an Issue */}
        <View style={styles.reportCard}>
          <View style={styles.reportIcon}>
            <Warning
              size={21}
              color={ORANGE}
              weight="bold"
            />
          </View>

          <View style={styles.reportContent}>
            <Text style={styles.reportTitle}>
              Report an Issue
            </Text>

            <Text style={styles.reportDescription}>
              Experiencing a problem with FoodE? Contact
              our support team for assistance.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          FoodE • Made with care for your campus
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpCenterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
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
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF0E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
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

  // Cards
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
    marginBottom: 18,
  },

  accentBar: {
    width: 4,
    height: 22,
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
    lineHeight: 23,
  },

  // FAQ
  faqItem: {
    width: '100%',
  },

  question: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 22,
  },

  answer: {
    marginTop: 6,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    flexShrink: 1,
  },

  divider: {
    height: 1,
    backgroundColor: '#F1F2F4',
    marginVertical: 16,
  },

  // Contact Support
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 21,
    marginTop: -8,
    marginBottom: 16,
  },

  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },

  contactIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFF3E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  contactContent: {
    flex: 1,
    minWidth: 0,
  },

  contactLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 3,
  },

  contactValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    flexShrink: 1,
    lineHeight: 20,
  },

  contactSubValue: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 3,
    lineHeight: 19,
  },

  // Report Issue
  reportCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF7F0',
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#FFE5D0',
  },

  reportIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFE5D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  reportContent: {
    flex: 1,
    minWidth: 0,
  },

  reportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },

  reportDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    flexShrink: 1,
  },

  // Footer
  footer: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
});