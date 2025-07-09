import { ConvexError } from 'convex/values';
import { zid } from 'convex-helpers/server/zod';
import { z } from 'zod';

import { mutation, query } from '../shared/queries';

import { pushNotifications } from './services';

export const readUserNotificationsStatus = query({
  args: { userId: zid('users') },
  handler: async (ctx, { userId }) => {
    return pushNotifications.getStatusForUser(ctx, { userId });
  },
});

export const registerUserForNotifications = mutation({
  args: { userId: zid('users'), pushToken: z.string() },
  handler: async (ctx, { userId, pushToken }) => {
    await pushNotifications.recordToken(ctx, { userId, pushToken });
    // TODO: Add this back once fixed
    await pushNotifications.unpauseNotificationsForUser(ctx, { userId });
  },
});

export const toggleUserNotificationsStatus = mutation({
  args: { userId: zid('users'), pushToken: z.string().optional(), shouldEnable: z.boolean() },
  handler: async (ctx, { userId, pushToken, shouldEnable }) => {
    // TODO: Bring this code back once fixed
    // const { hasToken } = await pushNotifications.getStatusForUser(ctx, { userId });

    // if (!hasToken) {
    //   throw new ConvexError({ message: 'User is not registered for notifications.', code: 400 });
    // }

    // console.log({ userId });

    // if (paused) {
    //   await pushNotifications.unpauseNotificationsForUser(ctx, { userId });
    // } else {
    //   await pushNotifications.pauseNotificationsForUser(ctx, { userId });
    // }

    if (shouldEnable) {
      if (!pushToken) {
        throw new ConvexError({ message: 'Push token is required when enabling notifications.', code: 400 });
      }

      await pushNotifications.recordToken(ctx, { userId, pushToken });
      await pushNotifications.unpauseNotificationsForUser(ctx, { userId });
    } else {
      await pushNotifications.removeToken(ctx, { userId });
      await pushNotifications.pauseNotificationsForUser(ctx, { userId });
    }
  },
});
