import * as Sentry from '@sentry/react-native';
import { Linking } from 'react-native';

export const LinkingUtils = {
  async safeOpenURL(url: string) {
    try {
      await Linking.openURL(url);
    } catch (err) {
      Sentry.captureException(err, { tags: { type: 'non_critical' }, level: 'warning' });
    }
  },
} as const;
