const {
  withMainActivity,
  withProjectBuildGradle,
} = require('expo/config-plugins');

const IMMERSIVE_IMPORTS = [
  'import android.os.Build',
  'import android.view.View',
  'import android.view.WindowInsets',
  'import android.view.WindowInsetsController',
];

const IMMERSIVE_METHODS = `

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    if (hasFocus) {
      hideSystemBars()
    }
  }

  private fun hideSystemBars() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      window.insetsController?.let { controller ->
        controller.hide(WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars())
        controller.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
      }
    } else {
      @Suppress("DEPRECATION")
      window.decorView.systemUiVisibility = (
        View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
        or View.SYSTEM_UI_FLAG_FULLSCREEN
      )
    }
  }
`;

module.exports = initialConfig => {
  const config = withProjectBuildGradle(initialConfig, buildGradleConfig => {
    if (
      !buildGradleConfig.modResults.contents.includes(
        'node_modules/@notifee/react-native/android/libs',
      )
    ) {
      const allProjectsRepositories = /allprojects\s*\{\s*repositories\s*\{/;
      if (!allProjectsRepositories.test(buildGradleConfig.modResults.contents)) {
        throw new Error('Unable to find the root Android repositories block.');
      }

      buildGradleConfig.modResults.contents =
        buildGradleConfig.modResults.contents.replace(
        allProjectsRepositories,
        match =>
          `${match}\n    maven { url "$rootDir/../node_modules/@notifee/react-native/android/libs" }`,
        );
    }

    return buildGradleConfig;
  });

  return withMainActivity(config, mainActivityConfig => {
    const mainActivity = mainActivityConfig.modResults;
    if (mainActivity.language !== 'kt') {
      throw new Error(
        'FoodE immersive mode config requires the generated Kotlin MainActivity.',
      );
    }

    let {contents} = mainActivity;
    if (!contents.includes('private fun hideSystemBars()')) {
      const packageLine = contents.match(/^package [^\n]+\n/m);
      if (!packageLine) {
        throw new Error('Unable to find the package line in MainActivity.');
      }

      const imports = IMMERSIVE_IMPORTS.filter(
        importLine => !contents.includes(importLine),
      ).join('\n');
      contents = contents.replace(
        packageLine[0],
        `${packageLine[0]}${imports}\n`,
      );

      const onCreateCall = 'super.onCreate(null)';
      if (!contents.includes(onCreateCall)) {
        throw new Error('Unable to find Expo MainActivity onCreate call.');
      }
      contents = contents.replace(
        onCreateCall,
        `${onCreateCall}\n    hideSystemBars()`,
      );

      const classEnd = contents.lastIndexOf('}');
      if (classEnd === -1) {
        throw new Error('Unable to find the end of MainActivity.');
      }
      contents =
        contents.slice(0, classEnd) +
        IMMERSIVE_METHODS +
        contents.slice(classEnd);
      mainActivity.contents = contents;
    }

    return mainActivityConfig;
  });
};
