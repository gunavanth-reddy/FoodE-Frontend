import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  MapPin,
  CheckCircle,
  NavigationArrow,
  Bicycle,
  Info,
  ShieldCheck,
} from 'phosphor-react-native';

const ORANGE = '#FF6B00';

const AddressScreen: React.FC = () => {
  const {width} = useWindowDimensions();

  const horizontalPadding = width < 360 ? 16 : 22;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7F8FA"
        translucent={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
          },
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Saved Addresses</Text>

          <Text style={styles.subtitle}>
            Your delivery location for FoodE.
          </Text>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Location</Text>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>1</Text>
          </View>
        </View>

        {/* Address Card */}
        <View style={styles.addressCard}>
          {/* Top Row */}
          <View style={styles.cardTopRow}>
            <View style={styles.locationIcon}>
              <MapPin
                size={25}
                color={ORANGE}
                weight="fill"
              />
            </View>

            <View style={styles.defaultBadge}>
              <CheckCircle
                size={14}
                color="#15803D"
                weight="fill"
              />

              <Text style={styles.defaultBadgeText}>
                DEFAULT
              </Text>
            </View>
          </View>

          {/* Address Details */}
          <Text style={styles.addressLabel}>University</Text>

          <Text style={styles.universityName}>
            SRM AP University
          </Text>

          <View style={styles.addressLine}>
            <NavigationArrow
              size={16}
              color="#6B7280"
              weight="regular"
            />

            <Text style={styles.addressText}>
              Gate 3, Neerukonda
            </Text>
          </View>

          <Text style={styles.cityText}>
            Mangalagiri, Andhra Pradesh - 522240
          </Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Delivery Status */}
          <View style={styles.deliveryRow}>
            <View style={styles.deliveryIcon}>
              <Bicycle
                size={19}
                color={ORANGE}
                weight="regular"
              />
            </View>

            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryTitle}>
                Available for delivery
              </Text>

              <Text style={styles.deliverySubtitle}>
                FoodE currently serves this location.
              </Text>
            </View>

            <CheckCircle
              size={21}
              color="#16A34A"
              weight="fill"
            />
          </View>
        </View>

        {/* Service Area Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Info
              size={22}
              color={ORANGE}
              weight="regular"
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              FoodE V1 Service Area
            </Text>

            <Text style={styles.infoText}>
              FoodE currently delivers only to SRM AP
              University, Gate 3. Additional locations
              may be introduced in future versions.
            </Text>
          </View>
        </View>

        {/* Bottom Note */}
        <View style={styles.footerNote}>
          <ShieldCheck
            size={16}
            color="#9CA3AF"
            weight="regular"
          />

          <Text style={styles.footerText}>
            Your delivery location is fixed for V1.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddressScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  content: {
    paddingTop: 20,
    paddingBottom: 36,
  },

  header: {
    marginBottom: 28,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.6,
  },

  subtitle: {
    marginTop: 7,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 21,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },

  countBadge: {
    marginLeft: 9,
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: ORANGE,
  },

  addressCard: {
    backgroundColor: '#FFFCF8',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F1F1',

    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.045,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  locationIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFF3E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
  },

  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },

  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },

  universityName: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 29,
  },

  addressLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 7,
  },

  addressText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },

  cityText: {
    marginTop: 6,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },

  divider: {
    height: 1,
    backgroundColor: '#F1F2F4',
    marginVertical: 20,
  },

  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  deliveryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  deliveryInfo: {
    flex: 1,
  },

  deliveryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },

  deliverySubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 22,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },

  infoIcon: {
    marginRight: 11,
    marginTop: 1,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9A3412',
    marginBottom: 6,
  },

  infoText: {
    fontSize: 12,
    color: '#9A3412',
    lineHeight: 19,
  },

  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 7,
  },

  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});