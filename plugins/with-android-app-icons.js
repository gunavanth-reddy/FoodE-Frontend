const fs = require('fs');
const path = require('path');
const {withDangerousMod} = require('expo/config-plugins');

const ANDROID_ICON_DIRECTORY = path.join('plugins', 'app-icons', 'android');

module.exports = function withAndroidAppIcons(config) {
  return withDangerousMod(config, [
    'android',
    async modConfig => {
      const sourceRoot = path.join(
        modConfig.modRequest.projectRoot,
        ANDROID_ICON_DIRECTORY,
      );
      const resourceRoot = path.join(
        modConfig.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
      );

      const densityDirectories = fs
        .readdirSync(sourceRoot, {withFileTypes: true})
        .filter(entry => entry.isDirectory() && entry.name.startsWith('mipmap-'));

      if (densityDirectories.length === 0) {
        throw new Error(`No Android mipmap folders found in ${sourceRoot}`);
      }

      for (const directory of densityDirectories) {
        const iconName = 'ic_launcher.png';
        const source = path.join(sourceRoot, directory.name, iconName);
        if (!fs.existsSync(source)) {
          throw new Error(`Missing supplied launcher icon: ${source}`);
        }

        const destinationDirectory = path.join(resourceRoot, directory.name);
        fs.mkdirSync(destinationDirectory, {recursive: true});

        // Avoid duplicate Android resources when Expo has generated a WebP icon
        // with the same resource name in this density folder.
        const generatedWebp = path.join(destinationDirectory, 'ic_launcher.webp');
        if (fs.existsSync(generatedWebp)) {
          fs.unlinkSync(generatedWebp);
        }

        fs.copyFileSync(source, path.join(destinationDirectory, iconName));
      }

      return modConfig;
    },
  ]);
};
