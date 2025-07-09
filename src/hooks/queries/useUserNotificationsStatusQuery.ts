import { api } from '@/convex/_generated/api';

import { generateUseQueryHook } from './generateUseQueryHook';

export const useUserNotificationsStatusQuery = generateUseQueryHook(
  api.notifications.queries.readUserNotificationsStatus
);
