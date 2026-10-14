import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StyleSheet, Text, View} from 'react-native';
import ScreenHeader from '../../../components/common/ScreenHeader';

const SettingsScreen = () => (
  <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
    <ScreenHeader title="Settings" subtitle="Make FoodE yours" />
    <View style={styles.content}>
      <View style={styles.iconCircle}><Text style={styles.emoji}>⚙️</Text></View>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Your preferences and app controls will live here.</Text>
    </View>
  </SafeAreaView>
);
export default SettingsScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FFFCF8'},
  content: {flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28},
  iconCircle: {width: 88, height: 88, borderRadius: 30, backgroundColor: '#FFF0E4', alignItems: 'center', justifyContent: 'center', marginBottom: 18},
  emoji: {fontSize: 38},
  title: {fontSize: 25, fontWeight: '900', color: '#171B24', marginBottom: 8},
  subtitle: {fontSize: 14, lineHeight: 21, color: '#777E89', textAlign: 'center', maxWidth: 280},
});
