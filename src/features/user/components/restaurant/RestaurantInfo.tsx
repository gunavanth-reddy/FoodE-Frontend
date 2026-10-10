import React from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Clock,
  CurrencyInr,
  MapPin,
  ShoppingBag,
  Star,
  Tag,
  CheckCircle,
} from 'phosphor-react-native';

import type {Restaurant} from '../home/restaurant/restaurantData';
import {formatTimeRange12} from '../../../../utils/time';

// =====================================================
// TYPES
// =====================================================

type DeliveryTimeValue =
  | number
  | string
  | {min?: number; max?: number};

type DeliverySlot = {
  name?: string;
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
  deliveryTime?: DeliveryTimeValue;
};

type RestaurantDisplayData = {
  name?: string;
  _id?: string;
  description?: string;
  cuisines?: string[] | string;
  rating?: number;
  totalReviews?: number;
  address?: string;
  city?: string;
  deliveryMode?: 'standard' | 'time_slots';
  deliveryTime?: DeliveryTimeValue;
  deliverySlots?: DeliverySlot[];
  deliveryFee?: number;
  minimumOrder?: number;
  openingTime?: string;
  closingTime?: string;
  isOpen?: boolean;
  isActive?: boolean;
  distance?: string | number;
  priceForTwo?: number;
  offer?: string;
  freeDelivery?: boolean;
  isVeg?: boolean;
};

interface RestaurantInfoProps {
  restaurant: Restaurant;
}

// =====================================================
// COMPONENT
// =====================================================

