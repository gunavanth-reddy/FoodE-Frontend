import React from 'react';

import {
  View,
  Text,
} from 'react-native';

import styles from './Footer.styles';

import {LogoutButton} from '../buttons';
import {APP_VERSION} from '../../../../../../config/version';

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

      <Text style={styles.copyright}>
        FoodE · v{APP_VERSION} · Made with love
      </Text>
    </View>
  );
};

export default Footer;
