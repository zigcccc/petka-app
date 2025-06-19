import { defineTable } from 'convex/server';
import { zodToConvex } from 'convex-helpers/server/zod';
import { z } from 'zod';

import { baseDbModel } from '@/convex/shared/models';

export const puzzleType = z.enum(['daily', 'training']);

export const puzzleModel = baseDbModel.extend({
  type: puzzleType.default('daily'),
  solution: z.string().min(5).max(5),
});
export type Puzzle = z.infer<typeof puzzleModel>;

export const puzzlesTable = defineTable(zodToConvex(puzzleModel));
