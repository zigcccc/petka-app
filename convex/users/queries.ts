import { ConvexError } from 'convex/values';
import { z } from 'zod';

import { mutation, query } from '../shared/queries';

import { createUserModel, patchUserModel } from './models';

export const read = query({
  args: { id: z.string() },
  async handler(ctx, { id }) {
    const user = await ctx.db.get(ctx.db.normalizeId('users', id)!);
    return user;
  },
});

export const create = mutation({
  args: { data: createUserModel },
  async handler(ctx, { data }) {
    // Check that the username is not already taken
    const existingUser = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('lowercaseNickname'), data.nickname.toLowerCase()))
      .first();

    // Reject the request if it is
    if (existingUser) {
      throw new ConvexError({ code: 409, message: 'This nickname is already taken.' });
    }

    // Create new user otherwise
    const newUserId = await ctx.db.insert('users', {
      nickname: data.nickname,
      lowercaseNickname: data.nickname.toLowerCase(),
    });

    return newUserId;
  },
});

export const patch = mutation({
  args: { id: z.string(), data: patchUserModel },
  async handler(ctx, { id, data: { nickname } }) {
    const userId = ctx.db.normalizeId('users', id);

    if (!userId) {
      throw new ConvexError({ code: 400, message: 'Invalid user id provided.' });
    }

    // if we're updating the nickname, we need to check that there's no duplicates
    if (nickname) {
      // Check that the username is not already taken
      const existingUser = await ctx.db
        .query('users')
        .filter((q) => q.eq(q.field('lowercaseNickname'), nickname.toLowerCase()))
        .first();

      // Reject the request if it is
      if (existingUser) {
        throw new ConvexError({ code: 409, message: 'This nickname is already taken.' });
      }
    }

    const updatedUser = await ctx.db.patch(
      userId,
      nickname ? { nickname, lowercaseNickname: nickname.toLowerCase() } : { nickname }
    );
    return updatedUser;
  },
});

export const destroy = mutation({
  args: { id: z.string() },
  async handler(ctx, { id }) {
    const userId = ctx.db.normalizeId('users', id);

    if (!userId) {
      throw new ConvexError({ code: 400, message: 'Invalid user id provided.' });
    }

    return await ctx.db.delete(userId);
  },
});
