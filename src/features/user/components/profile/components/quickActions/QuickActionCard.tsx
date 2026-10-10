import React from 'react';

import {
  TouchableOpacity,
  View,
  Text,
} from 'react-native';

import {
  Receipt,
  Heart,
  MapPin,
  Wallet,
  SquaresFour,
} from 'phosphor-react-native';

import styles from './QuickAction.styles';

interface Props {
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

const getQuickActionIcon = (icon: string) => {
  switch (icon) {
    case 'receipt-long':
      return Receipt;

    case 'favorite-outline':
      return Heart;

    case 'location-on':
      return MapPin;

    case 'account-balance-wallet':
      return Wallet;

    default:
      return SquaresFour;
  }
};

const QuickActionCard: React.FC<Props> = ({
  title,
  icon,
  color,
  onPress,
}) => {
  const IconComponent = getQuickActionIcon(icon);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}>

      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: `${color}18`,
          },
        ]}>

        <IconComponent
          size={28}
          color={color}
          weight="regular"
        />
      </View>

      <Text
        style={styles.title}
        numberOfLines={1}>
        {title}
      </Text>

      <Text style={styles.subtitle}>
        Explore
      </Text>

    </TouchableOpacity>
  );
};

export default QuickActionCard;