import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export type OrderTab = 'active' | 'history';

interface Props {
  activeTab: OrderTab;
  onTabChange: (tab: OrderTab) => void;
}

const OrderTabs: React.FC<Props> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'active' && styles.activeTab,
        ]}
        onPress={() => onTabChange('active')}>
        <Text
          style={[
            styles.text,
            activeTab === 'active' &&
              styles.activeText,
          ]}>
          Active
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'history' &&
            styles.activeTab,
        ]}
        onPress={() => onTabChange('history')}>
        <Text
          style={[
            styles.text,
            activeTab === 'history' &&
              styles.activeText,
          ]}>
          History
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OrderTabs;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 18,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  activeTab: {
    backgroundColor: '#FF7A00',
  },

  text: {
    color: '#666',
    fontWeight: '600',
    fontSize: 15,
  },

  activeText: {
    color: '#FFF',
  },
});
