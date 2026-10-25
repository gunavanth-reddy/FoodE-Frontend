import {SafeAreaView} from 'react-native-safe-area-context';
import React, {useState} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {CheckCircle} from 'phosphor-react-native';
import AppBackButton from '../../../components/buttons/AppBackButton';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {RootStackParamList} from '../../../navigation/AppNavigator';
import {useCart} from '../../../context/CartContext';

type PaymentScreenNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    'Payment'
  >;

const DELIVERY_FEE = 40;
const GST_PERCENTAGE = 0.05;

const PaymentScreen: React.FC = () => {
  const navigation =
    useNavigation<PaymentScreenNavigationProp>();

  const {totalAmount} = useCart();

  const [paymentMethod, setPaymentMethod] =
    useState('Cash on Delivery');

  const gst = Math.round(
    totalAmount * GST_PERCENTAGE,
  );

  const grandTotal =
    totalAmount + DELIVERY_FEE + gst;

  const methods = [
    'Cash on Delivery',
    'UPI',
    'Credit / Debit Card',
    'Net Banking',
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#FF7A00" barStyle="light-content" hidden={false} translucent={false} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16}}>
          {navigation.canGoBack() && (
            <AppBackButton />
          )}
          <Text style={styles.heading}>
            Payment
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>
            Select Payment Method
          </Text>

          {methods.map(method => (
            <TouchableOpacity
              key={method}
              style={styles.option}
              activeOpacity={0.8}
              onPress={() =>
                setPaymentMethod(method)
              }>
              <View style={[styles.radio, paymentMethod === method && styles.radioActive]}>
                {paymentMethod === method && (
                  <CheckCircle size={21} color="#FF7A00" weight="fill" />
                )}
              </View>

              <Text style={styles.optionText}>
                {method}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>
            Bill Details
          </Text>

          <View style={styles.row}>
            <Text>Item Total</Text>
            <Text>₹{totalAmount}</Text>
          </View>

          <View style={styles.row}>
            <Text>Delivery Fee</Text>
            <Text>₹{DELIVERY_FEE}</Text>
          </View>

          <View style={styles.row}>
            <Text>GST (5%)</Text>
            <Text>₹{gst}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.total}>
              Grand Total
            </Text>

            <Text style={styles.total}>
              ₹{grandTotal}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.payButton}
          onPress={() =>
            (navigation as any).navigate(
              'OrderSuccess',
            )
          }>
          <Text style={styles.payText}>
            Pay ₹{grandTotal}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  content: {
    padding: 20,
    paddingBottom: 120,
  },

  heading: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#FFFCF8',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    elevation: 3,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 18,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioActive: {
    borderColor: '#FF7A00',
  },

  optionText: {
    fontSize: 16,
    color: '#111827',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },

  total: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  bottom: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
  },

  payButton: {
    height: 58,
    backgroundColor: '#FF7A00',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },

  payText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
