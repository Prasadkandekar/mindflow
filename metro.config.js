const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Stub native-only LiveKit packages on web — these use native WebRTC bindings.
// NOTE: `livekit-client` and `@livekit/components-react` are NOT stubbed —
// they use browser-native WebRTC and power the web voice companion.
const NATIVE_ONLY_PACKAGES = [
  '@livekit/react-native',
  '@livekit/react-native-webrtc',
  '@livekit/react-native-expo-plugin',
  '@config-plugins/react-native-webrtc',
];

const originalResolveRequest = config.resolver?.resolveRequest;
config.resolver = config.resolver ?? {};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === 'web' &&
    NATIVE_ONLY_PACKAGES.some((pkg) => moduleName === pkg || moduleName.startsWith(pkg + '/'))
  ) {
    // Return an empty stub module for web
    return {
      type: 'empty',
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
