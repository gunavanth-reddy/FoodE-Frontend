import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {Bicycle} from 'phosphor-react-native';

interface Props {
  status: string;
  eta: string;
  onTrack?: () => void;
}

const ActiveOrderCard: React.FC<Props> = ({
  status,
  eta,
  onTrack,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Bicycle
          size={26}
          color="#FF7A00"
          weight="duotone"
        />

        <View style={styles.content}>
          <Text style={styles.status}>
            {status}
          </Text>

          <Text style={styles.eta}>
            Arriving in {eta}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={onTrack}>
        <Text style={styles.buttonText}>
          Track Order
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActiveOrderCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF7ED',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  content: {
    marginLeft: 14,
    flex: 1,
  },

  status: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },

  eta: {
    marginTop: 4,
    color: '#6B7280',
    fontSize: 14,
  },

  button: {
    marginTop: 16,
    backgroundColor: '#FF7A00',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
