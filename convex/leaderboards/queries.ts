import { ConvexError } from 'convex/values';
import { z } from 'zod';

import { generateRandomString, weekBounds, windowAround } from '../shared/helpers';
import { mutation, query } from '../shared/queries';
import { type User } from '../users/models';

import { createLeaderboardModel, leaderboardRange, leaderboardType, type LeaderboardWithScores } from './models';

export const list = query({
  args: z.object({ userId: z.string(), type: leaderboardType, range: leaderboardRange, timestamp: z.number() }),
  async handler(ctx, { userId, type, range, timestamp }) {
    const normalizedUserId = ctx.db.normalizeId('users', userId);

    if (!normalizedUserId) {
      throw new ConvexError({ message: 'Invalid user ID provided.', code: 400 });
    }

    const leaderboards = await ctx.db
      .query('leaderboards')
      .withIndex('by_type', (q) => q.eq('type', type))
      .collect();

    const leaderboardsWithScores: LeaderboardWithScores[] = [];

    for (const leaderboard of leaderboards) {
      let leaderboardEntriesBaseQuery = ctx.db
        .query('leaderboardEntries')
        .withIndex('by_leaderboard', (q) => q.eq('leaderboardId', leaderboard._id));

      if (range === leaderboardRange.Enum.weekly) {
        const { lastMonday, nextSunday } = weekBounds(timestamp);

        leaderboardEntriesBaseQuery = leaderboardEntriesBaseQuery.filter((q) =>
          q.and(
            q.gte(q.field('_creationTime'), lastMonday.getTime()),
            q.lte(q.field('_creationTime'), nextSunday.getTime())
          )
        );
      }

      const leaderboardEntries = await leaderboardEntriesBaseQuery.collect();

      const usersScoreMap: Record<string, number> = {};

      for (const entry of leaderboardEntries) {
        usersScoreMap[entry.userId] = (usersScoreMap[entry.userId] ?? 0) + entry.score;
      }

      const scoresToReport = Object.entries(usersScoreMap)
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
      const usersMap = usersForScores.reduce(
        (acc, user) => {
          if (user) {
            acc[user._id] = user;
          }

          return acc;
        },
        {} as Record<string, User>
      );

      const scoresWithUsers = scoresToReport.map(({ userId, ...score }) => ({ ...score, user: usersMap[userId] }));
      leaderboardsWithScores.push({ ...leaderboard, scores: scoresWithUsers });
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

    let leaderboardEntriesBaseQuery = ctx.db
      .query('leaderboardEntries')
      .withIndex('by_leaderboard', (q) => q.eq('leaderboardId', globalLeaderboard._id));

    if (range === leaderboardRange.Enum.weekly) {
      const { lastMonday, nextSunday } = weekBounds(timestamp);

      leaderboardEntriesBaseQuery = leaderboardEntriesBaseQuery.filter((q) =>
        q.and(
          q.gte(q.field('_creationTime'), lastMonday.getTime()),
          q.lte(q.field('_creationTime'), nextSunday.getTime())
        )
      );
    }

    const leaderboardEntries = await leaderboardEntriesBaseQuery.collect();

    const usersScoreMap: Record<string, number> = {};

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

    const scoresWithUsers = scoresToReport.map(({ userId, ...score }) => ({ ...score, user: usersMap[userId] }));

    return { ...globalLeaderboard, scoresWithUsers };
  },
});

export const createPrivateLeaderboard = mutation({
  args: { userId: z.string(), data: createLeaderboardModel },
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

    return await ctx.db.patch(leaderboard._id, {
      users: leaderboard.users ? [...leaderboard.users, normalizedUserId] : [normalizedUserId],
    });
  },
});
