import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {CheckCircle, Clock, CurrencyDollar, Receipt, TrendUp, XCircle} from 'phosphor-react-native';
import {useAuth} from '../../../context/AuthContext';
import {getAdminOrderStats, AdminOrderStats} from '../services/adminService';
import {getAdminOverview, getRestaurantAnalytics, AdminOverview, RestaurantAnalytics} from '../services/adminAnalyticsService';

const money = (n = 0) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const AdminOrdersScreen = () => {
  const {token} = useAuth();
  const [stats, setStats] = useState<AdminOrderStats | null>(null);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) {setLoading(false); return;}
    try {
      const results = await Promise.allSettled([getAdminOrderStats(token), getAdminOverview(token), getRestaurantAnalytics(token)]);
      if (results[0].status === 'fulfilled') setStats(results[0].value);
      if (results[1].status === 'fulfilled') setOverview(results[1].value);
      if (results[2].status === 'fulfilled') setRestaurants(results[2].value);
    } catch (error) {console.log('Admin orders error:', error);}
    finally {setLoading(false); setRefreshing(false);}
  }, [token]);

  useEffect(() => {load();}, [load]);

  const ranked = useMemo(() => [...restaurants].sort((a, b) => b.thisMonth.orders - a.thisMonth.orders).slice(0, 10), [restaurants]);
  const revenueRanked = useMemo(() => [...restaurants].sort((a, b) => b.thisMonth.sales - a.thisMonth.sales).slice(0, 10), [restaurants]);

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#FF7A00" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); load();}} tintColor="#FF7A00" />} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>ORDER INTELLIGENCE</Text>
        <Text style={styles.title}>Orders</Text>
        <Text style={styles.subtitle}>Order volume, status and revenue from the current admin APIs.</Text>

        <View style={styles.grid}>
          <Kpi icon={<Receipt size={19} color="#FF7A00" weight="duotone" />} label="All orders" value={stats?.orders.total || 0} />
          <Kpi icon={<Clock size={19} color="#FF7A00" weight="duotone" />} label="Active" value={stats?.orders.active || 0} />
          <Kpi icon={<CheckCircle size={19} color="#FF7A00" weight="duotone" />} label="Delivered" value={stats?.orders.delivered || 0} />
          <Kpi icon={<XCircle size={19} color="#FF7A00" weight="duotone" />} label="Cancelled" value={stats?.orders.cancelled || 0} />
        </View>

        <View style={styles.revenueCard}>
          <View style={styles.revenueIcon}><CurrencyDollar size={21} color="#FFFFFF" weight="bold" /></View>
          <View style={{flex: 1}}><Text style={styles.revenueLabel}>TOTAL REVENUE</Text><Text style={styles.revenueValue}>{money(stats?.revenue.total)}</Text></View>
          <View style={styles.today}><Text style={styles.todayValue}>{money(stats?.revenue.today)}</Text><Text style={styles.todayLabel}>today</Text></View>
        </View>

        <Section title="Performance by period" />
        <View style={styles.periodCard}>
          <Period title="All time" orders={overview?.overview.allTime.orders} sales={overview?.overview.allTime.sales} />
          <Period title="This week" orders={overview?.overview.thisWeek.orders} sales={overview?.overview.thisWeek.sales} />
          <Period title="This month" orders={overview?.overview.thisMonth.orders} sales={overview?.overview.thisMonth.sales} />
        </View>

        <Section title="Top restaurants by monthly orders" />
        <Ranking items={ranked} rightMode="sales" />

        <Section title="Top restaurants by monthly revenue" />
        <Ranking items={revenueRanked} rightMode="orders" />
      </ScrollView>
    </SafeAreaView>
  );
};

