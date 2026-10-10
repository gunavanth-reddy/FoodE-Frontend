import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Clock, CurrencyDollar, Receipt, Storefront, UserCircle, UsersThree} from 'phosphor-react-native';

interface AdminStatCardProps {
  icon: 'users' | 'owner' | 'restaurant' | 'pending' | 'orders' | 'revenue';
  title: string;
  value: string | number;
  subtitle?: string;
}

const AdminStatCard = ({icon, title, value, subtitle}: AdminStatCardProps) => {
  const renderIcon = () => {
    switch (icon) {
      case 'users': return <UsersThree size={21} color="#FF7A00" weight="duotone" />;
      case 'owner': return <UserCircle size={21} color="#FF7A00" weight="duotone" />;
      case 'restaurant': return <Storefront size={21} color="#FF7A00" weight="duotone" />;
      case 'pending': return <Clock size={21} color="#FF7A00" weight="duotone" />;
      case 'orders': return <Receipt size={21} color="#FF7A00" weight="duotone" />;
      case 'revenue': return <CurrencyDollar size={21} color="#FF7A00" weight="duotone" />;
      default: return null;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>{renderIcon()}</View>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      {!!subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {width: '48.5%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#F0F1F3'},
  iconContainer: {width: 42, height: 42, borderRadius: 13, backgroundColor: '#FFF3E8', alignItems: 'center', justifyContent: 'center', marginBottom: 12},
  title: {fontSize: 12, fontWeight: '700', color: '#777C85'},
  value: {fontSize: 23, lineHeight: 28, fontWeight: '900', color: '#17171B', marginTop: 3},
  subtitle: {fontSize: 10, fontWeight: '600', color: '#9A9EA6', marginTop: 4},
});

export default AdminStatCard;
