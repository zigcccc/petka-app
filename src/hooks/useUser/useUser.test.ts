import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { usePostHog } from 'posthog-react-native';
import { Alert } from 'react-native';

import { testUser1 } from '@/tests/fixtures/users';

import { useCreateUserMutation, useDeleteUserMutation, usePatchUserMutation } from '../mutations';
import { useUserQuery } from '../queries';
import { useToaster } from '../useToaster';

import { LOADING_USER_ID, useUser } from './useUser';

jest.mock('posthog-react-native', () => ({
  ...jest.requireActual('posthog-react-native'),
  usePostHog: jest.fn(),
}));

jest.mock('../queries', () => ({
  ...jest.requireActual('../queries'),
  useUserQuery: jest.fn().mockReturnValue({}),
}));

jest.mock('../mutations', () => ({
  ...jest.requireActual('../mutations'),
  useCreateUserMutation: jest.fn().mockReturnValue({}),
  useDeleteUserMutation: jest.fn().mockReturnValue({}),
  usePatchUserMutation: jest.fn().mockReturnValue({}),
}));

jest.mock('../useToaster', () => ({
  ...jest.requireActual('../useToaster'),
  useToaster: jest.fn(),
}));

describe('useUser', () => {
  const useUserQuerySpy = useUserQuery as jest.Mock;
  const useCreateUserMutationSpy = useCreateUserMutation as jest.Mock;
  const useDeleteUserMutationSpy = useDeleteUserMutation as jest.Mock;
  const usePatchUserMutationSpy = usePatchUserMutation as jest.Mock;
  const usePostHogSpy = usePostHog as jest.Mock;
  const useToasterSpy = useToaster as jest.Mock;
  const alertSpy = jest.spyOn(Alert, 'alert');
  const asyncStorageGetItemSpy = jest.spyOn(AsyncStorage, 'getItem');
  const asyncStorageSetItemSpy = jest.spyOn(AsyncStorage, 'setItem');
  const asyncStorageRemoveItemSpy = jest.spyOn(AsyncStorage, 'removeItem');

  const mockCaptureEvent = jest.fn();
  const mockIdentify = jest.fn();
  const mockPatchUser = jest.fn().mockResolvedValue(null);
  const mockDeleteUser = jest.fn().mockResolvedValue(null);
  const mockCreateUser = jest.fn().mockResolvedValue(null);
  const mockToast = jest.fn();

  beforeEach(() => {
    useToasterSpy.mockReturnValue({ toast: mockToast });
    usePostHogSpy.mockReturnValue({ capture: mockCaptureEvent, identify: mockIdentify });
    useDeleteUserMutationSpy.mockReturnValue({ mutate: mockDeleteUser });
    usePatchUserMutationSpy.mockReturnValue({ mutate: mockPatchUser });
    useCreateUserMutationSpy.mockReturnValue({ mutate: mockCreateUser });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get the userId from local storage on mount and set it to the local value - userId exists', async () => {
    asyncStorageGetItemSpy.mockResolvedValue('mockUserId');
    const { result } = renderHook(() => useUser());

    expect(result.current.userId).toBe(LOADING_USER_ID);

    await waitFor(() => expect(result.current.userId).not.toBe(LOADING_USER_ID));

    expect(result.current.userId).toBe('mockUserId');
  });

  it('should get the userId from local storage on mount and set it to the local value - userId does not exist', async () => {
    asyncStorageGetItemSpy.mockResolvedValue(null);
    const { result } = renderHook(() => useUser());

    expect(result.current.userId).toBe(LOADING_USER_ID);

    await waitFor(() => expect(result.current.userId).not.toBe(LOADING_USER_ID));

    expect(result.current.userId).toBe(null);
  });

  it('should get the userId from local storage on mount and set it to the local value - call to async storage rejects', async () => {
    asyncStorageGetItemSpy.mockRejectedValue(new Error('Error'));
    const { result } = renderHook(() => useUser());

    expect(result.current.userId).toBe(LOADING_USER_ID);

    await waitFor(() => expect(result.current.userId).not.toBe(LOADING_USER_ID));

    expect(result.current.userId).toBe(null);
  });

  it('should set the userId when setUserId is invoked with an id', async () => {
    const { result } = renderHook(() => useUser());

    await result.current.setUserId('newUserId');

    expect(asyncStorageSetItemSpy).toHaveBeenCalledWith('userId', 'newUserId');
    expect(asyncStorageRemoveItemSpy).not.toHaveBeenCalled();

    await waitFor(() => expect(result.current.userId).toBe('newUserId'));
  });

  it('should unset (remove) the userId when setUserId is invoked with null', async () => {
    const { result } = renderHook(() => useUser());

    await result.current.setUserId(null);

    expect(asyncStorageSetItemSpy).not.toHaveBeenCalled();
    expect(asyncStorageRemoveItemSpy).toHaveBeenCalledWith('userId');

    await waitFor(() => expect(result.current.userId).toBe(null));
  });

  it('should trigger create user mutation on createUser action', async () => {
    mockCreateUser.mockResolvedValue(testUser1._id);
    const { result } = renderHook(() => useUser());

    act(() => {
      result.current.createUser({ nickname: 'New nickname' });
    });

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({ data: { nickname: 'New nickname' } });
    });

    await waitFor(() => {
      expect(result.current.userId).toBe(testUser1._id);
    });

    await waitFor(() => {
      expect(mockCaptureEvent).toHaveBeenCalledWith('users:created', { userId: testUser1._id });
    });
  });

  it('should trigger patch user mutation on updateUser action', async () => {
    useUserQuerySpy.mockReturnValue({ data: testUser1 });
    const { result } = renderHook(() => useUser());

    act(() => {
      result.current.updateUser({ nickname: 'New nickname' });
    });

    await waitFor(() => {
      expect(mockPatchUser).toHaveBeenCalledWith({ id: testUser1._id, data: { nickname: 'New nickname' } });
    });

    await waitFor(() => {
      expect(mockCaptureEvent).toHaveBeenCalledWith('users:update', {
        userId: testUser1._id,
        properties: ['nickname'],
      });
    });
  });

  it('should not trigger patch user mutation on updateUser action when user data is not available', async () => {
    useUserQuerySpy.mockReturnValue({ data: null });
    const { result } = renderHook(() => useUser());

    await result.current.updateUser({ nickname: 'New nickname' });

    expect(mockPatchUser).not.toHaveBeenCalled();
    expect(mockCaptureEvent).not.toHaveBeenCalled();
  });

  it('should prompt user for confirmation and trigger delete user mutation on deleteUser action - success scenario', async () => {
    mockDeleteUser.mockResolvedValue(null);
    useUserQuerySpy.mockReturnValue({ data: testUser1 });

    const { result } = renderHook(() => useUser());

    act(() => {
      result.current.deleteUser();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Si prepričan/a?',
      'Ko je uporabniški profil enkrat izbrisan se izgubijo vsi podatki o že odigranih izzivih.',
      [
        { isPreferred: true, style: 'cancel', text: 'Prekliči' },
        { style: 'destructive', text: 'Potrdi', onPress: expect.any(Function) },
      ]
    );

    act(() => {
      // @ts-expect-error
      alertSpy.mock.calls[0][2][1].onPress();
    });

    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledWith({ id: testUser1._id });
    });

    await waitFor(() => {
      expect(mockCaptureEvent).toHaveBeenCalledWith('users:delete', { userId: testUser1._id });
    });

    await waitFor(() => {
      expect(result.current.userId).toBe(null);
    });

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should prompt user for confirmation and trigger delete user mutation on deleteUser action - success scenario with onDeleteCb', async () => {
    mockDeleteUser.mockResolvedValue(null);
    useUserQuerySpy.mockReturnValue({ data: testUser1 });

    const onDeleteCb = jest.fn();

    const { result } = renderHook(() => useUser());

    act(() => {
      result.current.deleteUser(onDeleteCb);
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Si prepričan/a?',
      'Ko je uporabniški profil enkrat izbrisan se izgubijo vsi podatki o že odigranih izzivih.',
      [
        { isPreferred: true, style: 'cancel', text: 'Prekliči' },
        { style: 'destructive', text: 'Potrdi', onPress: expect.any(Function) },
      ]
    );

    act(() => {
      // @ts-expect-error
      alertSpy.mock.calls[0][2][1].onPress();
    });

    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledWith({ id: testUser1._id });
    });

    await waitFor(() => {
      expect(mockCaptureEvent).toHaveBeenCalledWith('users:delete', { userId: testUser1._id });
    });

    expect(onDeleteCb).toHaveBeenCalled();

    await waitFor(() => {
      expect(result.current.userId).toBe(null);
    });

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should prompt user for confirmation and trigger delete user mutation on deleteUser action - error scenario', async () => {
    mockDeleteUser.mockRejectedValue(null);
    useUserQuerySpy.mockReturnValue({ data: testUser1 });

    const onDeleteCb = jest.fn();

    const { result } = renderHook(() => useUser());

    act(() => {
      result.current.deleteUser(onDeleteCb);
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Si prepričan/a?',
      'Ko je uporabniški profil enkrat izbrisan se izgubijo vsi podatki o že odigranih izzivih.',
      [
        { isPreferred: true, style: 'cancel', text: 'Prekliči' },
        { style: 'destructive', text: 'Potrdi', onPress: expect.any(Function) },
      ]
    );

    act(() => {
      // @ts-expect-error
      alertSpy.mock.calls[0][2][1].onPress();
    });

    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledWith({ id: testUser1._id });
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Nekaj je šlo narobe.', { intent: 'error' });
    });

    expect(onDeleteCb).not.toHaveBeenCalled();
    expect(mockCaptureEvent).not.toHaveBeenCalled();
  });

  it('should prompt user for confirmation and not trigger delete user mutation if user data does not exist', async () => {
    mockDeleteUser.mockResolvedValue(null);
    useUserQuerySpy.mockReturnValue({ data: null });

    const { result } = renderHook(() => useUser());

    act(() => {
      result.current.deleteUser();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Si prepričan/a?',
      'Ko je uporabniški profil enkrat izbrisan se izgubijo vsi podatki o že odigranih izzivih.',
      [
        { isPreferred: true, style: 'cancel', text: 'Prekliči' },
        { style: 'destructive', text: 'Potrdi', onPress: expect.any(Function) },
      ]
    );

    act(() => {
      // @ts-expect-error
      alertSpy.mock.calls[0][2][1].onPress();
    });

    await waitFor(() => {
      expect(mockDeleteUser).not.toHaveBeenCalled();
    });

    expect(mockCaptureEvent).not.toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
  });
});
