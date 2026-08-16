const { withMainActivity } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to unlock highest supported display refresh rate (90Hz/120Hz/144Hz) on Android.
 */
const withHighRefreshRate = (config) => {
  return withMainActivity(config, async (config) => {
    let mainActivity = config.modResults.contents;

    // Check if high refresh rate code is already injected
    if (!mainActivity.includes('preferredDisplayModeId')) {
      const onCreateHook = `
    // Set highest supported refresh rate mode (90Hz/120Hz/144Hz)
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
      val display = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
        display
      } else {
        windowManager.defaultDisplay
      }
      val modes = display?.supportedModes
      val maxMode = modes?.maxByOrNull { it.refreshRate }
      if (maxMode != null) {
        val params = window.attributes
        params.preferredDisplayModeId = maxMode.modeId
        window.attributes = params
      }
    }
`;

      if (mainActivity.includes('super.onCreate(')) {
        mainActivity = mainActivity.replace(
          /super\.onCreate\(.*?\)/,
          (match) => `${match}${onCreateHook}`
        );
      }
    }

    config.modResults.contents = mainActivity;
    return config;
  });
};

module.exports = withHighRefreshRate;
