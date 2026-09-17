import { ConvexError } from 'convex/values';
import { zid } from 'convex-helpers/server/zod4';
import { z } from 'zod';

import { pickRandomWord } from '@/utils/words';

import { isAttemptCorrect } from '../puzzleGuessAttempts/helpers';
import { paginationOptsValidator } from '../shared/models';
import { mutation, query } from '../shared/queries';
import { puzzleListItemModel, puzzlePublicModel, puzzleType } from './models';

export const read = query({
  args: { id: z.string() },
  async handler(ctx, { id }) {
    const puzzleId = ctx.db.normalizeId('puzzles', id);

    if (!puzzleId) {
      throw new ConvexError({ message: 'Invalid puzzle id provided.', code: 400 });
    }

    const puzzle = await ctx.db.get(puzzleId);

    if (!puzzle) return null;
    return puzzlePublicModel.parse(puzzle);
  },
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator, type: puzzleType, userId: z.string(), timestamp: z.number() },
  handler: async (ctx, { paginationOpts, type, userId, timestamp }) => {
    const normalizedUserId = ctx.db.normalizeId('users', userId);

    if (!normalizedUserId) {
      throw new ConvexError({ message: 'Invalid user id provided', code: 400 });
    }

    const currentDate = new Date(timestamp);
    currentDate.setHours(14, 0, 0, 0);
    currentDate.setDate(currentDate.getDate() - 1);

    const baseQuery = ctx.db.query('puzzles');
    const indexedQuery =
      type === puzzleType.enum.daily
        ? baseQuery.withIndex('by_type', (q) => q.eq('type', type).lte('_creationTime', currentDate.getTime()))
        : baseQuery.withIndex('by_type_creator', (q) => q.eq('type', type).eq('creatorId', normalizedUserId));

    const puzzles = await indexedQuery.order('desc').paginate(paginationOpts);

    const puzzleAttempts = await Promise.all(
      puzzles.page.map((puzzle) =>
        ctx.db
          .query('puzzleGuessAttempts')
          .withIndex('by_user_puzzle', (q) => q.eq('userId', normalizedUserId).eq('puzzleId', puzzle._id))
          .collect()
      )
    );

    const attemptsByPuzzleId = new Map(puzzleAttempts.map((attempt) => [attempt[0]?.puzzleId, attempt]));

    return {
      ...puzzles,
      page: puzzles.page.map((puzzle) => {
        const attempts = attemptsByPuzzleId.get(puzzle._id);
        return puzzleListItemModel.parse({
          ...puzzle,
          isSolvedByUser: isAttemptCorrect(attempts?.at(-1)),
          attempts,
        });
      }),
    };
  },
});

export const readUserActiveTrainingPuzzle = query({
  args: { userId: zid('users') },
  async handler(ctx, { userId }) {
    const normalizedUserId = ctx.db.normalizeId('users', userId);

    if (!normalizedUserId) {
      throw new ConvexError({ message: 'Invalid user id provided.', code: 400 });
    }

    const userTrainingPuzzle = await ctx.db
      .query('puzzles')
      .withIndex('by_type_creator', (q) => q.eq('type', puzzleType.enum.training).eq('creatorId', normalizedUserId))
      .order('desc')
      .first();

    if (!userTrainingPuzzle) return null;

    return puzzlePublicModel.parse(userTrainingPuzzle);
  },
});

export const readActiveDailyPuzzle = query({
  args: { timestamp: z.number() },
  async handler(ctx, { timestamp }) {
    const date = new Date(timestamp);
    const dailyPuzzle = await ctx.db
      .query('puzzles')
      .withIndex('by_type_year_month_day', (q) =>
        q
          .eq('type', puzzleType.enum.daily)
          .eq('year', date.getFullYear())
          .eq('month', date.getMonth() + 1)
          .eq('day', date.getDate())
      )
      .first();

    if (!dailyPuzzle) return null;

    return puzzlePublicModel.parse(dailyPuzzle);
  },
});

/**
 * @deprecated Replaced by `userPuzzleStatistics.queries.readUserPuzzleStatistics` in 1.13.0. Kept for older
 * clients, but served from the aggregated `userPuzzleStatistics` table instead of scanning every puzzle + attempt.
 */
export const readUserPuzzlesStatistics = query({
  args: { userId: z.string(), type: puzzleType },
  async handler(ctx, { userId, type }) {
    const normalizedUserId = ctx.db.normalizeId('users', userId);

    if (!normalizedUserId) {
      throw new ConvexError({ message: 'Invalid user id provided.', code: 400 });
    }

    const statistics = await ctx.db
      .query('userPuzzleStatistics')
      .withIndex('by_user_puzzle_type', (q) => q.eq('userId', normalizedUserId).eq('puzzleType', type))
      .first();

    if (!statistics) {
      return {
        attemptsDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
        numberOfAllPuzzles: 0,
        numberOfSolvedPuzzles: 0,
        solvedPercentage: 0,
        streak: 0,
        maxStreak: 0,
      };
    }

    const { distribution, totalPlayed, totalWon, currentStreak, maxStreak } = statistics;

    return {
      attemptsDistribution: {
        1: distribution._1,
        2: distribution._2,
        3: distribution._3,
        4: distribution._4,
        5: distribution._5,
        6: distribution._6,
      },
      numberOfAllPuzzles: totalPlayed,
      numberOfSolvedPuzzles: totalWon,
      solvedPercentage: totalPlayed > 0 ? Math.floor((totalWon / totalPlayed) * 100) : 0,
      streak: currentStreak,
      maxStreak,
    };
  },
});