const RestaurantInfo: React.FC<RestaurantInfoProps> = ({
  restaurant,
}) => {
  // Separate display fields from the app's Restaurant interface
  // to avoid conflicting intersection types.
  const data = restaurant as unknown as RestaurantDisplayData;

  // ===================================================
  // FORMAT DATA
  // ===================================================

  const cuisineText = Array.isArray(data.cuisines)
    ? data.cuisines.join(' • ')
    : data.cuisines || '';

  const rating =
    typeof data.rating === 'number' && data.rating > 0
      ? data.rating.toFixed(1)
      : null;

  const reviewCount =
    typeof data.totalReviews === 'number' && data.totalReviews > 0
      ? data.totalReviews
      : null;

  const addressText = [data.address, data.city]
    .filter(
      (value): value is string =>
        typeof value === 'string' && value.trim().length > 0,
    )
    .join(', ');

  // IMPORTANT:
  // React Native <Text> can render strings/numbers, but NOT objects.
  // Backend deliveryTime may arrive as {min, max}, so ALWAYS normalize it
  // to a string before rendering.
  const formatDeliveryTime = (value: unknown): string | null => {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return `${value} min`;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed ? `${trimmed} min` : null;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      const range = value as Record<string, unknown>;

      const min =
        typeof range.min === 'number' && Number.isFinite(range.min)
          ? range.min
          : null;

      const max =
        typeof range.max === 'number' && Number.isFinite(range.max)
          ? range.max
          : null;

      if (min !== null && max !== null) {
        return `${min}–${max} min`;
      }

      if (min !== null) {
        return `${min} min`;
      }

      if (max !== null) {
        return `${max} min`;
      }
    }

    return null;
  };

  const activeSlots = Array.isArray(data.deliverySlots)
    ? data.deliverySlots.filter(slot => slot?.isActive === true)
    : [];

  const deliveryTimeText = formatDeliveryTime(data.deliveryTime);
  const usesTimeSlots = data.deliveryMode === 'time_slots';

  const deliveryFeeText =
    typeof data.deliveryFee === 'number'
      ? data.deliveryFee === 0
        ? 'Free'
        : `₹${data.deliveryFee}`
      : null;

  const minimumOrderText =
    typeof data.minimumOrder === 'number'
      ? `₹${data.minimumOrder}`
      : null;

  const openingHours =
    data.openingTime || data.closingTime
      ? formatTimeRange12(data.openingTime, data.closingTime)
      : null;

  // ===================================================
  // RESTAURANT STATUS
  // ===================================================

  const hasStatus =
    typeof data.isOpen === 'boolean' ||
    typeof data.isActive === 'boolean';

  const isRestaurantOpen =
    data.isOpen !== false && data.isActive !== false;

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <View style={styles.container}>
      {/* RESTAURANT NAME */}

      <Text style={styles.name}>
        {data.name || 'Restaurant'}
      </Text>

      {/* DESCRIPTION */}

      {data.description ? (
        <Text style={styles.description}>
          {data.description}
        </Text>
      ) : null}

      {/* RATING */}

      <View style={styles.ratingRow}>
        {rating ? (
          <View style={styles.ratingBadge}>
            <Star
              size={13}
              weight="fill"
              color="#FFFFFF"
            />

            <Text style={styles.rating}>
              {rating}
            </Text>
          </View>
        ) : (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>
              NEW
            </Text>
          </View>
        )}

        <Text style={styles.reviewText}>
          {reviewCount !== null
            ? `${reviewCount} reviews`
            : rating
              ? 'Customer rating'
              : 'Be the first to review'}
        </Text>

        {hasStatus && (
          <View
            style={[
              styles.statusBadge,
              isRestaurantOpen
                ? styles.openBadge
                : styles.closedBadge,
            ]}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isRestaurantOpen
                    ? '#16A34A'
                    : '#DC2626',
                },
              ]}
            />

            <Text
              style={[
                styles.statusText,
                {
                  color: isRestaurantOpen
                    ? '#15803D'
                    : '#B91C1C',
                },
              ]}>
              {isRestaurantOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        )}
      </View>

      {/* CUISINES */}

      {cuisineText ? (
        <Text style={styles.cuisine}>
          {cuisineText}
        </Text>
      ) : null}

      {/* ADDRESS */}

      {addressText ? (
        <View style={styles.addressRow}>
          <MapPin
            size={19}
            weight="fill"
            color="#FF7A00"
          />

          <Text style={styles.address}>
            {addressText}
          </Text>
        </View>
      ) : null}

      {/* DIVIDER */}

      <View style={styles.divider} />

      {/* DELIVERY INFORMATION */}

      <View style={styles.infoRow}>
        {!usesTimeSlots && deliveryTimeText ? (
          <View style={styles.infoItem}>
            <View style={styles.infoIconBox}>
              <Clock
                size={18}
                weight="regular"
                color="#FF7A00"
              />
            </View>

            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>
                DELIVERY
              </Text>

              <Text style={styles.infoValue}>
                {deliveryTimeText}
              </Text>
            </View>
          </View>
        ) : null}

        {deliveryFeeText !== null ? (
          <View style={styles.infoItem}>
            <View style={styles.infoIconBox}>
              <CurrencyInr
                size={18}
                weight="bold"
                color="#FF7A00"
              />
            </View>

            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>
                DELIVERY FEE
              </Text>

              <Text style={styles.infoValue}>
                {deliveryFeeText}
              </Text>
            </View>
          </View>
        ) : null}

        {minimumOrderText !== null ? (
          <View style={styles.infoItem}>
            <View style={styles.infoIconBox}>
              <ShoppingBag
                size={18}
                weight="regular"
                color="#FF7A00"
              />
            </View>

            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>
                MIN. ORDER
              </Text>

              <Text style={styles.infoValue}>
                {minimumOrderText}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* TIME-SLOT DELIVERY */}

      {usesTimeSlots ? (
        <View style={styles.slotsSection}>
          <Text style={styles.slotsTitle}>
            Delivery Slots
          </Text>

          {activeSlots.length > 0 ? (
            activeSlots.map((slot, index) => {
              const rawSlotDeliveryTime: unknown =
                slot.deliveryTime;

              const slotTime =
                formatDeliveryTime(rawSlotDeliveryTime);

              const slotHours = [
                slot.startTime,
                slot.endTime,
              ]
                .filter(Boolean)
                .join(' – ');

              return (
                <View
                  key={`${slot.name || 'slot'}-${index}`}
                  style={styles.slotCard}>
                  <View style={styles.slotContent}>
                    <Text style={styles.slotName}>
                      {slot.name || 'Delivery Slot'}
                    </Text>

                    {!!slotHours && (
                      <Text style={styles.slotHours}>
                        {slotHours}
                      </Text>
                    )}
                  </View>

                  <Text style={styles.slotEstimate}>
                    {slotTime || 'Time varies'}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.noSlotsText}>
              No delivery slots currently available.
            </Text>
          )}
        </View>
      ) : null}

      {/* OPENING HOURS */}

      {openingHours ? (
        <View style={styles.hoursCard}>
          <Clock
            size={22}
            weight="regular"
            color="#FF7A00"
          />

          <View style={styles.hoursContent}>
            <Text style={styles.hoursTitle}>
              Opening Hours
            </Text>

            <Text style={styles.hoursValue}>
              {openingHours}
            </Text>
          </View>
        </View>
      ) : null}

      {/* FREE DELIVERY */}

      {data.freeDelivery === true ||
      data.deliveryFee === 0 ? (
        <View style={styles.deliveryCard}>
          <CheckCircle
            size={19}
            weight="fill"
            color="#15803D"
          />

          <Text style={styles.deliveryText}>
            Free Delivery Available
          </Text>
        </View>
      ) : null}

      {/* VEG / NON-VEG */}

      {typeof data.isVeg === 'boolean' ? (
        <View style={styles.typeRow}>
          <View
            style={[
              styles.typeChip,
              data.isVeg
                ? styles.vegChip
                : styles.nonVegChip,
            ]}>
            <View
              style={[
                styles.vegDot,
                {
                  borderColor: data.isVeg
                    ? '#15803D'
                    : '#B91C1C',
                },
              ]}>
              <View
                style={[
                  styles.vegInnerDot,
                  {
                    backgroundColor: data.isVeg
                      ? '#15803D'
                      : '#B91C1C',
                  },
                ]}
              />
            </View>

            <Text
              style={[
                styles.typeText,
                {
                  color: data.isVeg
                    ? '#15803D'
                    : '#B91C1C',
                },
              ]}>
              {data.isVeg ? 'Pure Veg' : 'Non-Veg'}
            </Text>
          </View>
        </View>
      ) : null}

      {/* OFFER */}

      {data.offer ? (
        <View style={styles.offerCard}>
          <Tag
            size={17}
            weight="fill"
            color="#EA580C"
          />

          <Text style={styles.offerText}>
            {data.offer}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export default RestaurantInfo;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 18,
  },

  name: {
    fontSize: 22,
    fontWeight: '900',
    color: '#171B24',
    letterSpacing: -0.5,
  },

  description: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: '#777E89',
  },

  // RATING

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },

  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15803D',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  rating: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    marginLeft: 4,
  },

  newBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFF1E4',
  },

  newBadgeText: {
    color: '#C85C00',
    fontSize: 11,
    fontWeight: '900',
  },

  reviewText: {
    marginLeft: 9,
    color: '#777E89',
    fontSize: 12,
    fontWeight: '600',
  },

  // STATUS

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  openBadge: {
    backgroundColor: '#DCFCE7',
  },

  closedBadge: {
    backgroundColor: '#FEE2E2',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },

  // CUISINE

  cuisine: {
    marginTop: 7,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },

  // ADDRESS

  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 7,
  },

  address: {
    flex: 1,
    marginLeft: 7,
    fontSize: 12,
    lineHeight: 17,
    color: '#4B5563',
  },

  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginTop: 12,
    marginBottom: 12,
  },

  // DELIVERY INFO

  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '45%',
  },

  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF1E4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoTextContainer: {
    marginLeft: 9,
    flexShrink: 1,
  },

  infoLabel: {
    fontSize: 9,
    color: '#858B95',
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  infoValue: {
    marginTop: 3,
    fontSize: 13,
    color: '#171B24',
    fontWeight: '800',
  },

  // DELIVERY SLOTS

  slotsSection: {
    marginTop: 10,
    padding: 10,
    borderRadius: 14,
    backgroundColor: '#FFF8F1',
  },

  slotsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#171B24',
    marginBottom: 8,
  },

  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: '#F3E4D5',
  },

  slotContent: {
    flex: 1,
    paddingRight: 8,
  },

  slotName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#292D35',
  },

  slotHours: {
    fontSize: 11,
    color: '#777E89',
    marginTop: 3,
  },

  slotEstimate: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C85C00',
  },

  noSlotsText: {
    fontSize: 12,
    color: '#777E89',
  },

  // OPENING HOURS

  hoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    borderRadius: 14,
    backgroundColor: '#F7F8FA',
  },

  hoursContent: {
    flex: 1,
    marginLeft: 10,
  },

  hoursTitle: {
    fontSize: 12,
    color: '#858B95',
    fontWeight: '600',
  },

  hoursValue: {
    marginTop: 3,
    fontSize: 14,
    color: '#171B24',
    fontWeight: '800',
  },

  // FREE DELIVERY

  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 10,
  },

  deliveryText: {
    marginLeft: 8,
    color: '#15803D',
    fontWeight: '700',
    fontSize: 13,
  },

  // VEG / NON-VEG

  typeRow: {
    marginTop: 9,
    flexDirection: 'row',
  },

  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },

  vegChip: {
    backgroundColor: '#DCFCE7',
  },

  nonVegChip: {
    backgroundColor: '#FEE2E2',
  },

  vegDot: {
    width: 13,
    height: 13,
    borderWidth: 1.5,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  vegInnerDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },

  typeText: {
    fontWeight: '800',
    fontSize: 12,
  },

  // OFFER

  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
    backgroundColor: '#FFF7ED',
    padding: 12,
    borderRadius: 10,
  },

  offerText: {
    marginLeft: 8,
    color: '#EA580C',
    fontWeight: '700',
    fontSize: 13,
    flex: 1,
  },
});