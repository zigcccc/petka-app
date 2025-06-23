/** @type {import("jest").Config} **/
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.ts', 'react-native-unistyles/mocks', './src/styles/unistyles.ts'],
};
