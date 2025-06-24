import { ConvexError } from 'convex/values';
import { z } from 'zod';

import { checkWordleAttempt } from '@/utils/words';

import { mutation, query } from '../shared/queries';

import { createPuzzleGuessAttemptModel } from './models';

export const create = mutation({
  args: { data: createPuzzleGuessAttemptModel },
  async handler(ctx, { data }) {
    const userId = ctx.db.normalizeId('users', data.userId);
    const puzzleId = ctx.db.normalizeId('puzzles', data.puzzleId);

    if (!userId || !puzzleId) {
      throw new ConvexError({ message: 'Invalid puzzle or user id provided.', code: 400 });
    }

    const existingAttempts = await ctx.db
      .query('puzzleGuessAttempts')
      .withIndex('by_user_puzzle', (q) => q.eq('userId', userId).eq('puzzleId', puzzleId))
      .collect();

    if (existingAttempts.length >= 6) {
      throw new ConvexError({ message: 'You already submitted max allowed attempts for this puzzle.', code: 400 });
    }

    const puzzle = await ctx.db.get(puzzleId);

    if (!puzzle) {
      throw new ConvexError({ message: `Puzzle with id ${puzzleId} does not exist.`, code: 404 });
    }

    const checkedLetters = checkWordleAttempt(data.attempt, puzzle.solution);

    const puzzleGuessAttemptId = await ctx.db.insert('puzzleGuessAttempts', {
      userId: data.userId,
      puzzleId: data.puzzleId,
      attempt: data.attempt,
      checkedLetters,
    });

    return puzzleGuessAttemptId;
  },
});

export const listPuzzleAttempts = query({
  args: { userId: z.string(), puzzleId: z.string() },
  async handler(ctx, { userId, puzzleId }) {
    const normalizedUserId = ctx.db.normalizeId('users', userId);
    const normalizedPuzzleId = ctx.db.normalizeId('puzzles', puzzleId);

    if (!normalizedUserId || !normalizedPuzzleId) {
      throw new ConvexError({ message: 'Invalid puzzle or user id provided.', code: 400 });
    }

    const attempts = await ctx.db
      .query('puzzleGuessAttempts')
      .withIndex('by_user_puzzle', (q) => q.eq('userId', normalizedUserId).eq('puzzleId', normalizedPuzzleId))
      .collect();

    return attempts;
  },
});
