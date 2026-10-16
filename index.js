import {Platform} from 'react-native';
import {registerRootComponent} from 'expo';
import App from './App';

registerRootComponent(App);

if (Platform.OS !== 'web') {
  const {
    getMessaging,
    setBackgroundMessageHandler,
  } = require('@react-native-firebase/messaging');

  setBackgroundMessageHandler(
    getMessaging(),
    async remoteMessage => {
      console.log(
        'FoodE: Background FCM notification received:',
        remoteMessage,
      );
    },
  );
}