import React from 'react';

import {View} from 'react-native';

import {useNavigation} from '@react-navigation/native';

import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {RootStackParamList} from '../../../../../../navigation/AppNavigator';

import MenuItem from './MenuItem';

import styles from './Menu.styles';

import {SectionHeader} from '../sections';

import {Divider} from '../common';

import {MenuItem as MenuItemType} from '../../types';

type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

interface Props {
  title: string;
  data: MenuItemType[];
}

const MenuSection: React.FC<Props> = ({
  title,
  data,
}) => {
  const navigation = useNavigation<NavigationProp>();

  const handleNavigation = (route?: string) => {
    switch (route) {
      case 'PersonalInfo':
        navigation.navigate('PersonalInfo');
        break;

      case 'Address':
        navigation.navigate('Address');
        break;

      case 'Orders':
        navigation.navigate('Orders');
        break;

      case 'Favorites':
        navigation.navigate('Favorites');
        break;

      case 'Payment':
        navigation.navigate('Payment');
        break;

      case 'NotificationSettings':
        navigation.navigate('NotificationSettings');
        break;

      case 'HelpCenter':
        navigation.navigate('HelpCenter');
        break;

      case 'PrivacyPolicy':
        navigation.navigate('PrivacyPolicy');
        break;

      case 'Terms':
        navigation.navigate('Terms');
        break;

      case 'Language':
        navigation.navigate('Language');
        break;

      case 'About':
        navigation.navigate('About');
        break;

      default:
        console.warn(
          'Route not implemented:',
          route,
        );
        break;
    }
  };

  return (
    <View>
      {/* Section Header */}
      <SectionHeader title={title} />

      {/* Menu Card */}
      <View style={styles.container}>
        {data.map((item, index) => (
          <React.Fragment key={item.id}>
            <MenuItem
              title={item.title ?? ''}
              subtitle={item.subtitle ?? ''}
              icon={item.icon ?? 'help-outline'}
              color={item.color ?? '#FF7A00'}
              onPress={() =>
                handleNavigation(item.route)
              }
            />

            {/* Divider */}
            {index < data.length - 1 && (
              <Divider />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

export default MenuSection;
