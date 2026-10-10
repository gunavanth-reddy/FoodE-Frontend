import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  User,
  MapPin,
  Receipt,
  Heart,
  Bell,
  Globe,
  Question,
  ShieldCheck,
  FileText,
  Info,
  CaretRight,
} from 'phosphor-react-native';

import styles from './Menu.styles';

interface Props {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress: () => void;
}

const MenuItem: React.FC<Props> = ({
  title,
  subtitle,
  icon,
  color,
  onPress,
}) => {
  const getIcon = () => {
    switch (icon) {
      // Account
      case 'person-outline':
      case 'person':
        return (
          <User
            size={23}
            color={color}
            weight="regular"
          />
        );

      case 'location-on':
      case 'location-outline':
      case 'location':
        return (
          <MapPin
            size={23}
            color={color}
            weight="regular"
          />
        );

      case 'receipt-long':
      case 'receipt-outline':
      case 'receipt':
        return (
          <Receipt
            size={23}
            color={color}
            weight="regular"
          />
        );

      case 'favorite-border':
      case 'heart-outline':
      case 'heart':
        return (
          <Heart
            size={23}
            color={color}
            weight="regular"
          />
        );

      case 'notifications-none':
      case 'notifications-outline':
      case 'notifications':
        return (
          <Bell
            size={23}
            color={color}
            weight="regular"
          />
        );

      // Support
      case 'help-outline':
      case 'help-circle-outline':
      case 'help-circle':
        return (
          <Question
            size={23}
            color={color}
            weight="regular"
          />
        );

      // About
      case 'privacy-tip':
      case 'shield-checkmark-outline':
      case 'shield-checkmark':
        return (
          <ShieldCheck
            size={23}
            color={color}
            weight="regular"
          />
        );

      case 'description':
      case 'document-text-outline':
      case 'document-text':
        return (
          <FileText
            size={23}
            color={color}
            weight="regular"
          />
        );

      case 'language':
      case 'language-outline':
        return (
          <Globe
            size={23}
            color={color}
            weight="regular"
          />
        );

      case 'info-outline':
      case 'information-circle-outline':
      case 'information-circle':
        return (
          <Info
            size={23}
            color={color}
            weight="regular"
          />
        );

      default:
        return (
          <Info
            size={23}
            color={color}
            weight="regular"
          />
        );
    }
  };

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      activeOpacity={0.75}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}>

      {/* Left Content */}
      <View style={styles.leftContainer}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: `${color}15`,
            },
          ]}>
          {getIcon()}
        </View>

        <View style={styles.textContainer}>
          <Text
            style={styles.title}
            numberOfLines={1}>
            {title}
          </Text>

          <Text
            style={styles.subtitle}
            numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
      </View>

      {/* Navigation Arrow */}
      <View style={styles.arrowContainer}>
        <CaretRight
          size={18}
          color="#9CA3AF"
          weight="bold"
        />
      </View>
    </TouchableOpacity>
  );
};

export default MenuItem;