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
  transformIgnorePatterns: [
    '/node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|convex-helpers|convex|convex\\/react/|@gorhom/bottom-sheet)',
    '/node_modules/react-native-reanimated/plugin/',
  ],
};
