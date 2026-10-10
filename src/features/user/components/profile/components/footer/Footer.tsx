import React from 'react';

import {
  View,
  Text,
} from 'react-native';

import styles from './Footer.styles';

import {LogoutButton} from '../buttons';

interface Props {
  isLoggedIn: boolean;
  onLogout: () => void;
}

const Footer: React.FC<Props> = ({
  isLoggedIn,
  onLogout,
}) => {
  return (
    <View style={styles.container}>
      {/* Logout */}
      {isLoggedIn && (
        <View style={styles.logoutContainer}>
          <LogoutButton onPress={onLogout} />
        </View>
      )}

      {/* App Version */}
      <Text style={styles.version}>
        FoodE  •  Version 1.0.0
      </Text>

      {/* Brand Footer */}
      <Text style={styles.copyright}>
        Made with ❤️ for FoodE
      </Text>
    </View>
  );
};

export default Footer;