const Kpi = ({icon, label, value}: {icon: React.ReactNode; label: string; value: number}) => <View style={styles.kpi}><View style={styles.kpiIcon}>{icon}</View><Text style={styles.kpiValue}>{value}</Text><Text style={styles.kpiLabel}>{label}</Text></View>;
const Section = ({title}: {title: string}) => <Text style={styles.section}>{title}</Text>;
const Period = ({title, orders, sales}: {title: string; orders?: number; sales?: number}) => <View style={styles.period}><Text style={styles.periodTitle}>{title}</Text><Text style={styles.periodOrders}>{orders || 0}</Text><Text style={styles.muted}>orders</Text><Text style={styles.periodSales}>{money(sales)}</Text><Text style={styles.muted}>sales</Text></View>;
const Ranking = ({items, rightMode}: {items: RestaurantAnalytics[]; rightMode: 'orders' | 'sales'}) => <View style={styles.rankCard}>{items.length ? items.map((item, index) => <View key={item.restaurant.id} style={[styles.rankRow, index > 0 && styles.borderTop]}><View style={styles.rank}><Text style={styles.rankText}>{index + 1}</Text></View><View style={styles.rankName}><Text style={styles.name} numberOfLines={1}>{item.restaurant.name}</Text><Text style={styles.muted}>{item.thisMonth.orders} orders</Text></View><View style={styles.rankRight}>{rightMode === 'sales' ? <Text style={styles.orange}>{money(item.thisMonth.sales)}</Text> : <Text style={styles.orange}>{item.thisMonth.orders}</Text>}<Text style={styles.muted}>{rightMode === 'sales' ? 'sales' : 'orders'}</Text></View></View>) : <Text style={styles.empty}>No restaurant data available.</Text>}</View>;

const styles = StyleSheet.create({container:{flex:1,backgroundColor:'#F7F8FA'},center:{flex:1,backgroundColor:'#F7F8FA',alignItems:'center',justifyContent:'center'},content:{padding:18,paddingBottom:30},eyebrow:{fontSize:9,fontWeight:'900',letterSpacing:1,color:'#FF7A00'},title:{fontSize:29,fontWeight:'900',color:'#17171B',marginTop:3},subtitle:{fontSize:12,color:'#7B8089',lineHeight:18,marginBottom:16},grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between'},kpi:{width:'48.5%',backgroundColor:'#FFFFFF',borderRadius:18,padding:14,marginBottom:10,borderWidth:1,borderColor:'#F0F1F3'},kpiIcon:{width:38,height:38,borderRadius:12,backgroundColor:'#FFF3E8',alignItems:'center',justifyContent:'center'},kpiValue:{fontSize:24,fontWeight:'900',color:'#17171B',marginTop:10},kpiLabel:{fontSize:10,color:'#8A8F98',fontWeight:'700',marginTop:2},revenueCard:{backgroundColor:'#17171B',borderRadius:21,padding:16,flexDirection:'row',alignItems:'center',marginBottom:3},revenueIcon:{width:42,height:42,borderRadius:13,backgroundColor:'#FF7A00',alignItems:'center',justifyContent:'center',marginRight:11},revenueLabel:{fontSize:9,letterSpacing:1,fontWeight:'900',color:'#FFB67A'},revenueValue:{fontSize:21,fontWeight:'900',color:'#FFFFFF',marginTop:2},today:{alignItems:'flex-end'},todayValue:{fontSize:13,fontWeight:'900',color:'#FFFFFF'},todayLabel:{fontSize:9,color:'#AEB1B8',marginTop:2},section:{fontSize:18,fontWeight:'900',color:'#17171B',marginTop:19,marginBottom:10},periodCard:{backgroundColor:'#FFFFFF',borderRadius:19,paddingHorizontal:14,borderWidth:1,borderColor:'#F0F1F3'},period:{paddingVertical:14,borderBottomWidth:1,borderBottomColor:'#F0F1F3'},periodTitle:{fontSize:12,fontWeight:'900',color:'#555B66'},periodOrders:{fontSize:23,fontWeight:'900',color:'#17171B',marginTop:3},periodSales:{fontSize:12,fontWeight:'900',color:'#FF7A00',marginTop:4},muted:{fontSize:9,color:'#8A8F98',marginTop:2},rankCard:{backgroundColor:'#FFFFFF',borderRadius:19,paddingHorizontal:14,borderWidth:1,borderColor:'#F0F1F3'},rankRow:{minHeight:64,flexDirection:'row',alignItems:'center'},borderTop:{borderTopWidth:1,borderTopColor:'#F0F1F3'},rank:{width:30,height:30,borderRadius:10,backgroundColor:'#FFF3E8',alignItems:'center',justifyContent:'center',marginRight:10},rankText:{fontSize:11,fontWeight:'900',color:'#FF7A00'},rankName:{flex:1},name:{fontSize:12,fontWeight:'900',color:'#252831'},rankRight:{alignItems:'flex-end',marginLeft:8},orange:{fontSize:11,fontWeight:'900',color:'#FF7A00'},empty:{paddingVertical:24,textAlign:'center',color:'#8A8F98',fontSize:11}});

export default AdminOrdersScreen;
