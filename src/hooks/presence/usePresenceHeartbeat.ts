import { useConvex, useMutation } from 'convex/react';
import * as Crypto from 'expo-crypto';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { api } from '@/convex/_generated/api';

export const PRESENCE_HEARTBEAT_INTERVAL_MS = 30_000;

/**
 * Only one call in flight at a time; if more calls come in meanwhile, the latest args win. Same as
 * `useSingleFlight` from `@convex-dev/presence`, which isn't exported from the package.
 */
function useSingleFlight<F extends (...args: never[]) => Promise<unknown>>(fn: F) {
  const flightStatus = useRef({
    inFlight: false,
    upNext: null as null | { args: Parameters<F>; resolve: (value: unknown) => void; reject: (err: unknown) => void },
  });

  return useCallback(
    (...args: Parameters<F>): ReturnType<F> => {
      if (flightStatus.current.inFlight) {
        return new Promise((resolve, reject) => {
          flightStatus.current.upNext = { args, resolve, reject };
        }) as ReturnType<F>;
      }
      flightStatus.current.inFlight = true;
      const firstReq = fn(...args) as ReturnType<F>;
      void (async () => {
        try {
          await firstReq;
        } catch {
          // Failed requests just move on to the next one.
        }
        while (flightStatus.current.upNext) {
          const cur = flightStatus.current.upNext;
          flightStatus.current.upNext = null;
          await fn(...cur.args)
            .then(cur.resolve)
            .catch(cur.reject);
        }
        flightStatus.current.inFlight = false;
      })();
      return firstReq;
    },
    [fn]
  );
}

/**
 * Heartbeat-only variant of `usePresence` from `@convex-dev/presence/react-native`. The upstream hook also
 * subscribes to `presence.list` (the full room list, re-run on every presence change) even when the caller
 * ignores its return value — which is all we ever did. This keeps the session alive without that subscription.
 */
export function usePresenceHeartbeat(roomId: string, userId: string, interval = PRESENCE_HEARTBEAT_INTERVAL_MS) {
  const convex = useConvex();
  const baseUrl = convex.url;

  // Each hook instance has a stable ID. Including the room and user gives each presence identity a distinct
  // server session.
  const [instanceId] = useState(() => Crypto.randomUUID());
  const sessionId = JSON.stringify([instanceId, roomId, userId]);

  const sessionTokenRef = useRef<string | null>(null);
  // A newer effect may adopt the same session when only `interval` changes.
  const activeSessionIdRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // A heartbeat that resolves after the app was backgrounded must not be kept alive.
  const isAppBackgroundedRef = useRef(AppState.currentState === 'background');

  const heartbeat = useSingleFlight(useMutation(api.presence.heartbeat));

  const fireAndForgetDisconnect = useCallback(
    (token: string) => {
      fetch(`${baseUrl}/api/mutation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: 'presence:disconnect', args: { sessionToken: token } }),
      }).catch(() => {});
    },
    [baseUrl]
  );

  // A roomId/userId change produces a new sessionId, so this effect re-runs and its cleanup disconnects the old
  // session before the new one heartbeats.
  useEffect(() => {
    let canceled = false;
    activeSessionIdRef.current = sessionId;

    const disconnectIfOrphaned = (token: string) => {
      queueMicrotask(() => {
        if (activeSessionIdRef.current !== sessionId) {
          fireAndForgetDisconnect(token);
        }
      });
    };

    const sendHeartbeat = async () => {
      let result: Awaited<ReturnType<typeof heartbeat>>;
      try {
        result = await heartbeat({ roomId, userId, sessionId, interval });
      } catch {
        // Presence is best-effort; the next scheduled heartbeat retries.
        return;
      }
      if (canceled) {
        disconnectIfOrphaned(result.sessionToken);
        return;
      }
      if (isAppBackgroundedRef.current) {
        // The background handler ran while this request was in flight, so it had no token to disconnect.
        fireAndForgetDisconnect(result.sessionToken);
        return;
      }
      sessionTokenRef.current = result.sessionToken;
    };

    void sendHeartbeat();
    intervalRef.current = setInterval(sendHeartbeat, interval);

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        isAppBackgroundedRef.current = true;
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (sessionTokenRef.current) fireAndForgetDisconnect(sessionTokenRef.current);
      } else if (state === 'active') {
        isAppBackgroundedRef.current = false;
        void sendHeartbeat();
        // iOS can go inactive -> active without entering the background.
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(sendHeartbeat, interval);
      }
    });

    return () => {
      canceled = true;
      activeSessionIdRef.current = null;
      const token = sessionTokenRef.current;
      sessionTokenRef.current = null;

      if (intervalRef.current) clearInterval(intervalRef.current);
      subscription.remove();

      if (token) disconnectIfOrphaned(token);
    };
  }, [roomId, userId, sessionId, interval, heartbeat, fireAndForgetDisconnect]);
}
