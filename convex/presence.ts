import { Presence } from '@convex-dev/presence';
import { v } from 'convex/values';

import { components, internal } from './_generated/api';
import { internalMutation, mutation, query } from './_generated/server';

export const presence = new Presence(components.presence);

export const heartbeat = mutation({
  args: { roomId: v.string(), userId: v.string(), sessionId: v.string(), interval: v.number() },
  handler: async (ctx, { roomId, userId, sessionId, interval }) => {
    return await presence.heartbeat(ctx, roomId, userId, sessionId, interval);
  },
});

export const list = query({
  args: { roomToken: v.string() },
  handler: async (ctx, { roomToken }) => {
    return await presence.list(ctx, roomToken);
  },
});

export const listRoom = query({
  args: { roomId: v.string(), onlineOnly: v.boolean(), limit: v.optional(v.number()) },
  async handler(ctx, args) {
    return await presence.listRoom(ctx, args.roomId, args.onlineOnly, args.limit ?? 500);
  },
});

export const disconnect = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    return await presence.disconnect(ctx, sessionToken);
  },
});

// Clears stuck "online" users from the daily-puzzle room in bounded batches.
// The component's own removeRoom collect()s every row for the room at once and
// blows the 4096-read limit at our scale, so we walk only the online users and
// remove them one at a time, self-rescheduling until the room is drained.
export const resetDailyPuzzlePresence = internalMutation({
  args: { batchSize: v.optional(v.number()) },
  handler: async (ctx, { batchSize = 100 }) => {
    const online = await presence.listRoom(ctx, 'daily-puzzle', true, batchSize);
    for (const { userId } of online) {
      // Skip the empty-string user: it accumulates a session on every app open
      // before the user record loads, so it can hold >4096 sessions and blow the
      // read limit inside removeRoomUser. Clear it via the dashboard instead.
      if (!userId) continue;
      await presence.removeRoomUser(ctx, 'daily-puzzle', userId);
    }
    if (online.length === batchSize) {
      await ctx.scheduler.runAfter(0, internal.presence.resetDailyPuzzlePresence, { batchSize });
    }
    return { removed: online.length, done: online.length < batchSize };
  },
});
