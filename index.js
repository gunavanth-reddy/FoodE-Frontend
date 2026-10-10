import {AppRegistry} from 'react-native';

import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';

import App from './App';
import {name as appName} from './app.json';

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