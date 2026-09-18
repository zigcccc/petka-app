import { ConvexError } from 'convex/values';
import { zid } from 'convex-helpers/server/zod4';
import { z } from 'zod';

import { internal } from '../_generated/api';
import type { Id } from '../_generated/dataModel';
import { leaderboardEntryModel } from '../leaderboardEntries/model';
import {
  addScoreToMembership,
  deleteLeaderboardMemberships,
  getMembership,
  listLeaderboardMemberships,
  listUserMemberships,
} from '../leaderboardMembers/helpers';
import { generateRandomString, weekBounds } from '../shared/helpers';
import { internalMutation, mutation, query } from '../shared/queries';
import {
  createLeaderboardModel,
  type LeaderboardWithScores,
  leaderboardModel,
  leaderboardRange,
  leaderboardType,
  updateLeaderboardModel,
} from './models';

export const list = query({
  args: z.object({ userId: zid('users'), type: leaderboardType, range: leaderboardRange, timestamp: z.number() }),
  async handler(ctx, { userId, type, range, timestamp }) {
    const normalizedUserId = ctx.db.normalizeId('users', userId);

    if (!normalizedUserId) {
      throw new ConvexError({ message: 'Invalid user ID provided.', code: 400 });
    }

    // The global leaderboard has no memberships and is no longer ranked (see `readGlobalLeaderboard`).
    if (type === leaderboardType.enum.global) {
      const globalLeaderboard = await ctx.db
        .query('leaderboards')
        .withIndex('by_type', (q) => q.eq('type', leaderboardType.enum.global))
        .unique();
      return globalLeaderboard ? [{ ...leaderboardModel.parse(globalLeaderboard), scores: [] }] : [];
    }

    const leaderboardsWithScores: LeaderboardWithScores[] = [];

    for (const membership of await listUserMemberships(ctx, normalizedUserId)) {
      const leaderboard = await ctx.db.get(membership.leaderboardId);
      if (!leaderboard) continue;

      const members = await listLeaderboardMemberships(ctx, leaderboard._id);
      const usersScoreMap = new Map<Id<'users'>, number>();

      if (range === leaderboardRange.enum.alltime) {
        for (const member of members) {
          usersScoreMap.set(member.userId, member.totalScore);
        }
      } else {
        const { lastMonday, nextSunday } = weekBounds(timestamp);
        const weeklyEntries = await ctx.db
          .query('leaderboardEntries')
          .withIndex('by_leaderboard_recordedAt', (q) =>
            q
              .eq('leaderboardId', leaderboard._id)
              .gte('recordedAt', lastMonday.getTime())
              .lte('recordedAt', nextSunday.getTime())
          )
          .collect();

        for (const member of members) {
          usersScoreMap.set(member.userId, 0);
        }
        for (const entry of weeklyEntries) {
          const { userId: entryUserId, score: entryScore } = leaderboardEntryModel.parse(entry);
          usersScoreMap.set(entryUserId, (usersScoreMap.get(entryUserId) ?? 0) + entryScore);
        }
      }

      const scoresToReport = Array.from(usersScoreMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([userId, score], idx) => ({
          userId,
          score,
          isForCurrentUser: userId === normalizedUserId,
          position: idx + 1,
        }));

      const usersForScores = await Promise.all(scoresToReport.map((score) => ctx.db.get(score.userId)));
      const usersById = new Map(usersForScores.filter((user) => !!user).map((user) => [user._id, user]));

      leaderboardsWithScores.push({
        ...leaderboardModel.parse(leaderboard),
        scores: scoresToReport
          .filter(({ userId }) => usersById.has(userId))
          .map(({ userId, ...score }) => ({ ...score, user: usersById.get(userId)! })),
      });
    }

    return leaderboardsWithScores;
  },
});

/**
 * @deprecated Removed with version 1.1.40. Still called by older clients — the global leaderboard has >32k entries
 * so scanning them exceeds the read limit. Returns an empty leaderboard instead.
 */
export const readGlobalLeaderboard = query({
  args: { range: leaderboardRange, userId: z.string(), timestamp: z.number() },
  async handler(ctx, { userId }) {
    const normalizedUserId = ctx.db.normalizeId('users', userId);

    if (!normalizedUserId) {
      throw new ConvexError({ message: 'Invalid user id provided.', code: 400 });
    }

    const globalLeaderboard = await ctx.db
      .query('leaderboards')
      .withIndex('by_type', (q) => q.eq('type', leaderboardType.enum.global))
      .unique();

    if (!globalLeaderboard) {
      throw new ConvexError({ message: 'Global leaderboard not found.', code: 400 });
    }

    return { ...globalLeaderboard, scores: [] };
  },
});

export const populateLeaderboardWithExistingRecords = internalMutation({
  args: { userId: zid('users'), leaderboardId: zid('leaderboards') },
  async handler(ctx, { userId, leaderboardId }) {
    const globalLeaderboard = await ctx.db
      .query('leaderboards')
      .withIndex('by_type', (q) => q.eq('type', leaderboardType.enum.global))
      .unique();
    if (!globalLeaderboard) {
      throw new ConvexError({ message: 'Global leaderboard not found', code: 500 });
    }
    const existingLeaderboardEntriesQuery = ctx.db
      .query('leaderboardEntries')
      .withIndex('by_leaderboard_user', (q) => q.eq('leaderboardId', globalLeaderboard._id).eq('userId', userId));

    let copiedScore = 0;

    for await (const entry of existingLeaderboardEntriesQuery) {
      await ctx.db.insert('leaderboardEntries', {
        leaderboardId: leaderboardId,
        userId,
        puzzleId: entry.puzzleId,
        score: entry.score,
        recordedAt: entry.recordedAt,
      });
      copiedScore += entry.score;
    }

    const membership = await getMembership(ctx, leaderboardId, userId);
    if (membership && copiedScore > 0) {
      await addScoreToMembership(ctx, membership._id, copiedScore);
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
        type: leaderboardType.enum.private,
        creatorId: normalizedUserId,
        users: [normalizedUserId],
        inviteCode,
      });
      await ctx.db.insert('leaderboardMembers', {
        leaderboardId: createdLeaderboardId,
        userId: normalizedUserId,
        totalScore: 0,
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

    if (await getMembership(ctx, leaderboard._id, normalizedUserId)) {
      throw new ConvexError({ message: 'Already joined this leaderboard.', code: 400 });
    }

    await ctx.db.insert('leaderboardMembers', {
      leaderboardId: leaderboard._id,
      userId: normalizedUserId,
      totalScore: 0,
    });
    // `users` is kept in sync only until the `backfillLeaderboardMembers` migration has run everywhere.
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

    if (leaderboard.type === leaderboardType.enum.global) {
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

    await deleteLeaderboardMemberships(ctx, normalizedLeaderboardId);

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

    const membership = await getMembership(ctx, normalizedLeaderboardId, normalizedUserId);
    if (membership) {
      await ctx.db.delete(membership._id);
    }

    return await ctx.db.patch(normalizedLeaderboardId, {
      users: leaderboard.users ? leaderboard.users.filter((id) => id !== normalizedUserId) : leaderboard.users,
    });
  },
});
