import { defineTable } from 'convex/server';
import { zodToConvex } from 'convex-helpers/server/zod';
import { z } from 'zod';

import { puzzleGuessAttemptModel } from '../puzzleGuessAttempts/models';
import { getBaseDbModel } from '../shared/models';

export const puzzleType = z.enum(['daily', 'training']);
export type PuzzleType = z.infer<typeof puzzleType>;

export const puzzleModel = getBaseDbModel('puzzles').extend({
  type: puzzleType,
  solution: z.string().min(5).max(5),
  creatorId: z.string().nullable(),
  solvedBy: z.array(z.string()),
  year: z.number(),
  month: z.number(),
  day: z.number(),
});
export type Puzzle = z.infer<typeof puzzleModel>;

export const puzzleWithAttemptsModel = puzzleModel.extend({
  attempts: z.array(puzzleGuessAttemptModel).optional(),
});
export type PuzzleWithAttempts = z.infer<typeof puzzleWithAttemptsModel>;

export const puzzleStatisticsModel = z.object({
  attemptsDistribution: z.record(z.string(), z.number()),
  numberOfAllPuzzles: z.number(),
  numberOfSolvedPuzzles: z.number(),
  solvedPercentage: z.number(),
  streak: z.number(),
  maxStreak: z.number(),
});
export type PuzzleStatistics = z.infer<typeof puzzleStatisticsModel>;

export const puzzlesTable = defineTable(zodToConvex(puzzleModel));
