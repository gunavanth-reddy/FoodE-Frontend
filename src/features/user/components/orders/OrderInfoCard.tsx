import React from 'react';
import {Storefront, Bicycle, Money, MapPin} from 'phosphor-react-native';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

// =====================================================
// TYPES
// =====================================================

interface OrderItem {
  _id?: string;

  name?: string;

  quantity?: number;

  price?: number;

  discountedPrice?: number | null;

  total?: number;

  food?:
    | string
    | {
        _id?: string;
        name?: string;
      };
}

interface OrderInfoCardProps {
  orderId?: string;

  restaurantName?: string;

  paymentMethod?: string;

  deliveryStartTime?: string;

  deliveryEndTime?: string;

  estimatedDelivery?: string;

  subtotal?: number;

  deliveryFee?: number;

  total?: number;

  items?: OrderItem[];
}

// =====================================================
// FORMAT TIME
// =====================================================

const formatTime = (
  time?: string,
): string => {
  if (!time) {
    return '--';
  }

  const parts = time.split(':');

  if (parts.length < 2) {
    return time;
  }

  const hour = Number(parts[0]);
  const minute = Number(parts[1]);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return time;
  }

  const period =
    hour >= 12 ? 'PM' : 'AM';

  const displayHour =
    hour % 12 || 12;

  return `${displayHour}:${String(
    minute,
  ).padStart(2, '0')} ${period}`;
};

// =====================================================
// FOOD NAME
// =====================================================

const getFoodName = (
  item: OrderItem,
): string => {
  if (item.name) {
    return item.name;
  }

  if (
    item.food &&
    typeof item.food === 'object'
  ) {
    return (
      item.food.name ||
      'Food Item'
    );
  }

  return 'Food Item';
};

// =====================================================
// ITEM PRICE
// =====================================================

const getItemPrice = (
  item: OrderItem,
): number => {
  const quantity =
    Number(item.quantity || 1);

  // Always use the original food price
  // saved in the order.
  const price =
    Number(item.price || 0);

  return price * quantity;
};

// =====================================================
// CALCULATE ITEMS TOTAL
// =====================================================

const calculateItemsTotal = (
  items: OrderItem[],
): number => {
  if (!Array.isArray(items)) {
    return 0;
  }

  return items.reduce(
    (
      total: number,
      item: OrderItem,
    ) => {
      return (
        total +
        getItemPrice(item)
      );
    },
    0,
  );
};

// =====================================================
// COMPONENT
// =====================================================

const OrderInfoCard: React.FC<
  OrderInfoCardProps
