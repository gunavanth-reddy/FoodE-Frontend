import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface SuccessButtonsProps {
  onBackHome: () => void;
}

const SuccessButtons: React.FC<SuccessButtonsProps> = ({
  onBackHome,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.homeButton}
        onPress={onBackHome}>

        <Text style={styles.homeText}>
          Back to Home
        </Text>

        <Text style={styles.arrow}>
          →
        </Text>

      </TouchableOpacity>

      <Text style={styles.helperText}>
        You can view your order anytime in My Orders
      </Text>
    </View>
  );
};

export default SuccessButtons;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 30,
    alignItems: 'center',
  },

  homeButton: {
    width: '100%',
    height: 58,

    backgroundColor: '#FF5A00',

    borderRadius: 16,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    shadowColor: '#FF5A00',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 8,
  },

  homeText: {
    color: '#FFFFFF',

    fontSize: 17,

    fontWeight: '800',

    letterSpacing: 0.2,
  },

  arrow: {
    color: '#FFFFFF',

    fontSize: 22,

    fontWeight: '600',

    marginLeft: 10,

    marginTop: -1,
  },

  helperText: {
    marginTop: 12,

    fontSize: 12,

    color: '#8A8A8A',

    textAlign: 'center',

    lineHeight: 18,
  },
});
