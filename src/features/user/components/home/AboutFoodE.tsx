import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {ForkKnife} from 'phosphor-react-native';

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

      <Text style={styles.title}>
        FoodE
      </Text>

      <Text style={styles.tagline}>
        Eat Fresh. Live Better.
      </Text>


      {/* =============================================
          DESCRIPTION
      ============================================= */}

      <Text style={styles.description}>
        From local favorites to popular restaurants,
        {'\n'}
        FoodE brings great food to your doorstep.
      </Text>


      {/* =============================================
          VERSION
      ============================================= */}

      <Text style={styles.version}>
        Version 1.0.0
      </Text>


      {/* =============================================
          DEVELOPER
      ============================================= */}

      <Text style={styles.developer}>
        Developed by UG
      </Text>


      {/* =============================================
          COPYRIGHT
      ============================================= */}

      <Text style={styles.copyright}>
        © 2026 FoodE. All Rights Reserved.
      </Text>

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

    paddingHorizontal: 24,

    paddingTop: 20,
    paddingBottom: 16,

    backgroundColor: '#F7F8FA',
  },

  divider: {
    width: '100%',

    height: 1,

    marginBottom: 16,

    backgroundColor: '#E5E7EB',
  },

  logoContainer: {
    width: 48,
    height: 48,

    borderRadius: 36,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 8,

    backgroundColor: '#FFF3E8',
  },

  title: {
    fontSize: 22,

    fontWeight: '800',

    letterSpacing: 0.3,

    color: '#111827',
  },

  tagline: {
    marginTop: 4,

    fontSize: 13,

    fontWeight: '600',

    color: '#FF7A00',
  },

  description: {
    marginTop: 10,

    fontSize: 12,

    lineHeight: 18,

    textAlign: 'center',

    color: '#6B7280',
  },

  version: {
    marginTop: 14,

    fontSize: 13,

    fontWeight: '600',

    color: '#9CA3AF',
  },

  developer: {
    marginTop: 5,

    fontSize: 13,

    fontWeight: '700',

    color: '#111827',
  },

  copyright: {
    marginTop: 10,

    fontSize: 12,

    lineHeight: 18,

    textAlign: 'center',

    color: '#9CA3AF',
  },
});