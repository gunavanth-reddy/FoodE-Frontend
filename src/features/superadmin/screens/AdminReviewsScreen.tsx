import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Info, Star} from 'phosphor-react-native';

const AdminReviewsScreen = () => (
  <SafeAreaView style={styles.container}>
    <View style={styles.content}>
      <View style={styles.icon}><Star size={28} color="#FF7A00" weight="duotone" /></View>
      <Text style={styles.eyebrow}>FOODE ADMIN</Text>
      <Text style={styles.title}>Reviews</Text>
      <Text style={styles.text}>The current SuperAdmin backend routes provided for this module do not include a review-list or review-moderation endpoint.</Text>
      <View style={styles.info}><Info size={18} color="#FF7A00" weight="bold" /><Text style={styles.infoText}>The Review model exists in FoodE, but this screen does not invent review data or call an endpoint that is not part of the current admin API.</Text></View>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({container:{flex:1,backgroundColor:'#F7F8FA',alignItems:'center',justifyContent:'center',padding:20},content:{width:'100%',backgroundColor:'#FFFFFF',borderRadius:24,padding:24,alignItems:'center',borderWidth:1,borderColor:'#F0F1F3'},icon:{width:60,height:60,borderRadius:19,backgroundColor:'#FFF3E8',alignItems:'center',justifyContent:'center'},eyebrow:{fontSize:9,letterSpacing:1,fontWeight:'900',color:'#FF7A00',marginTop:15},title:{fontSize:25,fontWeight:'900',color:'#17171B',marginTop:3},text:{fontSize:12,lineHeight:19,color:'#7B8089',textAlign:'center',marginTop:8},info:{width:'100%',padding:13,borderRadius:15,backgroundColor:'#FFF7EF',flexDirection:'row',alignItems:'flex-start',marginTop:17},infoText:{flex:1,fontSize:10,lineHeight:16,color:'#7B5B3B',marginLeft:8}});

export default AdminReviewsScreen;
