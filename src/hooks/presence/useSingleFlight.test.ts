import { renderHook, act } from '@testing-library/react-native';

import useSingleFlight from './useSingleFlight';

describe('useSingleFlight (external behavior only)', () => {
  it('executes the first call immediately', async () => {
    const fn = jest.fn().mockResolvedValue(42);
    const { result } = renderHook(() => useSingleFlight(fn));

    let value: any;
    await act(async () => {
      value = await result.current();
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(value).toBe(42);
  });

  it('returns a promise for the second call when first is in-flight', async () => {
    let resolveFirst: any;
    const firstPromise = new Promise<number>((res) => {
      resolveFirst = res;
    });
    const fn = jest.fn().mockReturnValue(firstPromise);

    const { result } = renderHook(() => useSingleFlight(fn));

    let firstCall: Promise<any>;
    await act(async () => {
      firstCall = result.current();
    });

    let secondCallResolved = false;
    const secondCall = result.current().then(() => {
      secondCallResolved = true;
    });

    expect(secondCallResolved).toBe(false);
    expect(fn).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFirst(123);
      await firstCall;
    });

    await secondCall;
    expect(secondCallResolved).toBe(true);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('propagates rejection from the queued call', async () => {
    let resolveFirst: any;
    const firstPromise = new Promise<number>((res) => {
      resolveFirst = res;
    });

    const fn = jest.fn().mockReturnValueOnce(firstPromise).mockRejectedValueOnce(new Error('fail'));

    const { result } = renderHook(() => useSingleFlight(fn));

    let firstCall: Promise<any>;
    await act(async () => {
      firstCall = result.current();
    });

    let error: any;
    const secondCall = result.current().catch((err: unknown) => {
      error = err;
    });

    await act(async () => {
      resolveFirst(42);
      await firstCall;
    });

    await secondCall;
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('fail');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
