import { defineTable } from 'convex/server';
import { zid, zodToConvex } from 'convex-helpers/server/zod';
import { z } from 'zod';

import { getBaseDbModel } from '../shared/models';

export const leaderboardEntryModel = getBaseDbModel('leaderboardEntries').extend({
  leaderboardId: zid('leaderboards'),
  userId: zid('users'),
  puzzleId: zid('puzzles'),
  score: z.number(),
});
export type LeaderboardEntry = z.infer<typeof leaderboardEntryModel>;

export const leaderboardEntriesTable = defineTable(zodToConvex(leaderboardEntryModel));
