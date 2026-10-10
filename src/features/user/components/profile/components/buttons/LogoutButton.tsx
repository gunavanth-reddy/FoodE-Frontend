import React from 'react';

import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Alert,
} from 'react-native';

import {
  SignOut,
  CaretRight,
} from 'phosphor-react-native';

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../../styles';

interface Props {
  onPress: () => void;
}

const LogoutButton: React.FC<Props> = ({onPress}) => {
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from FoodE?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress,
        },
      ],
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={styles.button}
      onPress={handleLogout}
      accessibilityRole="button"
      accessibilityLabel="Logout">

      <View style={styles.content}>
        <SignOut
          size={20}
          color={COLORS.error}
          weight="regular"
        />

        <Text style={styles.text}>
          Logout
        </Text>
      </View>

      <CaretRight
        size={22}
        color={COLORS.error}
        weight="bold"
      />
    </TouchableOpacity>
  );
};

export default LogoutButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: '#FFF5F5',

    borderWidth: 1,
    borderColor: '#FEE2E2',

    borderRadius: 16,

    paddingHorizontal: SPACING.lg,
    paddingVertical: 16,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  text: {
    color: COLORS.error,

    marginLeft: SPACING.md,

    ...TYPOGRAPHY.button,
  },
});