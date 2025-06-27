const { getSentryExpoConfig } = require('@sentry/react-native/metro');

// eslint-disable-next-line no-undef
const config = getSentryExpoConfig(__dirname);

module.exports = config;
