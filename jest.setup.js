const {jest} = require('@jest/globals');

jest.mock(
  '@react-native-async-storage/async-storage',
  () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@react-native-firebase/messaging', () => ({
  AuthorizationStatus: {
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  },
  EventType: {
    PRESS: 1,
  },
  getInitialNotification: jest.fn().mockResolvedValue(null),
  getMessaging: jest.fn(() => ({})),
  getToken: jest.fn().mockResolvedValue('test-token'),
  onMessage: jest.fn(() => jest.fn()),
  onNotificationOpenedApp: jest.fn(() => jest.fn()),
  onTokenRefresh: jest.fn(() => jest.fn()),
  requestPermission: jest.fn().mockResolvedValue(1),
  setBackgroundMessageHandler: jest.fn(),
}));

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  AndroidImportance: {
    HIGH: 4,
  },
  AndroidStyle: {
    BIGTEXT: 'bigtext',
  },
  EventType: {
    PRESS: 1,
  },
  default: {
    createChannel: jest.fn(),
    displayNotification: jest.fn(),
    getInitialNotification: jest.fn().mockResolvedValue(null),
    onForegroundEvent: jest.fn(() => jest.fn()),
  },
}));
