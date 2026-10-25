import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  Globe,
  Check,
  Info,
} from 'phosphor-react-native';
import AppBackButton from '../../../components/buttons/AppBackButton';

const ORANGE = '#FF7A00';

const LanguageScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {width} = useWindowDimensions();

  const horizontalPadding = width < 360 ? 18 : 24;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#FF7A00" barStyle="light-content" hidden={false} translucent={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop: 16,
          },
        ]}>

        {/* Back Button */}
        {navigation.canGoBack() && (
          <AppBackButton style={{marginBottom: 16}} />
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Globe
              size={28}
              color={ORANGE}
              weight="regular"
            />
          </View>

          <Text style={styles.title}>Choose Language</Text>

          <Text style={styles.subtitle}>
            Select your preferred language for a better FoodE
            experience.
          </Text>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            AVAILABLE LANGUAGE
          </Text>

          <View style={styles.languageCount}>
            <Text style={styles.languageCountText}>1</Text>
          </View>
        </View>

        {/* English Language */}
        <TouchableOpacity
          activeOpacity={1}
          accessibilityRole="radio"
          accessibilityState={{selected: true}}
          style={styles.languageCard}>

          <View style={styles.languageBadge}>
            <Text style={styles.languageInitial}>EN</Text>
          </View>

          <View style={styles.languageInfo}>
            <Text style={styles.languageName}>English</Text>

            <Text style={styles.languageDescription}>
              Continue in English
            </Text>
          </View>

          <View style={styles.radioSelected}>
            <Check
              size={15}
              color="#FFFFFF"
              weight="bold"
            />
          </View>
        </TouchableOpacity>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Info
            size={20}
            color={ORANGE}
            weight="regular"
          />

          <Text style={styles.infoText}>
            English is currently the only supported language
            in FoodE Version 1.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default LanguageScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFCF8',
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 28,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    alignSelf: 'flex-start',
  },

  header: {
    alignItems: 'center',
    marginBottom: 32,
  },

  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#FFF2E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#1C1C1E',
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#858585',
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 310,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888888',
    letterSpacing: 1,
  },

  languageCount: {
    marginLeft: 8,
    backgroundColor: '#FFF2E6',
    borderRadius: 10,
    minWidth: 23,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },

  languageCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: ORANGE,
  },

  languageCard: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFAF5',
    borderWidth: 1,
    borderColor: ORANGE,
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },

  languageBadge: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FFE7D1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  languageInitial: {
    fontSize: 13,
    fontWeight: '800',
    color: ORANGE,
  },

  languageInfo: {
    flex: 1,
    paddingRight: 8,
  },

  languageName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#242424',
  },

  languageDescription: {
    fontSize: 12,
    color: '#929292',
    marginTop: 5,
    lineHeight: 17,
  },

  radioSelected: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: ORANGE,
    borderWidth: 1.5,
    borderColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8F1',
    borderRadius: 14,
    padding: 14,
    marginTop: 24,
    gap: 10,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    color: '#777777',
  },
});