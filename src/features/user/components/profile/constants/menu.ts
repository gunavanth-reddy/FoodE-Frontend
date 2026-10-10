import {MenuItem} from '../types';

export const ACCOUNT_MENU: MenuItem[] = [
  {
    id: '1',
    title: 'Personal Information',
    subtitle: 'Manage your profile',
    icon: 'person-outline',
    color: '#FF6B00',
    route: 'PersonalInfo',
  },
  {
    id: '2',
    title: 'Saved Addresses',
    subtitle: 'Home, Work & Others',
    icon: 'location-on',
    color: '#22C55E',
    route: 'Address',
  },
  {
    id: '3',
    title: 'My Orders',
    subtitle: 'Track current & past orders',
    icon: 'receipt-long',
    color: '#3B82F6',
    route: 'Orders',
  },
  {
    id: '4',
    title: 'Favorites',
    subtitle: 'Saved restaurants & foods',
    icon: 'favorite-border',
    color: '#EF4444',
    route: 'Favorites',
  },
  {
    id: '5',
    title: 'Notifications',
    subtitle: 'Manage notification preferences',
    icon: 'notifications-none',
    color: '#06B6D4',
    route: 'NotificationSettings',
  },
];

export const SUPPORT_MENU: MenuItem[] = [
  {
    id: '1',
    title: 'Help Center',
    subtitle: 'FAQs & Customer Support',
    icon: 'help-outline',
    color: '#8B5CF6',
    route: 'HelpCenter',
  },
];

export const ABOUT_MENU: MenuItem[] = [
  {
    id: '1',
    title: 'Privacy Policy',
    subtitle: 'Read our privacy policy',
    icon: 'privacy-tip',
    color: '#10B981',
    route: 'PrivacyPolicy',
  },
  {
    id: '2',
    title: 'Terms & Conditions',
    subtitle: 'Read our terms and conditions',
    icon: 'description',
    color: '#F59E0B',
    route: 'Terms',
  },
  {
    id: '3',
    title: 'Language',
    subtitle: 'English',
    icon: 'language',
    color: '#3B82F6',
    route: 'Language',
  },
  {
    id: '4',
    title: 'About FoodE',
    subtitle: 'Version 1.0.0',
    icon: 'info-outline',
    color: '#6366F1',
    route: 'About',
  },
];
