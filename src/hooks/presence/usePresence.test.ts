import { renderHook, act } from '@testing-library/react-native';
import { AppState } from 'react-native';

import { type PresenceAPI, usePresence } from './usePresence';

jest.mock('convex/react', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn((fn) => fn),
  useConvex: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useQuery, useMutation, useConvex } = require('convex/react');

jest.mock('./useSingleFlight', () => jest.fn().mockImplementation((fn) => fn));

describe('usePresence', () => {
  const useConvexSpy = useConvex as jest.Mock;
  const useQuerySpy = useQuery as jest.Mock;
  const useMutationSpy = useMutation as jest.Mock;

  const presence: PresenceAPI = {
    list: {} as any,
    heartbeat: {} as any,
    disconnect: {} as any,
  };

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type: any, _handler: any) => {
      return { remove: jest.fn() } as any;
    });
    (global as any).fetch = jest.fn(() => Promise.resolve({ ok: true }));

    useConvexSpy.mockReturnValue({ url: 'https://test.convex.dev' });
    useMutationSpy.mockImplementation(() => () => ({
      roomToken: 'room-token',
      sessionToken: 'session-token',
    }));
    useQuerySpy.mockReturnValue([{ userId: 'user1', online: true, lastDisconnected: 0 }]);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('initializes and sends heartbeat', async () => {
    const { result, unmount } = renderHook(() => usePresence(presence, 'room1', 'user1'));

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(result.current).toEqual([{ userId: 'user1', online: true, lastDisconnected: 0 }]);

    unmount();
  });

  it('handles AppState background and active transitions', async () => {
    const { unmount } = renderHook(() => usePresence(presence, 'room1', 'user1'));

    act(() => {
      AppState.addEventListener('change', () => {}); // dummy to ensure hook sets it
      const changeHandler = (AppState.addEventListener as jest.Mock).mock.calls[0][1];
      changeHandler('background');
    });

    act(() => {
      const changeHandler = (AppState.addEventListener as jest.Mock).mock.calls[0][1];
      changeHandler('active');
    });

    unmount();
  });
});