export const createTrainingPuzzle = mutation({
  args: { userId: z.string() },
  async handler(ctx, { userId }) {
    const normalizedUssrId = ctx.db.normalizeId('users', userId);

    if (!normalizedUssrId) {
      throw new ConvexError({ message: 'Invalid user id provided.', code: 400 });
    }

    const today = new Date();
    const words = await ctx.db.query('dictionaryEntries').take(200);
    const word = pickRandomWord(words);

    const puzzleId = await ctx.db.insert('puzzles', {
      type: puzzleType.enum.training,
      creatorId: userId,
      solution: word,
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    });

    return puzzleId;
  },
});

export const markAsSolved = mutation({
  args: { puzzleId: z.string(), userId: z.string() },
  async handler(ctx, { userId, puzzleId }) {
    const normalizedUserId = ctx.db.normalizeId('users', userId);
    const normalizedPuzzleId = ctx.db.normalizeId('puzzles', puzzleId);

    if (!normalizedUserId || !normalizedPuzzleId) {
      throw new ConvexError({ message: 'Invalid puzzle or user id provided.', code: 400 });
    }

    const puzzle = await ctx.db.get(normalizedPuzzleId);

    if (!puzzle) {
      throw new ConvexError({ message: `Puzzle for id ${puzzleId} not found.`, code: 404 });
    }

    let userPuzzleStatistics = await ctx.db
      .query('userPuzzleStatistics')
      .withIndex('by_user_puzzle_type', (q) => q.eq('userId', normalizedUserId).eq('puzzleType', puzzle.type))
      .first();

    if (!userPuzzleStatistics) {
      const userPuzzleStatisticsId = await ctx.db.insert('userPuzzleStatistics', {
        userId: normalizedUserId,
        currentStreak: 0,
        maxStreak: 0,
        distribution: { _1: 0, _2: 0, _3: 0, _4: 0, _5: 0, _6: 0 },
        puzzleType: puzzle.type,
        totalFailed: 0,
        totalPlayed: 0,
        totalWon: 0,
      });
      userPuzzleStatistics = await ctx.db.get(userPuzzleStatisticsId);
    }

    const puzzleAttempts = await ctx.db
      .query('puzzleGuessAttempts')
      .withIndex('by_user_puzzle', (q) => q.eq('userId', normalizedUserId).eq('puzzleId', normalizedPuzzleId))
      .collect();
    const isFailed = !isAttemptCorrect(puzzleAttempts.at(-1));

    if (userPuzzleStatistics) {
      const newCurrentStreak = userPuzzleStatistics.currentStreak + 1;
      const distributionScoreKey = `_${puzzleAttempts.length}` as '_1' | '_2' | '_3' | '_4' | '_5' | '_6';

      await ctx.db.patch(userPuzzleStatistics._id, {
        currentStreak: isFailed ? 0 : newCurrentStreak,
        maxStreak: isFailed
          ? userPuzzleStatistics.maxStreak
          : newCurrentStreak > userPuzzleStatistics.maxStreak
            ? newCurrentStreak
            : userPuzzleStatistics.maxStreak,
        distribution: isFailed
          ? userPuzzleStatistics.distribution
          : {
              ...userPuzzleStatistics.distribution,
              [distributionScoreKey]: userPuzzleStatistics.distribution[distributionScoreKey] + 1,
            },
        puzzleType: puzzle.type,
        totalFailed: isFailed ? userPuzzleStatistics.totalFailed + 1 : userPuzzleStatistics.totalFailed,
        totalPlayed: userPuzzleStatistics.totalPlayed + 1,
        totalWon: isFailed ? userPuzzleStatistics.totalWon : userPuzzleStatistics.totalWon + 1,
      });
    }

    if (puzzle.type === puzzleType.enum.daily) {
      // The global leaderboard is no longer displayed, but its entries double as the "finished today's puzzle"
      // record used by `sendReminderForDailyChallenge` (via `by_leaderboard_puzzle`), so keep writing them.
      const globalLeaderboard = await ctx.db
        .query('leaderboards')
        .withIndex('by_type', (q) => q.eq('type', 'global'))
        .unique();
      const privateLeaderboards = await ctx.db
        .query('leaderboards')
        .withIndex('by_type', (q) => q.eq('type', 'private'))
        .collect();
      const userLeaderboards = privateLeaderboards.filter((leaderboard) =>
        leaderboard.users?.includes(normalizedUserId)
      );
      const leaderboardsToUpdate = globalLeaderboard ? [globalLeaderboard, ...userLeaderboards] : userLeaderboards;
      const puzzleScore = isFailed ? 0 : 7 - puzzleAttempts.length;

      for (const leaderboard of leaderboardsToUpdate) {
        await ctx.db.insert('leaderboardEntries', {
          leaderboardId: leaderboard._id,
          userId: normalizedUserId,
          puzzleId: normalizedPuzzleId,
          score: puzzleScore,
          recordedAt: Date.now(),
        });
      }
    }
  },
});
