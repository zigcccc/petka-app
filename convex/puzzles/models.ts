import { defineTable } from 'convex/server';
import { zodToConvex } from 'convex-helpers/server/zod4';
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

// Client-safe puzzle shape — solvedBy stripped
export const puzzlePublicModel = puzzleModel.omit({ solvedBy: true });
export type PuzzlePublic = z.infer<typeof puzzlePublicModel>;

// Shape returned by the list query — includes solved status + attempts
export const puzzleListItemModel = z.object({
  ...puzzlePublicModel.shape,
  isSolvedByUser: z.boolean(),
  attempts: z.array(puzzleGuessAttemptModel).optional(),
});
export type PuzzleListItem = z.infer<typeof puzzleListItemModel>;

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
