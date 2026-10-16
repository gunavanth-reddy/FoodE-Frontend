import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

const ORANGE = '#FF5A00';

const ProfileHeader = () => {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <View style={styles.accent} />

          <Text style={styles.title}>
            My Profile
          </Text>
        </View>

        <Text style={styles.subtitle}>
          Manage your account and preferences
        </Text>
      </View>
    </View>
  );
};

export default ProfileHeader;

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },

  textContainer: {
    gap: 5,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  accent: {
    width: 4,
    height: 25,
    borderRadius: 4,
    backgroundColor: ORANGE,
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#171B24',
    letterSpacing: -0.8,
  },

  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#858B95',
    lineHeight: 19,
    marginLeft: 13,
  },
});