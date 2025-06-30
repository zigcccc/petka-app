import { defineTable } from 'convex/server';
import { zodToConvex } from 'convex-helpers/server/zod';
import { z } from 'zod';

import { baseDbModel } from '../shared/models';

export const leaderboardEntryModel = baseDbModel.extend({
  leaderboardId: z.string(),
  userId: z.string(),
  puzzleId: z.string(),
  score: z.number(),
});
export type LeaderboardEntry = z.infer<typeof leaderboardEntryModel>;

export const leaderboardEntriesTable = defineTable(zodToConvex(leaderboardEntryModel));
