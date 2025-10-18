import { ConvexError } from 'convex/values';
import { zid } from 'convex-helpers/server/zod';
import { z } from 'zod';

import { internal } from '../_generated/api';
import { leaderboardType } from '../leaderboards/models';
import { puzzleType } from '../puzzles/models';
import { internalMutation, mutation, query } from '../shared/queries';

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
        .filter((q) => q.and(q.eq(q.field('lowercaseNickname'), nickname.toLowerCase()), q.neq(q.field('_id'), userId)))
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

export const cleanupUserData = internalMutation({
  args: { id: zid('users') },
  async handler(ctx, { id }) {
    const leaderboardEntriesQuery = ctx.db.query('leaderboardEntries').withIndex('by_user', (q) => q.eq('userId', id));
    for await (const entry of leaderboardEntriesQuery) {
      await ctx.db.delete(entry._id);
    }

    const leaderboardsQuery = ctx.db.query('leaderboards').withIndex('by_creator_id', (q) => q.eq('creatorId', id));
    for await (const leaderboard of leaderboardsQuery) {
      await ctx.db.delete(leaderboard._id);
    }

    const joinedLeaderboardsQuery = ctx.db
      .query('leaderboards')
      .withIndex('by_type', (q) => q.eq('type', leaderboardType.Enum.private));
    for await (const joinedLeaderboard of joinedLeaderboardsQuery) {
      await ctx.db.patch(joinedLeaderboard._id, { users: joinedLeaderboard.users?.filter((userId) => userId !== id) });
    }

    const puzzleGuessAttemptsQuery = ctx.db
      .query('puzzleGuessAttempts')
      .withIndex('by_user', (q) => q.eq('userId', id));
    for await (const guessAttempt of puzzleGuessAttemptsQuery) {
      await ctx.db.delete(guessAttempt._id);
    }

    const puzzlesQuery = ctx.db
      .query('puzzles')
      .withIndex('by_type_creator', (q) => q.eq('type', puzzleType.Enum.training).eq('creatorId', id));
    for await (const puzzle of puzzlesQuery) {
      await ctx.db.delete(puzzle._id);
    }
  },
});

export const validateExistingAccount = mutation({
  args: { id: z.string(), nickname: z.string() },
  async handler(ctx, { id, nickname }) {
    const userId = ctx.db.normalizeId('users', id);

    if (!userId) {
      throw new ConvexError({ code: 400, message: 'Unable to validate account. Please check your credentials.' });
    }

    const user = await ctx.db.get(userId);

    if (!user) {
      throw new ConvexError({ code: 400, message: 'Unable to validate account. Please check your credentials.' });
    }

    if (user.lowercaseNickname !== nickname.toLowerCase()) {
      throw new ConvexError({ code: 400, message: 'Unable to validate account. Please check your credentials.' });
    }

    return user;
  },
});

export const destroy = mutation({
  args: { id: zid('users') },
  async handler(ctx, { id }) {
    const userId = ctx.db.normalizeId('users', id);

    if (!userId) {
      throw new ConvexError({ code: 400, message: 'Invalid user id provided.' });
    }

    await ctx.runMutation(internal.users.queries.cleanupUserData, { id });
    await ctx.db.delete(userId);
  },
});
