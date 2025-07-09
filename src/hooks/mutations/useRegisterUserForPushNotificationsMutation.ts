import { api } from '@/convex/_generated/api';

import { generateUseMutationHook } from './generateUseMutationHook';

export const useRegisterUserForPushNotificationsMutation = generateUseMutationHook(
  api.notifications.queries.registerUserForNotifications
);
