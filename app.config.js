const fs = require('node:fs');
const path = require('node:path');

module.exports = ({config}) => {
  const iosFirebaseConfig = path.join(
    __dirname,
    'GoogleService-Info.plist',
  );

  return {
    ...config,
    android: {
      ...config.android,
      googleServicesFile: './google-services.json',
    },
    ios: {
      ...config.ios,
      ...(fs.existsSync(iosFirebaseConfig)
        ? {googleServicesFile: './GoogleService-Info.plist'}
        : {}),
    },
  };
};