> = ({
  orderId,

  restaurantName,

  paymentMethod =
    'Cash on Delivery',

  deliveryStartTime,

  deliveryEndTime,

  estimatedDelivery,

  subtotal = 0,

  deliveryFee = 0,

  total = 0,

  items = [],
}) => {
  // ===================================================
  // SAFE ITEMS
  // ===================================================

  const safeItems =
    Array.isArray(items)
      ? items
      : [];

  // ===================================================
  // FOOD ITEM TOTAL
  // ===================================================

  /*
   * IMPORTANT:
   *
   * Calculate directly from the
   * actual order items.
   *
   * Example:
   *
   * Biryani × 2 = ₹300
   * Burger × 1  = ₹120
   *
   * Item Total = ₹420
   */

  const itemsTotal =
    calculateItemsTotal(
      safeItems,
    );

  // ===================================================
  // FALLBACK SUBTOTAL
  // ===================================================

  const backendSubtotal =
    Number(subtotal || 0);

  /*
   * Prefer calculated item total.
   *
   * If items are somehow unavailable,
   * use backend subtotal.
   */

  const safeSubtotal =
    itemsTotal > 0
      ? itemsTotal
      : backendSubtotal;

  // ===================================================
  // DELIVERY FEE
  // ===================================================

  const safeDeliveryFee =
    Number(deliveryFee || 0);

  // ===================================================
  // TOTAL
  // ===================================================

  /*
   * NO DISCOUNT.
   *
   * Total =
   * Item Total + Delivery Charges
   */

  const calculatedTotal =
    Math.max(
      0,
      safeSubtotal +
        safeDeliveryFee,
    );

  const backendTotal =
    Number(total || 0);

  const finalTotal =
    calculatedTotal > 0
      ? calculatedTotal
      : backendTotal;

  return (
    <View style={styles.card}>

      {/* =========================================
          HEADER
      ========================================= */}

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>
            Order Details
          </Text>

          <Text style={styles.orderNumber}>
            #{orderId || '—'}
          </Text>
        </View>

        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />

          <Text style={styles.statusText}>
            PLACED
          </Text>
        </View>
      </View>

      {/* =========================================
          RESTAURANT
      ========================================= */}

      <View style={styles.restaurantBox}>
        <View style={styles.iconCircle}>
          <Storefront size={20} color="#FF7A00" weight="duotone" />
        </View>

        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantLabel}>
            Restaurant
          </Text>

          <Text
            style={styles.restaurantName}
            numberOfLines={1}
          >
            {restaurantName ||
              'Restaurant'}
          </Text>
        </View>
      </View>

      {/* =========================================
          FOOD ITEMS
      ========================================= */}

      {safeItems.length > 0 && (
        <>
          <View
            style={styles.divider}
          />

          <Text
            style={styles.sectionTitle}
          >
            Your Items
          </Text>

          <View
            style={
              styles.itemsContainer
            }
          >
            {safeItems.map(
              (
                item: OrderItem,
                index: number,
              ) => {
                const quantity =
                  Number(
                    item.quantity || 1,
                  );

                const foodName =
                  getFoodName(item);

                const itemPrice =
                  getItemPrice(item);

                return (
                  <View
                    key={
                      item._id ||
                      `${foodName}-${index}`
                    }
                    style={[
                      styles.itemRow,

                      index ===
                        safeItems.length -
                          1 &&
                        styles.lastItemRow,
                    ]}
                  >
                    {/* LEFT */}

                    <View
                      style={
                        styles.itemLeft
                      }
                    >
                      <View
                        style={
                          styles.quantityBadge
                        }
                      >
                        <Text
                          style={
                            styles.quantityText
                          }
                        >
                          {quantity}x
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.itemName
                        }
                        numberOfLines={1}
                      >
                        {foodName}
                      </Text>
                    </View>

                    {/* RIGHT */}

                    <Text
                      style={
                        styles.itemPrice
                      }
                    >
                      ₹
                      {itemPrice.toFixed(
                        0,
                      )}
                    </Text>
                  </View>
                );
              },
            )}
          </View>
        </>
      )}

      {/* =========================================
          DELIVERY
      ========================================= */}

      <View
        style={styles.divider}
      />

      <Text
        style={styles.sectionTitle}
      >
        Delivery
      </Text>

      <View style={styles.infoRow}>
        <View
          style={styles.infoIcon}
        >
          <Bicycle size={19} color="#FF7A00" weight="duotone" />
        </View>

        <View
          style={styles.infoContent}
        >
          <Text
            style={styles.infoLabel}
          >
            Estimated delivery
          </Text>

          <Text
            style={styles.infoValue}
          >
            {estimatedDelivery ||
              'Delivery in 25–40 mins'}
          </Text>
        </View>
      </View>

      {(deliveryStartTime ||
        deliveryEndTime) && (
        <View
          style={styles.slotBox}
        >
          <Text
            style={styles.slotLabel}
          >
            Delivery slot
          </Text>

          <Text
            style={styles.slotValue}
          >
            {formatTime(
              deliveryStartTime,
            )}

            {' – '}

            {formatTime(
              deliveryEndTime,
            )}
          </Text>
        </View>
      )}

      {/* =========================================
          PAYMENT
      ========================================= */}

      <View style={styles.infoRow}>
        <View
          style={styles.infoIcon}
        >
          <Money size={19} color="#FF7A00" weight="duotone" />
        </View>

        <View
          style={styles.infoContent}
        >
          <Text
            style={styles.infoLabel}
          >
            Payment
          </Text>

          <Text
            style={styles.infoValue}
          >
            {paymentMethod}
          </Text>
        </View>
      </View>

      {/* =========================================
          PRICE BREAKDOWN
      ========================================= */}

      <View
        style={styles.divider}
      />

      <Text
        style={styles.sectionTitle}
      >
        Price Breakdown
      </Text>

      {/* ITEM TOTAL */}

      <View style={styles.priceRow}>
        <Text
          style={styles.priceLabel}
        >
          Item Total
        </Text>

        <Text
          style={styles.priceValue}
        >
          ₹{safeSubtotal.toFixed(0)}
        </Text>
      </View>

      {/* DELIVERY */}

      <View style={styles.priceRow}>
        <Text
          style={styles.priceLabel}
        >
          Delivery Charges
        </Text>

        <Text
          style={styles.priceValue}
        >
          ₹
          {safeDeliveryFee.toFixed(
            0,
          )}
        </Text>
      </View>

      {/* =========================================
          TOTAL
      ========================================= */}

      <View
        style={styles.totalBox}
      >
        <View>
          <Text
            style={styles.totalLabel}
          >
            Total Amount
          </Text>

          <Text
            style={styles.totalSubLabel}
          >
            Including all charges
          </Text>
        </View>

        <Text
          style={styles.totalValue}
        >
          ₹{finalTotal.toFixed(0)}
        </Text>
      </View>

      {/* =========================================
          ADDRESS
      ========================================= */}

      <View
        style={styles.divider}
      />

      <Text
        style={styles.sectionTitle}
      >
        Delivering To
      </Text>

      <View
        style={styles.addressRow}
      >
        <View
          style={styles.addressIcon}
        >
          <MapPin size={19} color="#FF7A00" weight="duotone" />
        </View>

        <View
          style={styles.addressContent}
        >
          <Text
            style={styles.addressTitle}
          >
            SRM AP University
          </Text>

          <Text
            style={styles.addressText}
          >
            Gate Number 3
          </Text>

          <Text
            style={styles.addressText}
          >
            Neerukonda, Andhra Pradesh
          </Text>
        </View>
      </View>
    </View>
  );
};

