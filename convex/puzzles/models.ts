import { defineTable } from 'convex/server';
import { zodToConvex } from 'convex-helpers/server/zod';
import { z } from 'zod';

import { baseDbModel } from '../shared/models';

export const puzzleType = z.enum(['daily', 'training']);
export type PuzzleType = z.infer<typeof puzzleType>;

export const puzzleModel = baseDbModel.extend({
  type: puzzleType.default('daily'),
  solution: z.string().min(5).max(5),
  creatorId: z.string().nullable(),
  solvedBy: z.array(z.string()),
});
export type Puzzle = z.infer<typeof puzzleModel>;

export const puzzlesTable = defineTable(zodToConvex(puzzleModel));
