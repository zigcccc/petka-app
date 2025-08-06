import { type NamedTableInfo, type Query } from 'convex/server';
import { ConvexError } from 'convex/values';
import { zid } from 'convex-helpers/server/zod';
import { z } from 'zod';

import { internal } from '../_generated/api';
import { type DataModel, type Id } from '../_generated/dataModel';
import { generateRandomString, weekBounds, windowAround } from '../shared/helpers';
import { internalMutation, mutation, query } from '../shared/queries';
import { type User } from '../users/models';

import {
  createLeaderboardModel,
  leaderboardRange,
  leaderboardType,
  updateLeaderboardModel,
  type LeaderboardWithScores,
} from './models';

export const list = query({
  args: z.object({ userId: zid('users'), type: leaderboardType, range: leaderboardRange, timestamp: z.number() }),
  async handler(ctx, { userId, type, range, timestamp }) {
    const normalizedUserId = ctx.db.normalizeId('users', userId);

    if (!normalizedUserId) {
      throw new ConvexError({ message: 'Invalid user ID provided.', code: 400 });
    }

    const leaderboards = await ctx.db
      .query('leaderboards')
      .withIndex('by_type', (q) => q.eq('type', type))
      .collect();

    const userJoinedLeaderboards =
      type === leaderboardType.Enum.private
        ? leaderboards.filter((leaderboard) => leaderboard.users?.includes(userId))
        : leaderboards;

    const leaderboardsWithScores: LeaderboardWithScores[] = [];

    for (const leaderboard of userJoinedLeaderboards) {
      const leaderboardEntries = await ctx.db
        .query('leaderboardEntries')
        .withIndex('by_leaderboard', (q) => {
          if (range === leaderboardRange.Enum.weekly) {
            const { lastMonday, nextSunday } = weekBounds(timestamp);
            return q
              .eq('leaderboardId', leaderboard._id)
              .gte('_creationTime', lastMonday.getTime())
              .lte('_creationTime', nextSunday.getTime());
          }

          return q.eq('leaderboardId', leaderboard._id);
        })
        .collect();

      const usersScoreMap = leaderboard.users
        ? new Map(leaderboard.users.map((userId) => [userId, 0]))
        : new Map([[normalizedUserId, 0]]);

      for (const entry of leaderboardEntries) {
        usersScoreMap.set(entry.userId, (usersScoreMap.get(entry.userId) ?? 0) + entry.score);
      }

      const scoresToReport = Array.from(usersScoreMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([userId, score], idx) => ({
          userId,
          score,
          isForCurrentUser: userId === normalizedUserId,
          position: idx + 1,
        }));

      const usersForScores = await Promise.all(
        scoresToReport.map((score) => ctx.db.get(ctx.db.normalizeId('users', score.userId)!))
      );
      const usersById = new Map(usersForScores.filter((user) => !!user).map((user) => [user._id, user]));

      leaderboardsWithScores.push({
        ...leaderboard,
        scores: scoresToReport.map(({ userId, ...score }) => ({
          ...score,
          user: usersById.get(userId as Id<'users'>)!,
        })),
      });
    }

    return leaderboardsWithScores;
  },
});

