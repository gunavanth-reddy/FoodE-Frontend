import React from 'react';
import {View} from 'react-native';

import {SectionHeader} from '../sections';
import QuickActionCard from './QuickActionCard';
import styles from './QuickAction.styles';

import {QUICK_ACTIONS} from '../../constants';

interface QuickActionGridProps {
  isLoggedIn: boolean;
  navigation: any;
}

const QuickActionGrid: React.FC<QuickActionGridProps> = ({
  isLoggedIn,
  navigation,
}) => {
  const handleQuickAction = (title: string) => {
    // Guests must log in first
    if (!isLoggedIn) {
      navigation.navigate('Login');
      return;
    }

    // Logged-in user navigation
    switch (title.toLowerCase()) {
      case 'orders':
        navigation.navigate('Orders');
        break;

      case 'favorites':
        navigation.navigate('Favorites');
        break;

      case 'address':
      case 'wallet':
        // Coming Soon handling will be added next
        break;

      default:
        break;
    }
  };

  return (
    <View>
      <SectionHeader title="Quick Actions" />

      <View style={styles.grid}>
        {QUICK_ACTIONS.map(item => (
          <QuickActionCard
            key={item.id}
            title={item.title}
            icon={item.icon}
            color={item.color}
            onPress={() => handleQuickAction(item.title)}
          />
        ))}
      </View>
    </View>
  );
};

export default QuickActionGrid;
