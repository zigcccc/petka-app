/** @type {import("jest").Config} **/
module.exports = {
  preset: 'jest-expo',
  transform: {
    '\\.[j|t]sx?$': [
      'babel-jest',
      { caller: { name: 'metro', bundler: 'metro', platform: 'ios', configFile: './babel.config.cjs' } },
    ],
  },
  setupFiles: ['./jest.setup.tsx', 'react-native-unistyles/mocks', './src/styles/unistyles.ts'],
  moduleNameMapper: {
    // Prevent expo-modules-core's JS logger from firing after test teardown.
    // expo/src/winter lazily installs a `fetch` global that requires ExpoModulesCoreJSLogger;
    // when the getter is evaluated post-teardown Jest can no longer buffer the console.warn.
    '^expo/src/winter(.*)$': '<rootDir>/src/tests/mocks/expoWinter.ts',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|@sentry/react-native|native-base|react-native-svg|lucide-react-native|convex-helpers|@convex-dev|convex|convex\\/react/|@gorhom/bottom-sheet|standard-navigation)',
    '/node_modules/react-native-reanimated/plugin/',
  ],
};
