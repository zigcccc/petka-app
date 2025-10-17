import { ConvexError } from 'convex/values';
import { zid } from 'convex-helpers/server/zod';
import { z } from 'zod';

import { pickRandomWord } from '@/utils/words';

import { isAttemptCorrect } from '../puzzleGuessAttempts/helpers';
import { checkedLetterStatus } from '../puzzleGuessAttempts/models';
import { paginationOptsValidator } from '../shared/models';
import { mutation, query } from '../shared/queries';

import { puzzleType } from './models';

export const read = query({
  args: { id: z.string() },
  async handler(ctx, { id }) {
    const puzzleId = ctx.db.normalizeId('puzzles', id);

    if (!puzzleId) {
      throw new ConvexError({ message: 'Invalid puzzle id provided.', code: 400 });
    }

    const puzzle = await ctx.db.get(puzzleId);

    return puzzle;
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
      type === puzzleType.Enum.daily
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
      page: puzzles.page.map((puzzle) => ({ ...puzzle, attempts: attemptsByPuzzleId.get(puzzle._id) })),
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
      .withIndex('by_type_creator', (q) => q.eq('type', puzzleType.Enum.training).eq('creatorId', normalizedUserId))
      .order('desc')
      .first();

    return userTrainingPuzzle;
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
          .eq('type', puzzleType.Enum.daily)
          .eq('year', date.getFullYear())
          .eq('month', date.getMonth() + 1)
          .eq('day', date.getDate())
      )
      .first();

    return dailyPuzzle;
  },
});

export const readUserPuzzlesStatistics = query({
  args: { userId: z.string(), type: puzzleType },
  async handler(ctx, { userId, type }) {
    const normalizedUserId = ctx.db.normalizeId('users', userId);

    if (!normalizedUserId) {
      throw new ConvexError({ message: 'Invalid user id provided.', code: 400 });
    }

    const basePuzzlesQuery =
      type === puzzleType.Enum.daily
        ? ctx.db.query('puzzles').withIndex('by_type', (q) => q.eq('type', type))
        : ctx.db.query('puzzles').withIndex('by_type_creator', (q) => q.eq('type', type).eq('creatorId', userId));

    const allPuzzles = await basePuzzlesQuery.order('desc').collect();
    const allPuzzlesAttempts = await Promise.all(
      allPuzzles.map((puzzle) =>
        ctx.db
          .query('puzzleGuessAttempts')
          .withIndex('by_user_puzzle', (q) => q.eq('userId', normalizedUserId).eq('puzzleId', puzzle._id))
          .order('asc')
          .collect()
      )
    );
    const startedPuzzleAttempts = allPuzzlesAttempts.filter((attempts) => attempts.length > 0);
    const failedPuzzlesAttempts = allPuzzlesAttempts.filter(
      (attempts) => attempts.length === 6 && !isAttemptCorrect(attempts.at(-1))
    );
    const numOfSolvedPuzzles = startedPuzzleAttempts.length - (failedPuzzlesAttempts?.length ?? 0);
    const solvedPercentage = Math.floor((numOfSolvedPuzzles / startedPuzzleAttempts.length) * 100);

    const attemptsDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    };

    let currentStreak = 0;
    const streaks = [];

    for (const attempts of allPuzzlesAttempts) {
      const numOfAttempts = attempts.length;
      const lastAttempt = attempts.at(-1);
      const isLastAttemptCorrect = lastAttempt?.checkedLetters.every(
        (checkedLetter) => checkedLetter.status === checkedLetterStatus.Enum.correct
      );

      if (isLastAttemptCorrect) {
        currentStreak = currentStreak + 1;
      } else {
        streaks.push(currentStreak);
        currentStreak = 0;
      }

      if (numOfAttempts > 0 && isLastAttemptCorrect) {
        attemptsDistribution[numOfAttempts] = (attemptsDistribution[numOfAttempts] ?? 0) + 1;
      }
    }

    streaks.push(currentStreak);

    return {
      attemptsDistribution,
      numberOfAllPuzzles: startedPuzzleAttempts.length,
      numberOfSolvedPuzzles: numOfSolvedPuzzles,
      solvedPercentage,
      streak: streaks[0],
      maxStreak: Math.max(...streaks),
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
      type: puzzleType.Enum.training,
      creatorId: userId,
      solution: word,
      solvedBy: [],
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

    await ctx.db.patch(normalizedPuzzleId, { solvedBy: [...puzzle.solvedBy, userId] });

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

    if (puzzle.type === puzzleType.Enum.daily) {
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
      const puzzleScore = 7 - puzzleAttempts.length;

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
