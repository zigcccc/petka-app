import { defineTable } from 'convex/server';
import { zid, zodToConvex } from 'convex-helpers/server/zod';
import { z } from 'zod';

import { puzzleType } from '../puzzles/models';
import { getBaseDbModel } from '../shared/models';

export const userPuzzleStatisticsModel = getBaseDbModel('userPuzzleStatistics').extend({
  userId: zid('users'),
  puzzleType: puzzleType,
  totalPlayed: z.number(),
  totalWon: z.number(),
  totalFailed: z.number(),
  currentStreak: z.number(),
  maxStreak: z.number(),
  distribution: z.object({
    _1: z.number(),
    _2: z.number(),
    _3: z.number(),
    _4: z.number(),
    _5: z.number(),
    _6: z.number(),
  }),
});
export type UserPuzzleStatistics = z.infer<typeof userPuzzleStatisticsModel>;

export const userPuzzleStatisticsTable = defineTable(zodToConvex(userPuzzleStatisticsModel));
