import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {Bell} from 'phosphor-react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const NotificationButton: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Notifications"
      activeOpacity={0.8}
      style={styles.container}
      onPress={() => navigation.navigate('Notifications')}
    >
      <Bell size={21} color="#28313D" weight="regular" />
    </TouchableOpacity>
  );
};

export default NotificationButton;

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF4EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE6D4',
  },
});
