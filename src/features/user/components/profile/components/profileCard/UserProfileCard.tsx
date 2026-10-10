import React from 'react';

import {
  Text,
  View,
} from 'react-native';

import styles from './ProfileCard.styles';

import {
  Avatar,
  Badge,
} from '../common';

import {User} from '../../../../../../context/AuthContext';

interface UserProfileCardProps {
  user: User | null;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({user}) => {
  const displayName = user?.name?.trim() || 'FoodE User';
  const mobileNumber = user?.phone || 'No mobile number added';

  return (
    <View style={styles.container}>
      {/* Profile Identity */}
      <View style={styles.avatarContainer}>
        <Avatar size={90} />
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {displayName}
      </Text>

      <Text style={styles.email} numberOfLines={1}>
        {mobileNumber}
      </Text>

      {/* Membership Badge */}
      <View style={styles.badgeContainer}>
        <Badge title="FoodE Member" />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Profile Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.stat}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>


      </View>
    </View>
  );
};

export default UserProfileCard;
