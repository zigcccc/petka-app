import { waitFor } from '@testing-library/react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { notificationsPermissionsLookup, registerForPushNotificationsAsync } from './notifications';

jest.mock('expo-notifications', () => ({
  ...jest.requireActual('expo-notifications'),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
}));

let mockProjectId: string | null = 'testProjectId';
let mockExpoConfig: null | object = null;

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    get expoConfig() {
      return mockExpoConfig;
    },
    get easConfig() {
      return { projectId: mockProjectId };
    },
  },
}));

describe('registerForPushNotificationsAsync', () => {
  const mockGetPermissionsAsync = Notifications.getPermissionsAsync as jest.Mock;
  const mockRequestPermissionsAsync = Notifications.requestPermissionsAsync as jest.Mock;
  const mockGetExpoPushTokenAsync = Notifications.getExpoPushTokenAsync as jest.Mock;
  const mockSetNotificationChannelAsync = Notifications.setNotificationChannelAsync as jest.Mock;

  const testPushToken = 'testPushToken';

  beforeEach(() => {
    Object.defineProperty(Device, 'isDevice', { writable: true, value: true });
    Object.defineProperty(Platform, 'OS', { writable: true, value: 'ios' });

    mockSetNotificationChannelAsync.mockResolvedValue(null);
    mockGetPermissionsAsync.mockResolvedValue({ status: Notifications.PermissionStatus.GRANTED });
    mockRequestPermissionsAsync.mockResolvedValue({ status: Notifications.PermissionStatus.GRANTED });
    mockGetExpoPushTokenAsync.mockResolvedValue({ data: testPushToken });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if not physical device', async () => {
    Object.defineProperty(Device, 'isDevice', { writable: true, value: false });

    await expect(registerForPushNotificationsAsync()).rejects.toThrow(
      'Must use physical device for push notifications'
    );
  });

  it('should trigger setNotificationChannelAsync when Platform.OS=android', async () => {
    Object.defineProperty(Platform, 'OS', { writable: true, value: 'android' });
    await registerForPushNotificationsAsync();

    expect(mockSetNotificationChannelAsync).toHaveBeenCalledWith('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  });

  it('should not trigger setNotificationChannelAsync when Platform.OS=ios', async () => {
    Object.defineProperty(Platform, 'OS', { writable: true, value: 'ios' });
    await registerForPushNotificationsAsync();

    expect(mockSetNotificationChannelAsync).not.toHaveBeenCalled();
  });

  it('should use the status received from the getPermissionsAsync when status=granted', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: Notifications.PermissionStatus.GRANTED });

    const result = await registerForPushNotificationsAsync();

    expect(result).toBe(testPushToken);

    expect(mockRequestPermissionsAsync).not.toHaveBeenCalled();
  });

  it.each([Notifications.PermissionStatus.DENIED, Notifications.PermissionStatus.UNDETERMINED])(
    'should use the status received from the requestPermissionsAsyn when status of getPermissionsAsync is %s',
    async (getPermissionsAsyncStatus) => {
      mockGetPermissionsAsync.mockResolvedValue({ status: getPermissionsAsyncStatus });
      mockRequestPermissionsAsync.mockResolvedValue({ status: Notifications.PermissionStatus.GRANTED });

      const result = await registerForPushNotificationsAsync();

      expect(result).toBe(testPushToken);

      expect(mockRequestPermissionsAsync).toHaveBeenCalled();
    }
  );

  it.each([Notifications.PermissionStatus.DENIED, Notifications.PermissionStatus.UNDETERMINED])(
    'should throw an error if final status is not "granted" (final status is %s)',
    async (finalStatus) => {
      mockGetPermissionsAsync.mockResolvedValue({ status: finalStatus });
      mockRequestPermissionsAsync.mockResolvedValue({ status: finalStatus });

      await expect(registerForPushNotificationsAsync()).rejects.toThrow(
        'Permission not granted to get push token for push notification!'
      );
    }
  );

  it('should throw an error if project id is not defined in neither expoConfig or easConfig', async () => {
    mockExpoConfig = null;
    mockProjectId = null;
    mockGetPermissionsAsync.mockResolvedValue({ status: Notifications.PermissionStatus.GRANTED });

    await expect(registerForPushNotificationsAsync()).rejects.toThrow('Project ID not found');
  });

  it('should use the projectId defined in expoConfig if it exists', async () => {
    mockExpoConfig = { extra: { eas: { projectId: 'testExpoProjectId' } } };
    mockProjectId = 'testProjectId';
    mockGetPermissionsAsync.mockResolvedValue({ status: Notifications.PermissionStatus.GRANTED });

    await registerForPushNotificationsAsync();

    expect(mockGetExpoPushTokenAsync).toHaveBeenCalledWith({ projectId: 'testExpoProjectId' });
  });

  it.each([null, { extra: null }, { extra: { eas: null } }, { extra: { eas: { projectId: null } } }])(
    'should use the projectId defined in easConfig if expoConfig is %s',
    async (expoConfig) => {
      mockExpoConfig = expoConfig;
      mockProjectId = 'testProjectId';
      mockGetPermissionsAsync.mockResolvedValue({ status: Notifications.PermissionStatus.GRANTED });

      await registerForPushNotificationsAsync();

      expect(mockGetExpoPushTokenAsync).toHaveBeenCalledWith({ projectId: 'testProjectId' });
    }
  );
});

describe('notificationsPermissionsLookup', () => {
  const mockGetPermissionsAsync = Notifications.getPermissionsAsync as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not trigger getPermissionsAsync call when callback is not passed', () => {
    notificationsPermissionsLookup();
    expect(mockGetPermissionsAsync).not.toHaveBeenCalled();
  });

  it('should trigger getPermissionsAsync call when callback is passed - status is denied and cannot ask again', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: Notifications.PermissionStatus.DENIED, canAskAgain: false });

    const callback = jest.fn();
    notificationsPermissionsLookup(callback);

    expect(mockGetPermissionsAsync).toHaveBeenCalled();

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(false);
    });
  });

  it.each([
    { status: Notifications.PermissionStatus.GRANTED, canAskAgain: false },
    { status: Notifications.PermissionStatus.UNDETERMINED, canAskAgain: false },
    { status: Notifications.PermissionStatus.DENIED, canAskAgain: true },
  ])(
    'should trigger getPermissionsAsync call when callback is passed - status is $status and canAskAgain is $canAskAgain',
    async ({ status, canAskAgain }) => {
      mockGetPermissionsAsync.mockResolvedValue({ status, canAskAgain });

      const callback = jest.fn();
      notificationsPermissionsLookup(callback);

      expect(mockGetPermissionsAsync).toHaveBeenCalled();

      await waitFor(() => {
        expect(callback).toHaveBeenCalledWith(true);
      });
    }
  );
});
