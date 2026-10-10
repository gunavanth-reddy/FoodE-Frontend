import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface LoginRequiredModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  onLogin: () => void;
}

const LoginRequiredModal: React.FC<
  LoginRequiredModalProps
> = ({
  visible,
  title = '🍔 Join FoodE',
  message = 'Sign in to save your cart, place orders and enjoy a personalized food experience.',
  onClose,
  onLogin,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide">

      <View style={styles.overlay}>

        <View style={styles.container}>

          <Text style={styles.emoji}>
            🍔
          </Text>

          <Text style={styles.title}>
            {title}
          </Text>

          <Text style={styles.message}>
            {message}
          </Text>

          <View style={styles.benefits}>

            <Text style={styles.benefit}>
              ✅ Save your cart
            </Text>

            <Text style={styles.benefit}>
              ✅ Faster checkout
            </Text>

            <Text style={styles.benefit}>
              ✅ Live order tracking
            </Text>

            <Text style={styles.benefit}>
              ✅ Exclusive offers
            </Text>

          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={onLogin}>

            <Text style={styles.loginText}>
              Continue to Login
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}>

            <Text style={styles.closeText}>
              Not Now
            </Text>

          </TouchableOpacity>

        </View>

      </View>

    </Modal>
  );
};

export default LoginRequiredModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },

  emoji: {
    fontSize: 52,
    textAlign: 'center',
  },

  title: {
    marginTop: 12,
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },

  message: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#6B7280',
  },

  benefits: {
    marginTop: 28,
  },

  benefit: {
    fontSize: 16,
    marginBottom: 14,
    color: '#111827',
  },

  loginButton: {
    marginTop: 30,
    backgroundColor: '#FF7A00',
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loginText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  closeButton: {
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});
