import { renderHook } from '@testing-library/react-native';
import type { FunctionReference } from 'convex/server';

import { generateUseQueryHook, generateUseQueryHookWithTimestampArg } from './generateUseQueryHook';

const mockUseQuery = jest.fn();

jest.mock('convex/react', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

type UserQuery = FunctionReference<'query'> & {
  _args: { id?: string; timestamp?: number };
  _returnType: { name: string } | null;
};
const userQueryFn = {} as UserQuery;

describe('generateUseQueryHook', () => {
  const useUserQuery = generateUseQueryHook(userQueryFn);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns loading state when data is undefined', () => {
    mockUseQuery.mockReturnValueOnce(undefined);

    const { result } = renderHook(() => useUserQuery({ id: 'abc' }));
    expect(result.current).toEqual({
      isLoading: true,
      isNotFound: false,
      data: undefined,
    });
  });

  it('returns not-found state when data is null', () => {
    mockUseQuery.mockReturnValueOnce(null);

    const { result } = renderHook(() => useUserQuery({ id: 'abc' }));
    expect(result.current).toEqual({
      isLoading: false,
      isNotFound: true,
      data: null,
    });
  });

  it('returns data when query succeeds', () => {
    const response = { name: 'Alice' };
    mockUseQuery.mockReturnValueOnce(response);

    const { result } = renderHook(() => useUserQuery({ id: 'abc' }));
    expect(result.current).toEqual({
      isLoading: false,
      isNotFound: false,
      data: response,
    });
  });

  it('passes "skip" straight through to useQuery', () => {
    mockUseQuery.mockReturnValueOnce(undefined);

    renderHook(() => useUserQuery('skip'));
    expect(mockUseQuery).toHaveBeenCalledWith(userQueryFn, 'skip');
  });
});

describe('generateUseQueryHookWithTimestampArg', () => {
  const useUserQueryWithTs = generateUseQueryHookWithTimestampArg(userQueryFn);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('injects a timestamp and keeps it stable across renders', () => {
    const start = new Date('2025-07-04T12:00:00Z').getTime();
    jest.setSystemTime(start);

    /* first render – loading */
    mockUseQuery.mockReturnValueOnce(undefined);
    const { rerender } = renderHook((props) => useUserQueryWithTs(props), { initialProps: { id: 'abc' } });

    expect(mockUseQuery).toHaveBeenCalledWith(userQueryFn, {
      id: 'abc',
      timestamp: start,
    });

    /* second render – data arrives, timestamp must stay the same */
    jest.setSystemTime(start + 10_000);
    mockUseQuery.mockReturnValueOnce({ name: 'Alice' });
    rerender({ id: 'abc' });

    expect(mockUseQuery).toHaveBeenLastCalledWith(userQueryFn, {
      id: 'abc',
      timestamp: start,
    });
  });

  it('passes "skip" straight through to useQuery', () => {
    mockUseQuery.mockReturnValueOnce(undefined);

    renderHook(() => useUserQueryWithTs('skip'));
    expect(mockUseQuery).toHaveBeenCalledWith(userQueryFn, 'skip');
  });

  it('accepts no args when timestamp is the only argument', () => {
    type PingQuery = FunctionReference<'query'> & {
      _args: { timestamp: number };
      _returnType: string;
    };
    const pingQueryFn = {} as PingQuery;
    const usePing = generateUseQueryHookWithTimestampArg(pingQueryFn);

    const now = 1_646_000_000_000; // arbitrary fixed epoch
    jest.setSystemTime(now);
    mockUseQuery.mockReturnValueOnce('pong');

    renderHook(() => usePing({}));

    expect(mockUseQuery).toHaveBeenCalledWith(pingQueryFn, { timestamp: now });
  });
});
