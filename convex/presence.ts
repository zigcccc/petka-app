import { Presence } from '@convex-dev/presence';
import { v } from 'convex/values';

import { components } from './_generated/api';
import { mutation, query } from './_generated/server';

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
  args: { roomId: v.string(), onlineOnly: v.boolean() },
  async handler(ctx, args) {
    return await presence.listRoom(ctx, args.roomId, args.onlineOnly);
  },
});

export const disconnect = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    return await presence.disconnect(ctx, sessionToken);
  },
});
