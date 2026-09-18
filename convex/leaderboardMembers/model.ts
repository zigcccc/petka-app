import { defineTable } from 'convex/server';
import { zid, zodToConvex } from 'convex-helpers/server/zod4';
import { z } from 'zod';

import { getBaseDbModel } from '../shared/models';

// One row per (private leaderboard, member). `totalScore` is the running sum of the member's
// `leaderboardEntries` in that leaderboard, so the all-time ranking never has to collect entries.
export const leaderboardMemberModel = getBaseDbModel('leaderboardMembers').extend({
  leaderboardId: zid('leaderboards'),
  userId: zid('users'),
  totalScore: z.number(),
});
export type LeaderboardMember = z.infer<typeof leaderboardMemberModel>;

export const leaderboardMembersTable = defineTable(zodToConvex(leaderboardMemberModel));
