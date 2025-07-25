import { useFocusEffect } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { type Id } from '@/convex/_generated/dataModel';
import { notificationsPermissionsLookup, registerForPushNotificationsAsync } from '@/utils/notifications';

import { useRegisterUserForPushNotificationsMutation, useToggleUserPushNotificationsMutation } from '../mutations';
import { useUserNotificationsStatusQuery } from '../queries';
import { useToaster } from '../useToaster';

export function usePushNotifications(userId?: Id<'users'>) {
  const [systemNotificationsEnabled, setSystemNotificationsEnabled] = useState(true);
  const { mutate: registerUserForPushNotifcations, isLoading: isRegistering } =
    useRegisterUserForPushNotificationsMutation();
  const { mutate: togglePushNotifications } = useToggleUserPushNotificationsMutation();
  const posthog = usePostHog();
  const toaster = useToaster();
  const { data: status } = useUserNotificationsStatusQuery(userId ? { userId } : 'skip');

  const enabled = useMemo(() => !!(status && status.hasToken && !status.paused), [status]);

  const toggle = useCallback(
    async (shouldEnable: boolean) => {
      if (!userId) {
        return;
      }

      try {
        let pushToken: string | undefined;
        if (shouldEnable) {
          pushToken = await registerForPushNotificationsAsync();
        }
        await togglePushNotifications({ pushToken, userId, shouldEnable });
        posthog.capture('notifications:toggle', { userId, newState: shouldEnable ? 'on' : 'off' });
      } catch {
        toaster.toast('Nekaj je šlo narobe.', { intent: 'error' });
      }
    },
    [posthog, toaster, togglePushNotifications, userId]
  );

  const register = useCallback(
    async (userIdToRegister: Id<'users'>) => {
      if (isRegistering) {
        return;
      }

      try {
        const pushToken = await registerForPushNotificationsAsync();
        await registerUserForPushNotifcations({ userId: userIdToRegister, pushToken });
      } catch (err) {
        posthog.captureException(err, { userId: userIdToRegister });
      }
    },
    [isRegistering, registerUserForPushNotifcations, posthog]
  );

  useFocusEffect(
    useCallback(() => {
      notificationsPermissionsLookup(setSystemNotificationsEnabled);
    }, [])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') {
        notificationsPermissionsLookup(setSystemNotificationsEnabled);
      }
    });

    return () => subscription.remove();
  }, []);

  return useMemo(
    () => ({ register, toggle, status, enabled, systemNotificationsEnabled }),
    [enabled, register, status, toggle, systemNotificationsEnabled]
  );
}
