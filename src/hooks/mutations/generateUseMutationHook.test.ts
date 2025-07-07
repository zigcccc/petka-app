import { renderHook, act, waitFor } from '@testing-library/react-native';
import type { FunctionReference } from 'convex/server';

import { generateUseMutationHook } from './generateUseMutationHook';

const mockUseMutation = jest.fn();
const mockCaptureException = jest.fn();

jest.mock('convex/react', () => ({
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}));

jest.mock('posthog-react-native', () => ({
  usePostHog: () => ({ captureException: mockCaptureException }),
}));

type UpdateUser = FunctionReference<'mutation'> & {
  _args: { name: string };
  _returnType: boolean;
  _componentPath: string;
};

const updateUserFn = { _componentPath: 'src/mutations/updateUser.ts' } as UpdateUser;

describe('generateUseMutationHook', () => {
  const useUpdateUser = generateUseMutationHook(updateUserFn);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns loading flag and result on success', async () => {
    const mutationImpl = jest.fn().mockResolvedValue(true);
    mockUseMutation.mockReturnValueOnce(mutationImpl);

    const { result } = renderHook(() => useUpdateUser());

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.mutate({ name: 'Alice' });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    expect(mutationImpl).toHaveBeenCalledWith({ name: 'Alice' });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockCaptureException).not.toHaveBeenCalled();
  });

  it('captures exception and resets loading flag on error - componentPath exists', async () => {
    const err = new Error('fail');
    const mutationImpl = jest.fn().mockRejectedValue(err);
    mockUseMutation.mockReturnValueOnce(mutationImpl);

    const { result } = renderHook(() => useUpdateUser());

    await expect(act(() => result.current.mutate({ name: 'Bob' }))).rejects.toThrow(err);

    expect(result.current.isLoading).toBe(false);
    expect(mockCaptureException).toHaveBeenCalledWith(err, {
      mutation: 'src/mutations/updateUser.ts',
      args: { name: 'Bob' },
    });
  });

  it('captures exception and resets loading flag on error - componentPath does not exist', async () => {
    const useUpdateUserWithoutComponentPath = generateUseMutationHook({} as FunctionReference<'mutation'>);
    const err = new Error('fail');
    const mutationImpl = jest.fn().mockRejectedValue(err);
    mockUseMutation.mockReturnValueOnce(mutationImpl);

    const { result } = renderHook(() => useUpdateUserWithoutComponentPath());

    await expect(act(() => result.current.mutate({ name: 'Bob' }))).rejects.toThrow(err);

    expect(result.current.isLoading).toBe(false);
    expect(mockCaptureException).toHaveBeenCalledWith(err, {
      mutation: 'unknown',
      args: { name: 'Bob' },
    });
  });

  it('handles concurrent mutations correctly', async () => {
    const mutationImpl = jest
      .fn()
      .mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve(true), 100)))
      .mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve(false), 50)));
    mockUseMutation.mockReturnValue(mutationImpl);

    const { result } = renderHook(() => useUpdateUser());

    // Start two mutations concurrently
    act(() => {
      result.current.mutate({ name: 'Alice' });
      result.current.mutate({ name: 'Bob' });
    });

    // Both should set loading to true
    expect(result.current.isLoading).toBe(true);

    // Wait for both to complete
    await waitFor(() => {
      expect(mutationImpl).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('maintains isLoading state correctly when component unmounts', () => {
    const mutationImpl = jest.fn().mockReturnValue(new Promise(() => {})); // Never resolves
    mockUseMutation.mockReturnValueOnce(mutationImpl);

    const { result, unmount } = renderHook(() => useUpdateUser());

    act(() => {
      result.current.mutate({ name: 'Alice' });
    });

    expect(result.current.isLoading).toBe(true);

    // Unmount while mutation is in progress
    unmount();

    // Should not throw or cause issues
    expect(mutationImpl).toHaveBeenCalledWith({ name: 'Alice' });
  });
});
