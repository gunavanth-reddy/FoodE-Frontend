import React from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface BillSummaryProps {
  subtotal: number;
  deliveryFee: number;
}

const BillSummary: React.FC<BillSummaryProps> = ({
  subtotal,
  deliveryFee,
}) => {
  // Total includes only food price + delivery fee
  const grandTotal =
    Number(subtotal || 0) +
    Number(deliveryFee || 0);

  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>
            Bill Summary
          </Text>

          <Text style={styles.subtitle}>
            Your order breakdown
          </Text>
        </View>

        <View style={styles.receiptBadge}>
          <Text style={styles.receiptIcon}>
            ₹
          </Text>
        </View>
      </View>

      {/* ITEM TOTAL */}
      <View style={styles.row}>
        <Text style={styles.label}>
          Item Total
        </Text>

        <Text style={styles.value}>
          ₹{Number(subtotal || 0).toFixed(2)}
        </Text>
      </View>

      {/* DELIVERY FEE */}
      <View style={styles.row}>
        <Text style={styles.label}>
          Delivery Fee
        </Text>

        {Number(deliveryFee || 0) === 0 ? (
          <View style={styles.freeBadge}>
            <Text style={styles.freeText}>
              FREE
            </Text>
          </View>
        ) : (
          <Text style={styles.value}>
            ₹{Number(deliveryFee).toFixed(2)}
          </Text>
        )}
      </View>

      {/* DIVIDER */}
      <View style={styles.divider} />

      {/* GRAND TOTAL */}
      <View style={styles.totalRow}>
        <View>
          <Text style={styles.totalLabel}>
            Grand Total
          </Text>

          <Text style={styles.totalSubtext}>
            Item total + delivery fee
          </Text>
        </View>

        <Text style={styles.totalValue}>
          ₹{grandTotal.toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

export default BillSummary;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFCF8',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  subtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  receiptBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E8',
  },

  receiptIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FF7A00',
  },

  row: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  label: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },

  value: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '700',
  },

  freeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: '#ECFDF3',
  },

  freeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  totalSubtext: {
    marginTop: 3,
    fontSize: 10,
    color: '#9CA3AF',
  },

  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF7A00',
  },
});