export const readGlobalLeaderboard = query({
  args: { range: leaderboardRange, userId: z.string(), timestamp: z.number() },
  async handler(ctx, { range, userId, timestamp }) {
    const normalizedUserId = ctx.db.normalizeId('users', userId);

    if (!normalizedUserId) {
      throw new ConvexError({ message: 'Invalid user id provided.', code: 400 });
    }

    const globalLeaderboard = await ctx.db
      .query('leaderboards')
      .withIndex('by_type', (q) => q.eq('type', leaderboardType.Enum.global))
      .unique();

    if (!globalLeaderboard) {
      throw new ConvexError({ message: 'Global leaderboard not found.', code: 400 });
    }

    let leaderboardEntriesBaseQuery: Query<NamedTableInfo<DataModel, 'leaderboardEntries'>>;

    if (range === leaderboardRange.Enum.weekly) {
      const { lastMonday, nextSunday } = weekBounds(timestamp);

      leaderboardEntriesBaseQuery = ctx.db
        .query('leaderboardEntries')
        .withIndex('by_leaderboard', (q) =>
          q
            .eq('leaderboardId', globalLeaderboard._id)
            .gte('_creationTime', lastMonday.getTime())
            .lte('_creationTime', nextSunday.getTime())
        );
    } else {
      leaderboardEntriesBaseQuery = ctx.db
        .query('leaderboardEntries')
        .withIndex('by_leaderboard', (q) => q.eq('leaderboardId', globalLeaderboard._id));
    }

    const leaderboardEntries = await leaderboardEntriesBaseQuery.collect();

    const usersScoreMap: Record<string, number> = {
      [normalizedUserId]: 0,
    };

    for (const entry of leaderboardEntries) {
      usersScoreMap[entry.userId] = (usersScoreMap[entry.userId] ?? 0) + entry.score;
    }

    const [topScore, ...scores] = Object.entries(usersScoreMap)
      .sort((a, b) => b[1] - a[1])
      .map(([userId, score], idx) => ({
        userId,
        score,
        isForCurrentUser: userId === normalizedUserId,
        position: idx + 1,
      }));

    const scoresToReport = windowAround(scores, (score) => score.isForCurrentUser);

    if (topScore) {
      scoresToReport.unshift(topScore);
    }

    const usersForScores = await Promise.all(
      scoresToReport.map((score) => ctx.db.get(ctx.db.normalizeId('users', score.userId)!))
    );
    const usersMap = usersForScores.reduce(
      (acc, user) => {
        if (user) {
          acc[user._id] = user;
        }

        return acc;
      },
      {} as Record<string, User>
    );

    return {
      ...globalLeaderboard,
      scores: scoresToReport.map(({ userId, ...score }) => ({ ...score, user: usersMap[userId] })),
    };
  },
});

export const populateLeaderboardWithExistingRecords = internalMutation({
  args: { userId: zid('users'), leaderboardId: zid('leaderboards') },
  async handler(ctx, { userId, leaderboardId }) {
    const globalLeaderboard = await ctx.db
      .query('leaderboards')
      .withIndex('by_type', (q) => q.eq('type', leaderboardType.Enum.global))
      .unique();
    if (!globalLeaderboard) {
      throw new ConvexError({ message: 'Global leaderboard not found', code: 500 });
    }
    const existingLeaderboardEntriesQuery = ctx.db
      .query('leaderboardEntries')
      .withIndex('by_leaderboard_user', (q) => q.eq('leaderboardId', globalLeaderboard._id).eq('userId', userId));

    for await (const entry of existingLeaderboardEntriesQuery) {
      await ctx.db.insert('leaderboardEntries', {
        leaderboardId: leaderboardId,
        userId,
        puzzleId: entry.puzzleId,
        score: entry.score,
      });
    }
  },
});

export const createPrivateLeaderboard = mutation({
  args: { userId: zid('users'), data: createLeaderboardModel },
  async handler(ctx, { userId, data }) {
    const normalizedUserId = ctx.db.normalizeId('users', userId);

    if (!normalizedUserId) {
      throw new ConvexError({ message: 'Invalid user id provided.', code: 400 });
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      const inviteCode = generateRandomString();

      const existing = await ctx.db
        .query('leaderboards')
        .withIndex('by_invite_code', (q) => q.eq('inviteCode', inviteCode))
        .unique();

      if (existing) continue;

      const createdLeaderboardId = await ctx.db.insert('leaderboards', {
        name: data.name,
        type: leaderboardType.Enum.private,
        creatorId: normalizedUserId,
        users: [normalizedUserId],
        inviteCode,
      });

      ctx.scheduler.runAfter(0, internal.leaderboards.queries.populateLeaderboardWithExistingRecords, {
        userId: normalizedUserId,
        leaderboardId: createdLeaderboardId,
      });

      return createdLeaderboardId;
    }

    throw new ConvexError({ message: 'Could not generate unique invite code.', code: 400 });
  },
});

export const joinPrivateLeaderboard = mutation({
  args: { inviteCode: z.string(), userId: z.string() },
  async handler(ctx, { inviteCode, userId }) {
    const normalizedUserId = ctx.db.normalizeId('users', userId);

    if (!normalizedUserId) {
      throw new ConvexError({ message: 'Invalid user id provided.', code: 400 });
    }

    const leaderboard = await ctx.db
      .query('leaderboards')
      .withIndex('by_invite_code', (q) => q.eq('inviteCode', inviteCode))
      .unique();

    if (!leaderboard) {
      throw new ConvexError({ message: 'Invalid invite code.', code: 400 });
    }

    if (leaderboard.users?.includes(normalizedUserId)) {
      throw new ConvexError({ message: 'Already joined this leaderboard.', code: 400 });
    }

    await ctx.db.patch(leaderboard._id, {
      users: leaderboard.users ? [...leaderboard.users, normalizedUserId] : [normalizedUserId],
    });

    ctx.scheduler.runAfter(0, internal.leaderboards.queries.populateLeaderboardWithExistingRecords, {
      userId: normalizedUserId,
      leaderboardId: leaderboard._id,
    });

    return leaderboard;
  },
});

