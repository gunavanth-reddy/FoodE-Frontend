import React from 'react';
import {
  View,
  Text,
} from 'react-native';

import styles from './ProfileHeader.styles';

const ProfileHeader = () => {
  return (
    <View style={styles.container}>
      {/* Header Text */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          My Profile
        </Text>

        <Text style={styles.subtitle}>
          Manage your account and preferences
        </Text>
      </View>
    </View>
  );
};

export default ProfileHeader;