import { ConvexError } from 'convex/values';
import { z } from 'zod';

import { pickRandomWord } from '@/utils/words';

import { checkedLetterStatus } from '../puzzleGuessAttempts/models';
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

export const readUserActiveTrainingPuzzle = query({
  args: { userId: z.string() },
  async handler(ctx, { userId }) {
    const normalizedUserId = ctx.db.normalizeId('users', userId);

    if (!normalizedUserId) {
      throw new ConvexError({ message: 'Invalid user id provided.', code: 400 });
    }

    const userTrainingPuzzlesQuery = ctx.db
      .query('puzzles')
      .withIndex('by_type_creator', (q) => q.eq('creatorId', normalizedUserId).eq('type', puzzleType.Enum.training));

    for await (const puzzle of userTrainingPuzzlesQuery) {
      if (!puzzle.solvedBy.includes(userId)) {
        return puzzle;
      }
    }

    return null;
  },
});

export const readUserPuzzlesStatistics = query({
  args: { userId: z.string(), type: puzzleType },
  async handler(ctx, { userId, type }) {
    const normalizedUserId = ctx.db.normalizeId('users', userId);

    if (!normalizedUserId) {
      throw new ConvexError({ message: 'Invalid user id provided.', code: 400 });
    }

    const allPuzzles = await ctx.db
      .query('puzzles')
      .withIndex('by_type_creator', (q) => q.eq('creatorId', userId).eq('type', type))
      .collect();

    const solvedPuzzles = allPuzzles.filter((puzzle) => puzzle.solvedBy.includes(userId));
    const solvedPercentage = Math.floor((solvedPuzzles.length / allPuzzles.length) * 100);
    const solvedPuzzlesAttempts = await Promise.all(
      solvedPuzzles.map((puzzle) =>
        ctx.db
          .query('puzzleGuessAttempts')
          .withIndex('by_user_puzzle', (q) => q.eq('userId', userId).eq('puzzleId', puzzle._id))
          .collect()
      )
    );

    const attemptsDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    };

    let streak = 0;

    for (const attempts of solvedPuzzlesAttempts) {
      const numOfAttempts = attempts.length;
      const lastAttempt = attempts.at(-1);

      if (
        lastAttempt?.checkedLetters.every((checkedLetter) => checkedLetter.status === checkedLetterStatus.Enum.correct)
      ) {
        streak = streak + 1;
      }

      attemptsDistribution[numOfAttempts] = (attemptsDistribution[numOfAttempts] ?? 0) + 1;
    }

    return {
      attemptsDistribution,
      numberOfAllPuzzles: allPuzzles.length,
      numberOfSolvedPuzzles: solvedPuzzles.length,
      solvedPercentage,
      streak,
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

    const words = await ctx.db.query('dictionaryEntries').collect();
    const word = pickRandomWord(words);

    const puzzleId = await ctx.db.insert('puzzles', {
      type: puzzleType.Enum.training,
      creatorId: userId,
      solution: word,
      solvedBy: [],
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
  },
});
