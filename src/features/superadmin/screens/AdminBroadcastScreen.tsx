import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AppTextInput from "../../../components/inputs/AppTextInput";
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {ArrowLeft, BellRinging, CheckCircle, PaperPlaneTilt, UsersThree} from 'phosphor-react-native';
import {useAuth} from '../../../context/AuthContext';
import {sendCustomerBroadcast} from '../services/adminNotificationService';

const DEFAULT_TITLE = 'FoodE Special Announcement';
const DEFAULT_MESSAGE = 'We have an exciting update for you! Open FoodE to learn more.';

const AdminBroadcastScreen = () => {
  const navigation = useNavigation<any>();
  const {token} = useAuth();
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState<number | null>(null);

  const send = () => {
    const cleanTitle = title.trim();
    const cleanMessage = message.trim();
    if (!cleanTitle || !cleanMessage) {
      Alert.alert('Missing details', 'Enter both a notification title and message.');
      return;
    }
    if (!token) {
      Alert.alert('Session expired', 'Please log in to your admin account again.');
      return;
    }
    Alert.alert(
      'Send to all customers?',
      `This will broadcast "${cleanTitle}" to customer accounts with registered push tokens.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Send announcement', onPress: async () => {
          try {
            setSending(true);
            setSentCount(null);
            const result = await sendCustomerBroadcast(token, {title: cleanTitle, message: cleanMessage});
            setSentCount(result.sent ?? null);
            Alert.alert(
              'Broadcast completed',
              `Notification saved for ${result.saved ?? 'eligible'} customers. Push notifications sent: ${result.sent ?? 'reported by server'}.` +
                (result.failed ? ` Failed sends: ${result.failed}.` : ''),
            );
          } catch (error: any) {
            Alert.alert('Broadcast failed', error?.message || 'Unable to send the announcement.');
          } finally {
            setSending(false);
          }
        }},
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar hidden={true} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {navigation.canGoBack() && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                backgroundColor: '#FFFFFF',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#E8ECF4',
              }}
              activeOpacity={0.7}>
              <ArrowLeft size={22} color="#1E232C" weight="bold" />
            </TouchableOpacity>
          )}
          <Text style={styles.eyebrow}>FOODE ADMIN</Text>
          <Text style={styles.heading}>Broadcast notification</Text>
          <Text style={styles.subheading}>Send an announcement directly to customer devices.</Text>

          <View style={styles.audienceCard}>
            <View style={styles.audienceIcon}><UsersThree size={23} color="#FF7A00" weight="duotone" /></View>
            <View style={styles.audienceText}>
              <Text style={styles.audienceTitle}>Customers</Text>
              <Text style={styles.audienceSubtitle}>All customer accounts · one broadcast</Text>
            </View>
            <View style={styles.selected}><CheckCircle size={19} color="#16834A" weight="fill" /></View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>NOTIFICATION TITLE</Text>
            <AppTextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter a title"
              maxLength={100}
              editable={!sending}
              style={styles.input}
              returnKeyType="next"
            />
            <Text style={styles.counter}>{title.length}/100</Text>

            <Text style={[styles.label, styles.messageLabel]}>MESSAGE</Text>
            <AppTextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Write your announcement..."
              maxLength={500}
              editable={!sending}
              multiline
              textAlignVertical="top"
              style={styles.messageInput}
            />
            <Text style={styles.counter}>{message.length}/500</Text>
          </View>

          <Text style={styles.previewLabel}>LIVE PREVIEW</Text>
          <View style={styles.preview}>
            <View style={styles.previewTop}>
              <View style={styles.previewIcon}><BellRinging size={18} color="#FF7A00" weight="fill" /></View>
              <View style={styles.previewBrand}><Text style={styles.brand}>FoodE</Text><Text style={styles.when}>Just now</Text></View>
            </View>
            <Text style={styles.previewTitle}>{title.trim() || 'Notification title'}</Text>
            <Text style={styles.previewMessage}>{message.trim() || 'Your announcement will appear here.'}</Text>
          </View>

          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Before you send</Text>
            <Text style={styles.noticeText}>The server must verify your admin role, save a notification record for each customer, and send FCM to customers with valid device tokens. Customers without tokens can still see saved notifications in the app if your notification history screen reads these records.</Text>
          </View>

          <TouchableOpacity disabled={sending} activeOpacity={0.85} style={[styles.sendButton, sending && styles.disabled]} onPress={send}>
            {sending ? <ActivityIndicator color="#FFFFFF" /> : <><PaperPlaneTilt size={20} color="#FFFFFF" weight="fill" /><Text style={styles.sendText}>Send to all customers</Text></>}
          </TouchableOpacity>
          {sentCount !== null && <Text style={styles.result}>Last broadcast: {sentCount} push notifications accepted by the server.</Text>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F7F8FA'}, flex:{flex:1}, content:{padding:18,paddingBottom:36},
  eyebrow:{fontSize:9,fontWeight:'900',letterSpacing:1,color:'#FF7A00'}, heading:{fontSize:27,fontWeight:'900',color:'#17171B',marginTop:4},
  subheading:{fontSize:12,lineHeight:18,color:'#7B8089',marginTop:5,marginBottom:18},
  audienceCard:{backgroundColor:'#FFF3E8',borderColor:'#FFD7B5',borderWidth:1,borderRadius:18,padding:14,flexDirection:'row',alignItems:'center',marginBottom:14},
  audienceIcon:{width:44,height:44,borderRadius:14,backgroundColor:'#FFFFFF',alignItems:'center',justifyContent:'center'},
  audienceText:{flex:1,marginLeft:11}, audienceTitle:{fontSize:14,fontWeight:'900',color:'#252831'}, audienceSubtitle:{fontSize:10,color:'#8A6A4B',marginTop:3},
  selected:{marginLeft:8}, formCard:{backgroundColor:'#FFFFFF',borderRadius:20,padding:16,borderWidth:1,borderColor:'#F0F1F3'},
  label:{fontSize:9,fontWeight:'900',letterSpacing:.7,color:'#777C85',marginBottom:8}, input:{minHeight:48,borderWidth:1,borderColor:'#E6E7EB',borderRadius:13,paddingHorizontal:13,fontSize:14,color:'#252831',backgroundColor:'#FCFCFD'},
  counter:{fontSize:9,color:'#A0A4AC',textAlign:'right',marginTop:5}, messageLabel:{marginTop:16}, messageInput:{minHeight:112,borderWidth:1,borderColor:'#E6E7EB',borderRadius:13,padding:13,fontSize:13,lineHeight:19,color:'#252831',backgroundColor:'#FCFCFD'},
  previewLabel:{fontSize:10,fontWeight:'900',letterSpacing:.8,color:'#777C85',marginTop:20,marginBottom:9}, preview:{backgroundColor:'#FFFFFF',borderRadius:18,padding:15,borderWidth:1,borderColor:'#F0F1F3'},
  previewTop:{flexDirection:'row',alignItems:'center'},previewIcon:{width:36,height:36,borderRadius:12,backgroundColor:'#FFF3E8',alignItems:'center',justifyContent:'center'},
  previewBrand:{marginLeft:9},brand:{fontSize:12,fontWeight:'900',color:'#252831'},when:{fontSize:9,color:'#A0A4AC',marginTop:2},
  previewTitle:{fontSize:14,fontWeight:'900',color:'#202329',marginTop:12},previewMessage:{fontSize:12,lineHeight:18,color:'#626873',marginTop:4},
  notice:{backgroundColor:'#FFF7EF',borderRadius:15,padding:13,marginTop:14},noticeTitle:{fontSize:11,fontWeight:'900',color:'#8A4B13'},noticeText:{fontSize:10,lineHeight:16,color:'#8A6A4B',marginTop:4},
  sendButton:{height:54,borderRadius:16,backgroundColor:'#FF7A00',alignItems:'center',justifyContent:'center',flexDirection:'row',marginTop:17},disabled:{opacity:.65},sendText:{fontSize:13,fontWeight:'900',color:'#FFFFFF',marginLeft:9},result:{fontSize:11,color:'#16834A',textAlign:'center',marginTop:10},
});
export default AdminBroadcastScreen;
