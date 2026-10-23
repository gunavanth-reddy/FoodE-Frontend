import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export type FavoriteTab = 'restaurants' | 'foods';

interface FavoriteTabsProps {
  activeTab: FavoriteTab;
  onTabChange: (tab: FavoriteTab) => void;
}

const FavoriteTabs: React.FC<FavoriteTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.tab,
          activeTab === 'foods' && styles.activeTab,
        ]}
        onPress={() => onTabChange('foods')}>
        <Text
          style={[
            styles.text,
            activeTab === 'foods' &&
              styles.activeText,
          ]}>
          Foods
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.tab,
          activeTab === 'restaurants' && styles.activeTab,
        ]}
        onPress={() => onTabChange('restaurants')}>
        <Text
          style={[
            styles.text,
            activeTab === 'restaurants' && styles.activeText,
          ]}>
          Restaurants
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default FavoriteTabs;

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
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },

  activeText: {
    color: '#FFF',
  },
});
