import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useMutation } from 'convex/react';

import { LOADING_USER_ID, useUser } from './useUser';

jest.mock('convex/react', () => ({
  ...jest.requireActual('convex/react'),
  useQuery: jest.fn().mockReturnValue(null),
  useMutation: jest.fn(),
}));

describe('useUser', () => {
  const useMutationSpy = useMutation as jest.Mock;
  const asyncStorageGetItemSpy = jest.spyOn(AsyncStorage, 'getItem');
  const asyncStorageSetItemSpy = jest.spyOn(AsyncStorage, 'setItem');
  const asyncStorageRemoveItemSpy = jest.spyOn(AsyncStorage, 'removeItem');

  const mockPatchUser = jest.fn().mockResolvedValue(null);
  const mockDeleteUser = jest.fn().mockResolvedValue(null);

  beforeEach(() => {
    useMutationSpy.mockReturnValueOnce(mockPatchUser).mockReturnValueOnce(mockDeleteUser);
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

  it('should trigger patch user mutation on updateUser action', async () => {
    const { result } = renderHook(() => useUser());

    await result.current.updateUser({ id: 'mockUserId', data: { nickname: 'New nickname' } });

    expect(mockPatchUser).toHaveBeenCalledWith({ id: 'mockUserId', data: { nickname: 'New nickname' } });
  });
});
