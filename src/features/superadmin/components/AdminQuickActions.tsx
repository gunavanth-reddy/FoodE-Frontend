import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {BellRinging, CaretRight, Receipt, Star, Storefront, UsersThree} from 'phosphor-react-native';

interface AdminQuickActionsProps {
  onUsersPress: () => void;
  onRestaurantsPress: () => void;
  onOrdersPress: () => void;
  onReviewsPress: () => void;
  onBroadcastPress: () => void;
}

const AdminQuickActions = ({onUsersPress, onRestaurantsPress, onOrdersPress, onReviewsPress, onBroadcastPress}: AdminQuickActionsProps) => {
  const actions = [
    {label: 'Users', icon: <UsersThree size={21} color="#FF7A00" weight="duotone" />, onPress: onUsersPress},
    {label: 'Restaurants', icon: <Storefront size={21} color="#FF7A00" weight="duotone" />, onPress: onRestaurantsPress},
    {label: 'Orders', icon: <Receipt size={21} color="#FF7A00" weight="duotone" />, onPress: onOrdersPress},
    {label: 'Reviews', icon: <Star size={21} color="#FF7A00" weight="duotone" />, onPress: onReviewsPress},
    {label: 'Broadcast', icon: <BellRinging size={21} color="#FF7A00" weight="duotone" />, onPress: onBroadcastPress},
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick actions</Text>
      <View style={styles.grid}>
        {actions.map(action => (
          <TouchableOpacity key={action.label} activeOpacity={0.82} style={styles.action} onPress={action.onPress}>
            <View style={styles.icon}>{action.icon}</View>
            <Text style={styles.label}>{action.label}</Text>
            <CaretRight size={17} color="#A5A8AE" weight="bold" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {marginTop: 4},
  title: {fontSize: 18, fontWeight: '900', color: '#17171B', marginBottom: 12},
  grid: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'},
  action: {width: '48.5%', minHeight: 68, backgroundColor: '#FFFFFF', borderRadius: 18, marginBottom: 11, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F0F1F3'},
  icon: {width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF3E8', alignItems: 'center', justifyContent: 'center', marginRight: 9},
  label: {flex: 1, fontSize: 13, fontWeight: '800', color: '#30333A'},
});

export default AdminQuickActions;
