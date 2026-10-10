import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {CaretRight, Storefront} from 'phosphor-react-native';
import {useAuth} from '../../../context/AuthContext';
import {getRestaurantAnalytics, RestaurantAnalytics} from '../services/adminAnalyticsService';

const money = (n = 0) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const AdminRestaurantsScreen = ({navigation}: any) => {
  const {token} = useAuth();
  const [items, setItems] = useState<RestaurantAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) {setLoading(false); return;}
    try {setItems(await getRestaurantAnalytics(token));}
    catch (error) {console.log('Admin restaurants error:', error);}
    finally {setLoading(false); setRefreshing(false);}
  }, [token]);

  useEffect(() => {load();}, [load]);
  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#FF7A00" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); load();}} tintColor="#FF7A00" />} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>FOODE ADMIN</Text>
        <Text style={styles.title}>Restaurants</Text>
        <Text style={styles.subtitle}>Monthly and weekly performance from the admin analytics API.</Text>

        {items.map(item => (
          <TouchableOpacity key={item.restaurant.id} activeOpacity={0.82} style={styles.card} onPress={() => navigation.navigate('AdminRestaurantAnalytics', {restaurantId: item.restaurant.id})}>
            <View style={styles.topRow}>
              <View style={styles.icon}><Storefront size={22} color="#FF7A00" weight="duotone" /></View>
              <View style={styles.nameWrap}><Text style={styles.name} numberOfLines={1}>{item.restaurant.name}</Text><Text style={styles.owner} numberOfLines={1}>{item.owner.name || 'Restaurant owner'}</Text></View>
              <CaretRight size={18} color="#A0A4AC" weight="bold" />
            </View>
            <View style={styles.metrics}>
              <Metric label="Week orders" value={item.thisWeek.orders} />
              <Metric label="Week sales" value={money(item.thisWeek.sales)} />
              <Metric label="Month orders" value={item.thisMonth.orders} />
            </View>
          </TouchableOpacity>
        ))}

        {items.length === 0 && <View style={styles.empty}><Storefront size={30} color="#FF7A00" weight="duotone" /><Text style={styles.emptyTitle}>No restaurant analytics</Text><Text style={styles.emptyText}>The backend returned no restaurant analytics records.</Text></View>}
      </ScrollView>
    </SafeAreaView>
  );
};

const Metric = ({label, value}: {label: string; value: string | number}) => <View style={styles.metric}><Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;

const styles = StyleSheet.create({container:{flex:1,backgroundColor:'#F7F8FA'},center:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#F7F8FA'},content:{padding:18,paddingBottom:30},eyebrow:{fontSize:9,fontWeight:'900',letterSpacing:1,color:'#FF7A00'},title:{fontSize:29,fontWeight:'900',color:'#17171B',marginTop:3},subtitle:{fontSize:12,color:'#7B8089',lineHeight:18,marginBottom:16},card:{backgroundColor:'#FFFFFF',borderRadius:20,padding:14,marginBottom:11,borderWidth:1,borderColor:'#F0F1F3'},topRow:{flexDirection:'row',alignItems:'center'},icon:{width:44,height:44,borderRadius:14,backgroundColor:'#FFF3E8',alignItems:'center',justifyContent:'center'},nameWrap:{flex:1,marginHorizontal:10},name:{fontSize:14,fontWeight:'900',color:'#252831'},owner:{fontSize:10,color:'#8A8F98',marginTop:3},metrics:{flexDirection:'row',marginTop:13,paddingTop:12,borderTopWidth:1,borderTopColor:'#F0F1F3'},metric:{flex:1},metricValue:{fontSize:12,fontWeight:'900',color:'#FF7A00'},metricLabel:{fontSize:9,color:'#8A8F98',marginTop:3},empty:{backgroundColor:'#FFFFFF',borderRadius:20,padding:28,alignItems:'center',borderWidth:1,borderColor:'#F0F1F3'},emptyTitle:{fontSize:16,fontWeight:'900',color:'#17171B',marginTop:10},emptyText:{fontSize:11,color:'#8A8F98',textAlign:'center',lineHeight:17,marginTop:4}});

export default AdminRestaurantsScreen;
