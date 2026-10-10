import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {UsersThree, UserCircle, Storefront} from 'phosphor-react-native';
import {useAuth} from '../../../context/AuthContext';
import {getAdminDashboardStats, AdminDashboardStats} from '../services/adminService';

const AdminUsersScreen = () => {
  const {token} = useAuth();
  const [data, setData] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) {setLoading(false); return;}
    try {setData(await getAdminDashboardStats(token));}
    catch (error) {console.log('Admin users error:', error);}
    finally {setLoading(false); setRefreshing(false);}
  }, [token]);

  useEffect(() => {load();}, [load]);

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#FF7A00" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); load();}} tintColor="#FF7A00" />} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>FOODE ADMIN</Text>
        <Text style={styles.title}>Users</Text>
        <Text style={styles.subtitle}>Current account totals from the admin dashboard API.</Text>

        <View style={styles.primaryCard}>
          <View style={styles.icon}><UsersThree size={28} color="#FF7A00" weight="duotone" /></View>
          <Text style={styles.primaryLabel}>REGISTERED USERS</Text>
          <Text style={styles.primaryValue}>{data?.totalUsers || 0}</Text>
          <Text style={styles.primaryText}>Total user accounts currently registered with FoodE.</Text>
        </View>

        <View style={styles.card}>
          <Stat icon={<UserCircle size={20} color="#FF7A00" weight="duotone" />} label="Restaurant owners" value={data?.totalRestaurantOwners || 0} />
          <Stat icon={<Storefront size={20} color="#FF7A00" weight="duotone" />} label="Total restaurants" value={data?.totalRestaurants || 0} last />
        </View>

        <View style={styles.info}><Text style={styles.infoTitle}>Admin API scope</Text><Text style={styles.infoText}>The current backend exposes dashboard totals here. No separate user-list endpoint is being assumed, so this screen does not show fabricated user records.</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Stat = ({icon, label, value, last}: {icon: React.ReactNode; label: string; value: number; last?: boolean}) => <View style={[styles.row, !last && styles.rowBorder]}><View style={styles.smallIcon}>{icon}</View><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>;

const styles = StyleSheet.create({container:{flex:1,backgroundColor:'#F7F8FA'},center:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#F7F8FA'},content:{padding:18,paddingBottom:30},eyebrow:{fontSize:9,fontWeight:'900',letterSpacing:1,color:'#FF7A00'},title:{fontSize:29,fontWeight:'900',color:'#17171B',marginTop:3},subtitle:{fontSize:12,color:'#7B8089',lineHeight:18,marginBottom:16},primaryCard:{backgroundColor:'#17171B',borderRadius:24,padding:24,alignItems:'center'},icon:{width:58,height:58,borderRadius:18,backgroundColor:'#FFF3E8',alignItems:'center',justifyContent:'center'},primaryLabel:{fontSize:9,letterSpacing:1,fontWeight:'900',color:'#FFB67A',marginTop:15},primaryValue:{fontSize:48,fontWeight:'900',color:'#FFFFFF',marginTop:1},primaryText:{fontSize:11,color:'#B7BAC1',textAlign:'center',lineHeight:17,marginTop:2},card:{backgroundColor:'#FFFFFF',borderRadius:20,paddingHorizontal:15,marginTop:13,borderWidth:1,borderColor:'#F0F1F3'},row:{minHeight:66,flexDirection:'row',alignItems:'center'},rowBorder:{borderBottomWidth:1,borderBottomColor:'#F0F1F3'},smallIcon:{width:38,height:38,borderRadius:12,backgroundColor:'#FFF3E8',alignItems:'center',justifyContent:'center',marginRight:10},label:{flex:1,fontSize:13,fontWeight:'700',color:'#555B66'},value:{fontSize:18,fontWeight:'900',color:'#FF7A00'},info:{marginTop:13,padding:15,borderRadius:17,backgroundColor:'#FFF7EF'},infoTitle:{fontSize:12,fontWeight:'900',color:'#7B5B3B'},infoText:{fontSize:11,lineHeight:17,color:'#8A6A4B',marginTop:4}});

export default AdminUsersScreen;
