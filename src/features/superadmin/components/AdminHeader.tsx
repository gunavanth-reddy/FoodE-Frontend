import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {ShieldCheck} from 'phosphor-react-native';

interface AdminHeaderProps {
  adminName?: string;
}

const AdminHeader = ({adminName = 'Admin'}: AdminHeaderProps) => {
  const initial = adminName.trim().charAt(0).toUpperCase() || 'A';

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.nameWrap}>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.name} numberOfLines={1}>{adminName}</Text>
        </View>
      </View>

      <View style={styles.badge}>
        <ShieldCheck size={16} color="#FF7A00" weight="fill" />
        <Text style={styles.badgeText}>ADMIN</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22},
  left: {flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12},
  avatar: {width: 48, height: 48, borderRadius: 16, backgroundColor: '#FF7A00', alignItems: 'center', justifyContent: 'center', marginRight: 12},
  avatarText: {fontSize: 19, fontWeight: '900', color: '#FFFFFF'},
  nameWrap: {flex: 1},
  greeting: {fontSize: 12, color: '#8A8F98', marginBottom: 2},
  name: {fontSize: 19, fontWeight: '900', color: '#17171B'},
  badge: {height: 34, paddingHorizontal: 10, borderRadius: 12, backgroundColor: '#FFF3E8', flexDirection: 'row', alignItems: 'center'},
  badgeText: {fontSize: 9, fontWeight: '900', color: '#FF7A00', marginLeft: 5},
});

export default AdminHeader;
