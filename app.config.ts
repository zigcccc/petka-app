import { type ExpoConfig } from 'expo/config';

import appPackage from './package.json';

const isProd = process.env.APP_ENV === 'production';
const name = isProd ? 'Petka' : 'Petka (DEV)';
const identifier = isProd ? 'com.expo.app.petkaapp' : 'com.expo.app.dev.petkaapp';
const iconPath = isProd ? './src/assets/images/petka-app-icon.png' : './src/assets/images/petka-app-icon-dev.png';

const config: ExpoConfig = {
  name,
  slug: 'petka-app',
  version: appPackage.version,
  orientation: 'portrait',
  icon: iconPath,
  scheme: 'petkaapp',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: identifier,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: isProd ? './src/assets/images/petka-app-icon-android-adaptive.png' : iconPath,
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    package: identifier,
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: iconPath,
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './src/assets/images/petka-app-icon-splash.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
    'expo-asset',
    'expo-web-browser',
    [
      '@sentry/react-native/expo',
      {
        url: 'https://sentry.io/',
        project: 'petka-mobile-app',
        organization: 'ziga-krasovec-team',
      },
    ],
    'expo-font',
    'expo-localization',
    'expo-notifications',
    [
      'expo-tracking-transparency',
      {
        userTrackingPermission: 'Allow this app to collect app-related data that can be used for tracking app events.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: '7471426e-9273-43e1-b6cc-490fac00af54',
    },
  },
  owner: 'expo.app',
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: 'https://u.expo.dev/7471426e-9273-43e1-b6cc-490fac00af54',
  },
};

export default config;
