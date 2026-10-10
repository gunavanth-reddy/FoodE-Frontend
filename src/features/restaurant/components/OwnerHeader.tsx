import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Storefront} from 'phosphor-react-native';

interface OwnerHeaderProps {
  restaurantName?: string;
  isOpen?: boolean;
}

const OwnerHeader: React.FC<OwnerHeaderProps> = ({
  restaurantName = 'Your Restaurant',
  isOpen = false,
}) => (
  <View style={styles.container}>
    <View style={styles.leftSection}>
      <View style={styles.icon}><Storefront size={21} color="#FF7A00" weight="duotone" /></View>
      <View style={styles.textWrap}>
        <Text style={styles.greeting}>RESTAURANT DASHBOARD</Text>
        <Text style={styles.restaurantName} numberOfLines={1}>{restaurantName}</Text>
      </View>
    </View>
    <View style={[styles.status, isOpen ? styles.open : styles.closed]}>
      <View style={[styles.dot, isOpen ? styles.openDot : styles.closedDot]} />
      <Text style={[styles.statusText, isOpen ? styles.openText : styles.closedText]}>{isOpen ? 'Open' : 'Closed'}</Text>
    </View>
  </View>
);

export default OwnerHeader;

const styles = StyleSheet.create({
  container: {width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22},
  leftSection: {flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', marginRight: 12},
  icon: {width: 46, height: 46, borderRadius: 15, backgroundColor: '#FFF2E6', alignItems: 'center', justifyContent: 'center', marginRight: 10},
  textWrap: {flex: 1, minWidth: 0},
  greeting: {fontSize: 9, fontWeight: '900', letterSpacing: 0.8, color: '#9A9DA4', marginBottom: 3},
  restaurantName: {fontSize: 20, lineHeight: 25, fontWeight: '900', color: '#17171B'},
  status: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 11, paddingVertical: 8, borderRadius: 13},
  open: {backgroundColor: '#ECFDF3'},
  closed: {backgroundColor: '#F4F4F5'},
  dot: {width: 7, height: 7, borderRadius: 4, marginRight: 6},
  openDot: {backgroundColor: '#16A34A'},
  closedDot: {backgroundColor: '#9CA3AF'},
  statusText: {fontSize: 11, fontWeight: '900'},
  openText: {color: '#15803D'},
  closedText: {color: '#6B7280'},
});
