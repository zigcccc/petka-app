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
    '/node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|@sentry/react-native|native-base|react-native-svg|lucide-react-native|convex-helpers|@convex-dev|convex|convex\\/react/|@gorhom/bottom-sheet|standard-navigation)',
    '/node_modules/react-native-reanimated/plugin/',
  ],
};
