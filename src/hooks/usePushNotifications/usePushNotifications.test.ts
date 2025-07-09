import { act, renderHook, waitFor } from '@testing-library/react-native';
import { usePostHog } from 'posthog-react-native';

import { testUser1, testUser2 } from '@/tests/fixtures/users';
import { registerForPushNotificationsAsync } from '@/utils/notifications';

import { useRegisterUserForPushNotificationsMutation, useToggleUserPushNotificationsMutation } from '../mutations';
import { useUserNotificationsStatusQuery } from '../queries';
import { useToaster } from '../useToaster';

import { usePushNotifications } from './usePushNotifications';

jest.mock('posthog-react-native', () => ({
  ...jest.requireActual('posthog-react-native'),
  usePostHog: jest.fn(),
}));

jest.mock('@/utils/notifications', () => ({
  ...jest.requireActual('@/utils/notifications'),
  registerForPushNotificationsAsync: jest.fn(),
}));

jest.mock('../useToaster', () => ({
  ...jest.requireActual('../useToaster'),
  useToaster: jest.fn(),
}));

jest.mock('../mutations', () => ({
  ...jest.requireActual('../mutations'),
  useRegisterUserForPushNotificationsMutation: jest.fn().mockReturnValue({}),
  useToggleUserPushNotificationsMutation: jest.fn().mockReturnValue({}),
}));

jest.mock('../queries', () => ({
  ...jest.requireActual('../queries'),
  useUserNotificationsStatusQuery: jest.fn().mockReturnValue({}),
}));

