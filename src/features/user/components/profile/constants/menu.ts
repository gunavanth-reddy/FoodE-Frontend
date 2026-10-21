import {MenuItem} from '../types';
import {APP_VERSION} from '../../../../../config/version';

export const ACCOUNT_MENU: MenuItem[] = [
  {
    id: '1',
    title: 'Personal Information',
    subtitle: 'Manage your profile',
    icon: 'person-outline',
    color: '#FF5200',
    route: 'PersonalInfo',
  },
  {
    id: '2',
    title: 'Saved Addresses',
    subtitle: 'Home, Work & Others',
    icon: 'location-on',
    color: '#FF5200',
    route: 'Address',
  },
  {
    id: '3',
    title: 'My Orders',
    subtitle: 'Track current & past orders',
    icon: 'receipt-long',
    color: '#FF5200',
    route: 'Orders',
  },
  {
    id: '4',
    title: 'Favorites',
    subtitle: 'Saved restaurants & foods',
    icon: 'favorite-border',
    color: '#E11D48',
    route: 'Favorites',
  },
  {
    id: '5',
    title: 'Notifications',
    subtitle: 'Manage notification preferences',
    icon: 'notifications-none',
    color: '#FF5200',
    route: 'NotificationSettings',
  },
];

export const SUPPORT_MENU: MenuItem[] = [
  {
    id: '1',
    title: 'Help Center',
    subtitle: 'FAQs & Customer Support',
    icon: 'help-outline',
    color: '#FF5200',
    route: 'HelpCenter',
  },
];

export const ABOUT_MENU: MenuItem[] = [
  {
    id: '1',
    title: 'Privacy Policy',
    subtitle: 'Read our privacy policy',
    icon: 'privacy-tip',
    color: '#756A61',
    route: 'PrivacyPolicy',
  },
  {
    id: '2',
    title: 'Terms & Conditions',
    subtitle: 'Read our terms and conditions',
    icon: 'description',
    color: '#756A61',
    route: 'Terms',
  },
  {
    id: '3',
    title: 'Language',
    subtitle: 'English',
    icon: 'language',
    color: '#756A61',
    route: 'Language',
  },
  {
    id: '4',
    title: 'About FoodE',
    subtitle: `Version ${APP_VERSION}`,
    icon: 'info-outline',
    color: '#FF5200',
    route: 'About',
  },
];
