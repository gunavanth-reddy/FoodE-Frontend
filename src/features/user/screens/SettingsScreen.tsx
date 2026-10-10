import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StyleSheet,
  Text,
} from 'react-native';

const SettingsScreen = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.title}>⚙️ Settings</Text>
      <Text style={styles.subtitle}>
        Settings screen coming soon.
      </Text>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF8',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF7A00',
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