describe('usePushNotifications', () => {
  const useUserNotificationsStatusQuerySpy = useUserNotificationsStatusQuery as jest.Mock;
  const useToggleUserPushNotificationsMutationSpy = useToggleUserPushNotificationsMutation as jest.Mock;
  const useRegisterUserForPushNotificationsMutationSpy = useRegisterUserForPushNotificationsMutation as jest.Mock;
  const useToasterSpy = useToaster as jest.Mock;
  const usePostHogSpy = usePostHog as jest.Mock;
  const registerForPushNotificationsAsyncSpy = registerForPushNotificationsAsync as jest.Mock;

  const mockToast = jest.fn();
  const mockCaptureEvent = jest.fn();
  const mockCaptureException = jest.fn();
  const mockToggleUserPushNotifications = jest.fn();
  const mockRegisterUserForPushNotifications = jest.fn();

  const testUserNotificationsStatus = {
    hasToken: true,
    paused: false,
  };
  const testPushToken = 'testPushToken';

  beforeEach(() => {
    useToasterSpy.mockReturnValue({ toast: mockToast });
    usePostHogSpy.mockReturnValue({ capture: mockCaptureEvent, captureException: mockCaptureException });
    useToggleUserPushNotificationsMutationSpy.mockReturnValue({ mutate: mockToggleUserPushNotifications });
    useRegisterUserForPushNotificationsMutationSpy.mockReturnValue({ mutate: mockRegisterUserForPushNotifications });
    useUserNotificationsStatusQuerySpy.mockReturnValue({ data: testUserNotificationsStatus });
    registerForPushNotificationsAsyncSpy.mockResolvedValue(testPushToken);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should trigger the user notifications status query with "skip" param if userId is not passed', () => {
    renderHook(({ userId }) => usePushNotifications(userId), { initialProps: { userId: undefined } });

    expect(useUserNotificationsStatusQuerySpy).toHaveBeenCalledWith('skip');
  });

  it('should trigger the user notifications status query with received userId when it is not undefined', () => {
    renderHook(({ userId }) => usePushNotifications(userId), { initialProps: { userId: testUser1._id } });

    expect(useUserNotificationsStatusQuerySpy).toHaveBeenCalledWith({ userId: testUser1._id });
  });

  it('should set enabled=true when status data is available, hasToken=true and paused=false', () => {
    useUserNotificationsStatusQuerySpy.mockReturnValue({ data: { hasToken: true, paused: false } });

    const { result } = renderHook(({ userId }) => usePushNotifications(userId), {
      initialProps: { userId: testUser1._id },
    });

    expect(result.current.enabled).toBe(true);
  });

  it('should set enabled=false when status data is not available', () => {
    useUserNotificationsStatusQuerySpy.mockReturnValue({ data: null });

    const { result } = renderHook(({ userId }) => usePushNotifications(userId), {
      initialProps: { userId: testUser1._id },
    });

    expect(result.current.enabled).toBe(false);
  });

  it.each([
    { hasToken: false, paused: false },
    { hasToken: true, paused: true },
    { hasToken: false, paused: true },
  ])('should set enabled=false when status.hasToken=$hasToken and status.paused=$paused', (statusData) => {
    useUserNotificationsStatusQuerySpy.mockReturnValue({ data: statusData });

    const { result } = renderHook(({ userId }) => usePushNotifications(userId), {
      initialProps: { userId: testUser1._id },
    });

    expect(result.current.enabled).toBe(false);
  });

  it('should trigger register user for push notification mutation on register action - success scenario, not currently registering', async () => {
    mockRegisterUserForPushNotifications.mockResolvedValue(null);

    const { result } = renderHook(({ userId }) => usePushNotifications(userId), {
      initialProps: { userId: testUser1._id },
    });

    act(() => {
      result.current.register(testUser2._id);
    });

    expect(registerForPushNotificationsAsyncSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(mockRegisterUserForPushNotifications).toHaveBeenCalledWith({
        userId: testUser2._id,
        pushToken: testPushToken,
      });
    });

    expect(mockCaptureException).not.toHaveBeenCalled();
  });

  it('should trigger register user for push notification mutation on register action - error scenario, call for getting push token rejects', async () => {
    const error = new Error('ups - no token');
    registerForPushNotificationsAsyncSpy.mockRejectedValue(error);
    mockRegisterUserForPushNotifications.mockResolvedValue(null);

    const { result } = renderHook(({ userId }) => usePushNotifications(userId), {
      initialProps: { userId: testUser1._id },
    });

    act(() => {
      result.current.register(testUser2._id);
    });

    expect(registerForPushNotificationsAsyncSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(mockCaptureException).toHaveBeenCalledWith(error, { userId: testUser2._id });
    });

    expect(mockRegisterUserForPushNotifications).not.toHaveBeenCalled();
  });

  it('should trigger register user for push notification mutation on register action - error scenario, register user for push notifications mutation rejects', async () => {
    const error = new Error('ups - cannot register');
    registerForPushNotificationsAsyncSpy.mockResolvedValue(testPushToken);
    mockRegisterUserForPushNotifications.mockRejectedValue(error);

    const { result } = renderHook(({ userId }) => usePushNotifications(userId), {
      initialProps: { userId: testUser1._id },
    });

    act(() => {
      result.current.register(testUser2._id);
    });

    expect(registerForPushNotificationsAsyncSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(mockRegisterUserForPushNotifications).toHaveBeenCalledWith({
        userId: testUser2._id,
        pushToken: testPushToken,
      });
    });

    await waitFor(() => {
      expect(mockCaptureException).toHaveBeenCalledWith(error, { userId: testUser2._id });
    });
  });

  it('should not trigger register user for push notification mutation on register action when already registering', async () => {
    registerForPushNotificationsAsyncSpy.mockResolvedValue(testPushToken);
    mockRegisterUserForPushNotifications.mockResolvedValue(null);
    useRegisterUserForPushNotificationsMutationSpy.mockReturnValue({
      mutate: mockRegisterUserForPushNotifications,
      isLoading: true,
    });

    const { result } = renderHook(({ userId }) => usePushNotifications(userId), {
      initialProps: { userId: testUser1._id },
    });

    act(() => {
      result.current.register(testUser2._id);
    });

    expect(registerForPushNotificationsAsyncSpy).not.toHaveBeenCalled();
    expect(mockRegisterUserForPushNotifications).not.toHaveBeenCalled();
    expect(mockCaptureException).not.toHaveBeenCalled();
  });

  it('should trigger toggle push notifications mutation on toggle action - success scenario, shouldEnable=true', async () => {
    registerForPushNotificationsAsyncSpy.mockResolvedValue(testPushToken);
    mockToggleUserPushNotifications.mockResolvedValue(null);

    const { result } = renderHook(({ userId }) => usePushNotifications(userId), {
      initialProps: { userId: testUser1._id },
    });

    act(() => {
      result.current.toggle(true);
    });

    expect(registerForPushNotificationsAsyncSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(mockToggleUserPushNotifications).toHaveBeenCalledWith({
        userId: testUser1._id,
        pushToken: testPushToken,
        shouldEnable: true,
      });
    });

    await waitFor(() => {
      expect(mockCaptureEvent).toHaveBeenCalledWith('notifications:toggle', { userId: testUser1._id, newState: 'on' });
    });

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should trigger toggle push notifications mutation on toggle action - success scenario, shouldEnable=false', async () => {
    registerForPushNotificationsAsyncSpy.mockResolvedValue(testPushToken);
    mockToggleUserPushNotifications.mockResolvedValue(null);

    const { result } = renderHook(({ userId }) => usePushNotifications(userId), {
      initialProps: { userId: testUser1._id },
    });

    act(() => {
      result.current.toggle(false);
    });

    expect(mockToggleUserPushNotifications).toHaveBeenCalledWith({
      userId: testUser1._id,
      pushToken: undefined,
      shouldEnable: false,
    });

    await waitFor(() => {
      expect(mockCaptureEvent).toHaveBeenCalledWith('notifications:toggle', { userId: testUser1._id, newState: 'off' });
    });

    expect(registerForPushNotificationsAsyncSpy).not.toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should trigger toggle push notifications mutation on toggle action - error scenario, call for getting pushToken fails', async () => {
    registerForPushNotificationsAsyncSpy.mockRejectedValue(new Error('ups'));
    mockToggleUserPushNotifications.mockResolvedValue(null);

    const { result } = renderHook(({ userId }) => usePushNotifications(userId), {
      initialProps: { userId: testUser1._id },
    });

    act(() => {
      result.current.toggle(true);
    });

    expect(registerForPushNotificationsAsyncSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Nekaj je šlo narobe.', { intent: 'error' });
    });

    expect(mockCaptureEvent).not.toHaveBeenCalled();
    expect(mockToggleUserPushNotifications).not.toHaveBeenCalled();
  });

  it('should trigger toggle push notifications mutation on toggle action - error scenario, toggle push notifications mutation fails', async () => {
    registerForPushNotificationsAsyncSpy.mockResolvedValue(testPushToken);
    mockToggleUserPushNotifications.mockRejectedValue(new Error('ups'));

    const { result } = renderHook(({ userId }) => usePushNotifications(userId), {
      initialProps: { userId: testUser1._id },
    });

    act(() => {
      result.current.toggle(true);
    });

    expect(registerForPushNotificationsAsyncSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(mockToggleUserPushNotifications).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Nekaj je šlo narobe.', { intent: 'error' });
    });

    expect(mockCaptureEvent).not.toHaveBeenCalled();
  });

  it('should not trigger toggle push notifications mutation on toggle action when userId is not passed', async () => {
    registerForPushNotificationsAsyncSpy.mockResolvedValue(testPushToken);
    mockToggleUserPushNotifications.mockResolvedValue(null);

    const { result } = renderHook(({ userId }) => usePushNotifications(userId), {
      initialProps: { userId: undefined },
    });

    act(() => {
      result.current.toggle(true);
    });

    expect(registerForPushNotificationsAsyncSpy).not.toHaveBeenCalled();
    expect(mockToggleUserPushNotifications).not.toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
    expect(mockCaptureEvent).not.toHaveBeenCalled();
  });
});
