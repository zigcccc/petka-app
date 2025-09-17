import { Platform } from 'react-native';

import { getOsMajorVersion } from './platform';

jest.mock('react-native', () => ({
  Platform: {},
}));

describe('getOsMajorVersion', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns major version when Platform.Version is a string with dots', () => {
    Platform.Version = '14.2.1';
    expect(getOsMajorVersion()).toBe(14);
  });

  it('returns major version when Platform.Version is a string without dots', () => {
    Platform.Version = '15';
    expect(getOsMajorVersion()).toBe(15);
  });

  it('returns version as is when Platform.Version is a number', () => {
    Platform.Version = 29;
    expect(getOsMajorVersion()).toBe(29);
  });

  it('returns 0 when Platform.Version is invalid string', () => {
    Platform.Version = 'abc';
    expect(getOsMajorVersion()).toBeNaN();
  });

  it('returns 0 when accessing Platform.Version throws', () => {
    Object.defineProperty(Platform, 'Version', {
      get: () => {
        throw new Error('Platform error');
      },
    });
    expect(getOsMajorVersion()).toBe(0);
  });
});
