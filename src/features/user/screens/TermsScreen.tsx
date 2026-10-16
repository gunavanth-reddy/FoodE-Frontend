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
  Scroll,
  Info,
} from 'phosphor-react-native';

const ORANGE = '#FF7A00';

const TermsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {width} = useWindowDimensions();

  const horizontalPadding = Math.min(
    Math.max(width * 0.05, 16),
    24,
  );

  const titleSize = Math.min(
    Math.max(width * 0.075, 24),
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
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            {navigation.canGoBack() && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                activeOpacity={0.7}>
                <ArrowLeft size={22} color="#1E232C" weight="bold" />
              </TouchableOpacity>
            )}

            <View style={styles.titleIcon}>
              <Scroll
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
              Terms & Conditions
            </Text>
          </View>

          <Text style={styles.subtitle}>
            Please read these terms before using FoodE.
          </Text>

          <View style={styles.badge}>
            <View style={styles.badgeDot} />

            <Text style={styles.badgeText}>
              FoodE • User Guidelines
            </Text>
          </View>
        </View>

        {/* Using FoodE */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.accentBar} />

            <Text style={styles.heading}>
              Using FoodE
            </Text>
          </View>

          <Text style={styles.description}>
            By using FoodE, you agree to follow these
            guidelines while accessing our services.
          </Text>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />

            <Text style={styles.text}>
              FoodE v1 currently serves only the
              SRM AP University campus and nearby areas.
            </Text>
          </View>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />

            <Text style={styles.text}>
              Users must provide accurate account
              information while placing orders.
            </Text>
          </View>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />

            <Text style={styles.text}>
              Orders are subject to restaurant
              availability.
            </Text>
          </View>
        </View>

        {/* Orders & Payments */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.accentBar} />

            <Text style={styles.heading}>
              Orders & Payments
            </Text>
          </View>

          <Text style={styles.description}>
            Please review the following conditions
            before confirming your order.
          </Text>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />

            <Text style={styles.text}>
              Prices shown in the app are provided
              by restaurant partners.
            </Text>
          </View>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />

            <Text style={styles.text}>
              Payment methods available may vary
              depending on the restaurant.
            </Text>
          </View>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />

            <Text style={styles.text}>
              Cash on Delivery is supported for
              eligible orders.
            </Text>
          </View>
        </View>

        {/* Cancellation & Refunds */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.accentBar} />

            <Text style={styles.heading}>
              Cancellation & Refunds
            </Text>
          </View>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />

            <Text style={styles.text}>
              Orders can only be cancelled before
              restaurant preparation begins.
            </Text>
          </View>

          <View style={styles.policyItem}>
            <View style={styles.bullet} />

            <Text style={styles.text}>
              Approved refunds will be processed
              according to the selected payment method.
            </Text>
          </View>
        </View>

        {/* Updates */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.accentBar} />

            <Text style={styles.heading}>
              Updates
            </Text>
          </View>

          <Text style={styles.text}>
            FoodE may update these Terms & Conditions
            as new features and services become available.
          </Text>

          <View style={styles.updateNote}>
            <Info
              size={17}
              color={ORANGE}
              weight="regular"
              style={styles.updateIcon}
            />

            <Text style={styles.updateText}>
              Please review this page periodically
              to stay informed about any changes.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>
            FoodE
          </Text>

          <Text style={styles.footerText}>
            Thank you for being part of our campus community.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
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

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0E3',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 14,
  },

  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: ORANGE,
    marginRight: 7,
  },

  badgeText: {
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
    width: '100%',
    marginBottom: 13,
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

  updateNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF7F0',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FFE5D0',
  },

  updateIcon: {
    marginRight: 9,
    marginTop: 1,
  },

  updateText: {
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

  footerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
  },

  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 4,
  },
});