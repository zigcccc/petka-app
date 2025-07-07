import { defineTable } from 'convex/server';
import { zid, zodToConvex } from 'convex-helpers/server/zod';
import { z } from 'zod';

import { getBaseDbModel } from '../shared/models';
import { userModel } from '../users/models';

export const leaderboardRange = z.enum(['weekly', 'alltime']);
export type LeaderboardRange = z.infer<typeof leaderboardRange>;

export const leaderboardType = z.enum(['global', 'private']);
export type LeaderboardType = z.infer<typeof leaderboardType>;

export const leaderboardModel = getBaseDbModel('leaderboards').extend({
  type: leaderboardType,
  name: z.string().nullable(),
  inviteCode: z.string().nullable(),
  users: z.array(zid('users')).nullable(),
  creatorId: zid('users').optional(),
});
export type Leaderboard = z.infer<typeof leaderboardModel>;

export const createLeaderboardModel = leaderboardModel.pick({ name: true });
export type CreateLeaderboard = z.infer<typeof createLeaderboardModel>;

export const updateLeaderboardModel = leaderboardModel.partial();
export type UpdateLeaderboard = z.infer<typeof updateLeaderboardModel>;

export const leaderboardScoreWithUserModel = z.object({
  user: userModel,
  score: z.number(),
  position: z.number(),
  isForCurrentUser: z.boolean(),
});
export type LeaderboardScoreWithUser = z.infer<typeof leaderboardScoreWithUserModel>;

export const leaderboardWithScoresModel = leaderboardModel.extend({
  scores: z.array(leaderboardScoreWithUserModel),
});
export type LeaderboardWithScores = z.infer<typeof leaderboardWithScoresModel>;

export const leaderboardWithUserScoresModel = leaderboardModel.extend({
  scoresWithUsers: z.array(leaderboardScoreWithUserModel),
});
export type LeaderboardWithUserScores = z.infer<typeof leaderboardWithUserScoresModel>;

export const leaderboardsTable = defineTable(zodToConvex(leaderboardModel));
