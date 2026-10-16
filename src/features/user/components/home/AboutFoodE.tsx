import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {ForkKnife} from 'phosphor-react-native';
import {APP_VERSION} from '../../../../config/version';

const AboutFoodE: React.FC = () => {
  return (
    <View style={styles.container}>

      {/* =============================================
          DIVIDER
      ============================================= */}

      <View style={styles.divider} />


      {/* =============================================
          LOGO
      ============================================= */}

      <View style={styles.brandRow}>
      <View style={styles.logoContainer}>
        <ForkKnife
          size={24}
          color="#FF7A00"
          weight="fill"
        />
      </View>


      {/* =============================================
          BRAND
      ============================================= */}

      <Text style={styles.title}>FoodE</Text>
      <Text style={styles.tagline}>Eat Fresh. Live Better.</Text>
      </View>
      <Text style={styles.version}>FoodE · v{APP_VERSION}</Text>

    </View>
  );
};

export default AboutFoodE;


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },

  divider: {
    width: '100%',

    height: 1,

    marginBottom: 8,

    backgroundColor: '#E5E7EB',
  },

  logoContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFF3E8',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },

  tagline: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF7A00',
  },
  version: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
  },
});
