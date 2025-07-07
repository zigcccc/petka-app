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

  it('captures exception and resets loading flag on error', async () => {
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
});
