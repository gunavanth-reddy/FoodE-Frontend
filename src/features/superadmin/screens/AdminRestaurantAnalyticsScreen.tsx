import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ChartBar, CurrencyDollar, Info, Receipt, Storefront, TrendUp} from 'phosphor-react-native';
import {useRoute} from '@react-navigation/native';
import {useAuth} from '../../../context/AuthContext';
import {getSingleRestaurantAnalytics, SingleRestaurantAnalytics} from '../services/adminAnalyticsService';

const money = (value = 0) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const AdminRestaurantAnalyticsScreen = () => {
  const {token} = useAuth();
  const route = useRoute<any>();
  const restaurantId = route.params?.restaurantId as string;
  const [data, setData] = useState<SingleRestaurantAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token || !restaurantId) {setLoading(false); return;}
    try {setData(await getSingleRestaurantAnalytics(token, restaurantId));}
    catch (error) {console.log('Restaurant analytics error:', error);}
    finally {setLoading(false); setRefreshing(false);}
  }, [restaurantId, token]);

  useEffect(() => {load();}, [load]);
  const days = useMemo(() => Array.isArray(data?.days) ? data!.days! : [], [data]);

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#FF7A00" /><Text style={styles.loading}>Loading restaurant analytics...</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); load();}} tintColor="#FF7A00" />} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.logo}><Storefront size={25} color="#FF7A00" weight="duotone" /></View>
          <View style={styles.headerText}><Text style={styles.eyebrow}>RESTAURANT ANALYTICS</Text><Text style={styles.title} numberOfLines={2}>{data?.restaurant?.name || 'Restaurant'}</Text><Text style={styles.owner}>Owner: {data?.owner?.name || '—'}</Text></View>
        </View>

        <View style={styles.kpiGrid}>
          <Kpi icon={<Receipt size={19} color="#FF7A00" weight="duotone" />} label="Monthly orders" value={data?.monthly.orders || 0} />
          <Kpi icon={<CurrencyDollar size={19} color="#FF7A00" weight="duotone" />} label="Monthly sales" value={money(data?.monthly.sales)} />
          <Kpi icon={<TrendUp size={19} color="#FF7A00" weight="duotone" />} label="FoodE earnings" value={money(data?.monthly.foodEarnings)} />
          <Kpi icon={<ChartBar size={19} color="#FF7A00" weight="duotone" />} label="Commission / order" value={money(data?.commissionPerOrder)} />
        </View>

        <Section title="Weekly performance" />
        <View style={styles.card}>
          {(data?.weeks || []).map((week, index) => <View key={`${week.week}-${index}`} style={[styles.row, index > 0 && styles.borderTop]}><View style={styles.rowText}><Text style={styles.rowTitle}>Week {week.week}</Text><Text style={styles.muted}>{week.from} → {week.to}</Text></View><View style={styles.right}><Text style={styles.orange}>{week.orders} orders</Text><Text style={styles.muted}>{money(week.sales)}</Text></View></View>)}
          {(!data?.weeks || data.weeks.length === 0) && <Text style={styles.empty}>Weekly analytics are not available yet.</Text>}
        </View>

        {days.length > 0 && <><Section title="Daily performance" /><View style={styles.card}>{days.map((day, index) => <View key={`${day.date}-${index}`} style={[styles.row, index > 0 && styles.borderTop]}><View style={styles.rowText}><Text style={styles.rowTitle}>{day.date}</Text><Text style={styles.muted}>{day.orders || 0} orders</Text></View><View style={styles.right}><Text style={styles.orange}>{money(day.sales)}</Text><Text style={styles.muted}>sales</Text></View></View>)}</View></>}

        <View style={styles.note}><Info size={18} color="#FF7A00" weight="bold" /><Text style={styles.noteText}>Values shown here come directly from the current restaurant analytics endpoint. No frontend-calculated figures are substituted.</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Kpi = ({icon, label, value}: {icon: React.ReactNode; label: string; value: string | number}) => <View style={styles.kpi}><View style={styles.kpiIcon}>{icon}</View><Text style={styles.kpiLabel}>{label}</Text><Text style={styles.kpiValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text></View>;
const Section = ({title}: {title: string}) => <Text style={styles.section}>{title}</Text>;

const styles = StyleSheet.create({container:{flex:1,backgroundColor:'#F7F8FA'},center:{flex:1,backgroundColor:'#F7F8FA',alignItems:'center',justifyContent:'center'},loading:{marginTop:10,color:'#777C85',fontSize:12,fontWeight:'600'},content:{padding:18,paddingBottom:34},header:{flexDirection:'row',alignItems:'center',marginBottom:17},logo:{width:56,height:56,borderRadius:18,backgroundColor:'#FFF3E8',alignItems:'center',justifyContent:'center'},headerText:{flex:1,marginLeft:12},eyebrow:{fontSize:9,letterSpacing:1,fontWeight:'900',color:'#FF7A00'},title:{fontSize:24,fontWeight:'900',color:'#17171B',marginTop:2},owner:{fontSize:11,color:'#7B8089',marginTop:3},kpiGrid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between'},kpi:{width:'48.5%',backgroundColor:'#FFFFFF',borderRadius:19,padding:14,marginBottom:11,borderWidth:1,borderColor:'#F0F1F3',minHeight:118},kpiIcon:{width:38,height:38,borderRadius:12,backgroundColor:'#FFF3E8',alignItems:'center',justifyContent:'center'},kpiLabel:{fontSize:10,color:'#7B8089',fontWeight:'700',marginTop:10},kpiValue:{fontSize:17,color:'#17171B',fontWeight:'900',marginTop:4},section:{fontSize:18,fontWeight:'900',color:'#17171B',marginTop:9,marginBottom:10},card:{backgroundColor:'#FFFFFF',borderRadius:20,paddingHorizontal:14,borderWidth:1,borderColor:'#F0F1F3'},row:{minHeight:67,flexDirection:'row',alignItems:'center'},borderTop:{borderTopWidth:1,borderTopColor:'#F0F1F3'},rowText:{flex:1},rowTitle:{fontSize:13,fontWeight:'900',color:'#252831'},right:{alignItems:'flex-end'},orange:{fontSize:12,fontWeight:'900',color:'#FF7A00'},muted:{fontSize:9,color:'#8A8F98',marginTop:3},empty:{paddingVertical:24,textAlign:'center',color:'#8A8F98',fontSize:11},note:{marginTop:14,padding:14,borderRadius:16,backgroundColor:'#FFF7EF',flexDirection:'row',alignItems:'flex-start'},noteText:{flex:1,fontSize:10,lineHeight:16,color:'#7B5B3B',fontWeight:'600',marginLeft:8}});

export default AdminRestaurantAnalyticsScreen;
