const fs = require('node:fs/promises');
const path = require('node:path');
const {withAndroidManifest, withDangerousMod} = require('expo/config-plugins');

const densities = [
  'mipmap-mdpi',
  'mipmap-hdpi',
  'mipmap-xhdpi',
  'mipmap-xxhdpi',
  'mipmap-xxxhdpi',
];

module.exports = config => {
  config = withAndroidManifest(config, modConfig => {
    const application = modConfig.modResults.manifest.application?.[0];
    if (!application) {
      throw new Error('Unable to find the Android application manifest entry.');
    }

    application.$['android:icon'] = '@mipmap/ic_launcher';
    application.$['android:roundIcon'] = '@mipmap/ic_launcher_round';
    return modConfig;
  });

  return withDangerousMod(config, [
    'android',
    async modConfig => {
      const resDirectory = path.join(
        modConfig.modRequest.platformProjectRoot,
        'app/src/main/res',
      );
      const roundAssetDirectory = path.join(__dirname, 'android-round-icons');

      for (const density of densities) {
        const sourceDirectory = path.join(roundAssetDirectory, density);
        const destinationDirectory = path.join(resDirectory, density);
        await fs.mkdir(destinationDirectory, {recursive: true});
        await fs.copyFile(
          path.join(sourceDirectory, 'ic_launcher_round.webp'),
          path.join(destinationDirectory, 'ic_launcher_round.webp'),
        );
        await fs.copyFile(
          path.join(sourceDirectory, 'ic_launcher_round_foreground.webp'),
          path.join(destinationDirectory, 'ic_launcher_round_foreground.webp'),
        );
      }

      const adaptiveIconDirectory = path.join(resDirectory, 'mipmap-anydpi-v26');
      await fs.mkdir(adaptiveIconDirectory, {recursive: true});
      await fs.copyFile(
        path.join(roundAssetDirectory, 'ic_launcher_round.xml'),
        path.join(adaptiveIconDirectory, 'ic_launcher_round.xml'),
      );

      return modConfig;
    },
  ]);
};