export const updateLeaderboardName = mutation({
  args: { data: updateLeaderboardModel, leaderboardId: zid('leaderboards'), userId: zid('users') },
  async handler(ctx, { data, userId, leaderboardId }) {
    const normalizedLeaderboardId = ctx.db.normalizeId('leaderboards', leaderboardId);
    const normalizedUserId = ctx.db.normalizeId('users', userId);

    if (!normalizedUserId) {
      throw new ConvexError({ message: 'Invalid user id provided.', code: 400 });
    }

    if (!normalizedLeaderboardId) {
      throw new ConvexError({ message: 'Invalid leaderboard id provided.', code: 400 });
    }

    const leaderboard = await ctx.db.get(normalizedLeaderboardId);

    if (!leaderboard) {
      throw new ConvexError({ message: 'Leaderboard not found.', code: 404 });
    }

    if (leaderboard.creatorId !== normalizedUserId) {
      throw new ConvexError({ message: 'Only the creator of the leaderboard can update it.', code: 403 });
    }

    await ctx.db.patch(normalizedLeaderboardId, { name: data.name });
  },
});

export const deletePrivateLeaderboard = mutation({
  args: { leaderboardId: zid('leaderboards'), userId: zid('users') },
  async handler(ctx, { leaderboardId, userId }) {
    const normalizedUserId = ctx.db.normalizeId('users', userId);
    const normalizedLeaderboardId = ctx.db.normalizeId('leaderboards', leaderboardId);

    if (!normalizedUserId) {
      throw new ConvexError({ message: 'Invalid user id provided.', code: 400 });
    }

    if (!normalizedLeaderboardId) {
      throw new ConvexError({ message: 'Invalid leaderboard id provided.', code: 400 });
    }

    const leaderboard = await ctx.db.get(normalizedLeaderboardId);

    if (!leaderboard) {
      throw new ConvexError({ message: 'Leaderboard not found.', code: 404 });
    }

    if (leaderboard.type === leaderboardType.Enum.global) {
      throw new ConvexError({ message: 'Cannot perform delete opration on a global leaderboard.', code: 403 });
    }

    if (leaderboard.creatorId !== normalizedUserId) {
      throw new ConvexError({ message: 'Only the creator of the leaderboard can delete it.', code: 403 });
    }

    const leaderboardEntriesQuery = ctx.db
      .query('leaderboardEntries')
      .withIndex('by_leaderboard', (q) => q.eq('leaderboardId', normalizedLeaderboardId));

    for await (const entry of leaderboardEntriesQuery) {
      await ctx.db.delete(entry._id);
    }

    return await ctx.db.delete(normalizedLeaderboardId);
  },
});

export const leavePrivateLeaderboard = mutation({
  args: { leaderboardId: zid('leaderboards'), userId: zid('users') },
  async handler(ctx, { leaderboardId, userId }) {
    const normalizedUserId = ctx.db.normalizeId('users', userId);
    const normalizedLeaderboardId = ctx.db.normalizeId('leaderboards', leaderboardId);

    if (!normalizedUserId) {
      throw new ConvexError({ message: 'Invalid user id provided.', code: 400 });
    }

    if (!normalizedLeaderboardId) {
      throw new ConvexError({ message: 'Invalid leaderboard id provided.', code: 400 });
    }

    const leaderboard = await ctx.db.get(normalizedLeaderboardId);

    if (!leaderboard) {
      throw new ConvexError({ message: 'Leaderboard not found.', code: 404 });
    }

    if (leaderboard.creatorId === normalizedUserId) {
      throw new ConvexError({
        message: 'Creators are not allowed to leave their leaderboard. Delete it instead.',
        code: 400,
      });
    }

    const userLeaderboardEntriesQuery = ctx.db
      .query('leaderboardEntries')
      .withIndex('by_leaderboard_user', (q) =>
        q.eq('leaderboardId', normalizedLeaderboardId).eq('userId', normalizedUserId)
      );

    for await (const entry of userLeaderboardEntriesQuery) {
      await ctx.db.delete(entry._id);
    }

    return await ctx.db.patch(normalizedLeaderboardId, {
      users: leaderboard.users ? leaderboard.users.filter((id) => id !== normalizedUserId) : leaderboard.users,
    });
  },
});