export default OrderInfoCard;

// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({
    card: {
      width: '100%',
      backgroundColor: '#FFFCF8',
      borderRadius: 24,
      padding: 20,
      marginTop: 30,

      borderWidth: 1,
      borderColor: '#F0F0F0',

      shadowColor: '#000',
      shadowOpacity: 0.07,
      shadowRadius: 18,
      shadowOffset: {
        width: 0,
        height: 7,
      },

      elevation: 6,
    },

    // ============================================
    // HEADER
    // ============================================

    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },

    title: {
      fontSize: 21,
      fontWeight: '800',
      color: '#111827',
    },

    orderNumber: {
      marginTop: 5,
      fontSize: 13,
      fontWeight: '600',
      color: '#8A8A8A',
    },

    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: '#FFF3EA',
    },

    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: '#FF5A00',
      marginRight: 6,
    },

    statusText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#FF5A00',
    },

    // ============================================
    // RESTAURANT
    // ============================================

    restaurantBox: {
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 15,
      backgroundColor: '#FAFAFA',
    },

    iconCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: '#FFF1E8',
      alignItems: 'center',
      justifyContent: 'center',
    },

    icon: {
      fontSize: 20,
    },

    restaurantInfo: {
      flex: 1,
      marginLeft: 12,
    },

    restaurantLabel: {
      fontSize: 11,
      color: '#888888',
      marginBottom: 3,
    },

    restaurantName: {
      fontSize: 15,
      fontWeight: '700',
      color: '#222222',
    },

    // ============================================
    // DIVIDER
    // ============================================

    divider: {
      height: 1,
      backgroundColor: '#EEEEEE',
      marginVertical: 18,
    },

    // ============================================
    // SECTION
    // ============================================

    sectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: '#222222',
      marginBottom: 12,
    },

    // ============================================
    // ITEMS
    // ============================================

    itemsContainer: {
      borderRadius: 12,
      backgroundColor: '#FAFAFA',
      paddingHorizontal: 12,
    },

    itemRow: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',

      borderBottomWidth: 1,
      borderBottomColor: '#EEEEEE',
    },

    lastItemRow: {
      borderBottomWidth: 0,
    },

    itemLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: 10,
    },

    quantityBadge: {
      minWidth: 34,
      height: 25,
      borderRadius: 7,
      backgroundColor: '#FFF1E8',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 9,
    },

    quantityText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#FF5A00',
    },

    itemName: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: '#333333',
    },

    itemPrice: {
      fontSize: 13,
      fontWeight: '700',
      color: '#222222',
    },

    // ============================================
    // INFO
    // ============================================

    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },

    infoIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#F8F8F8',
      alignItems: 'center',
      justifyContent: 'center',
    },

    infoContent: {
      flex: 1,
      marginLeft: 11,
    },

    infoLabel: {
      fontSize: 11,
      color: '#888888',
      marginBottom: 3,
    },

    infoValue: {
      fontSize: 14,
      fontWeight: '700',
      color: '#222222',
    },

    // ============================================
    // DELIVERY SLOT
    // ============================================

    slotBox: {
      padding: 12,
      borderRadius: 12,
      backgroundColor: '#F6FAF7',
      marginBottom: 15,
    },

    slotLabel: {
      fontSize: 11,
      color: '#777777',
      marginBottom: 4,
    },

    slotValue: {
      fontSize: 14,
      fontWeight: '700',
      color: '#32713A',
    },

    // ============================================
    // PRICE BREAKDOWN
    // ============================================

    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },

    priceLabel: {
      fontSize: 13,
      color: '#666666',
    },

    priceValue: {
      fontSize: 13,
      fontWeight: '700',
      color: '#333333',
    },

    // ============================================
    // TOTAL
    // ============================================

    totalBox: {
      marginTop: 8,
      paddingTop: 15,

      borderTopWidth: 1,
      borderTopColor: '#EEEEEE',

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    totalLabel: {
      fontSize: 17,
      fontWeight: '800',
      color: '#222222',
    },

    totalSubLabel: {
      marginTop: 3,
      fontSize: 10,
      color: '#999999',
    },

    totalValue: {
      fontSize: 24,
      fontWeight: '900',
      color: '#FF5A00',
    },

    // ============================================
    // ADDRESS
    // ============================================

    addressRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },

    addressIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FFF1E8',
      alignItems: 'center',
      justifyContent: 'center',
    },

    addressEmoji: {
      fontSize: 18,
    },

    addressContent: {
      flex: 1,
      marginLeft: 11,
    },

    addressTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: '#222222',
      marginBottom: 3,
    },

    addressText: {
      fontSize: 13,
      color: '#777777',
      lineHeight: 19,
    },
  });
