import React from 'react';

import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import {
  SignIn,
  ArrowRight,
} from 'phosphor-react-native';

import styles from './ProfileCard.styles';

import {Avatar} from '../common';

interface Props {
  onLoginPress: () => void;
}

const GuestProfileCard: React.FC<Props> = ({
  onLoginPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Guest Avatar */}
      <View style={styles.avatarContainer}>
        <Avatar size={64} />
      </View>

      {/* Welcome Message */}
      <Text style={styles.name}>
        Welcome to FoodE
      </Text>

      {/* Description */}
      <Text style={styles.email}>
        Your next favourite meal is just a tap away.
        {'\n'}
        Sign in to track orders, save favourites and manage your account.
      </Text>

      {/* Premium Login Button */}
      <TouchableOpacity
        style={buttonStyles.loginButton}
        onPress={onLoginPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Continue to login">

        <View style={buttonStyles.buttonContent}>
          <SignIn
            size={21}
            color="#FFFFFF"
            weight="bold"
          />

          <Text style={buttonStyles.buttonText}>
            Continue to Login
          </Text>
        </View>

        <ArrowRight
          size={21}
          color="#FFFFFF"
          weight="bold"
        />
      </TouchableOpacity>
    </View>
  );
};

export default GuestProfileCard;

const buttonStyles = StyleSheet.create({
  loginButton: {
    width: '100%',
    minHeight: 54,
    backgroundColor: '#FF6B00',
    borderRadius: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,

    elevation: 3,
    shadowColor: '#FF6B00',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.22,
    shadowRadius: 6,
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});