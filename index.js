import {AppRegistry} from 'react-native';

import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';

import App from './App';
import appConfig from './app.json';

const appName = appConfig.expo.name;

// =====================================================
// FCM BACKGROUND MESSAGE HANDLER
// =====================================================

const messaging = getMessaging();

setBackgroundMessageHandler(
  messaging,
  async remoteMessage => {
    console.log(
      'FoodE: Background FCM notification received:',
      remoteMessage,
    );
  },
);

// =====================================================
// REGISTER APP
// =====================================================

AppRegistry.registerComponent(
  appName,
  () => App,
);