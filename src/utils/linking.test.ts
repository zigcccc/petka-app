import { captureException } from '@sentry/react-native';
import { Linking } from 'react-native';

import { LinkingUtils } from './linking';

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

describe('LinkingUtils', () => {
  const testURL = 'https://www.testme.com';
  const openURLSpy = jest.spyOn(Linking, 'openURL');
  const captureExceptionSpy = captureException as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('safeOpenURL', () => {
    it('should trigger Linking.openURL and not record any Sentry errors when URL is correctly open', async () => {
      openURLSpy.mockResolvedValue(null);

      await LinkingUtils.safeOpenURL(testURL);

      expect(captureExceptionSpy).not.toHaveBeenCalled();
    });

    it('should trigger Linking.openURL and record Sentry exception with non-critical tag and level set to warning when opening URL fails', async () => {
      const err = new Error('Nope cannot open');
      openURLSpy.mockRejectedValue(err);

      await LinkingUtils.safeOpenURL(testURL);

      expect(captureExceptionSpy).toHaveBeenCalledWith(err, { tags: { type: 'non_critical' }, level: 'warning' });
    });
  });
});
