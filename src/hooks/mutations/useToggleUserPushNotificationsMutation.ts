import { api } from '@/convex/_generated/api';

import { generateUseMutationHook } from './generateUseMutationHook';

export const useToggleUserPushNotificationsMutation = generateUseMutationHook(
  api.notifications.queries.toggleUserNotificationsStatus
);
