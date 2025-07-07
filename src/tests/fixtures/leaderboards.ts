import { type Id } from '@/convex/_generated/dataModel';
import { leaderboardType, type LeaderboardWithScores } from '@/convex/leaderboards/models';

import { testUser1, testUser2 } from './users';

export const testGlobalLeaderboard1: LeaderboardWithScores = {
  _id: 'testGlobalLeaderboard1' as Id<'leaderboards'>,
  _creationTime: 1751879215893,
  inviteCode: null,
  name: 'Globalna lestvica',
  type: leaderboardType.Enum.global,
  users: [testUser1._id],
  creatorId: undefined,
  scores: [{ isForCurrentUser: true, position: 1, score: 7, user: testUser1 }],
};

export const testPrivateLeaderboard1: LeaderboardWithScores = {
  _id: 'testPrivateLeaderboard1' as Id<'leaderboards'>,
  _creationTime: 1751879215893,
  inviteCode: null,
  name: 'Moja lestvica',
  type: leaderboardType.Enum.private,
  users: [testUser1._id],
  creatorId: testUser1._id,
  scores: [
    { isForCurrentUser: true, position: 1, score: 7, user: testUser1 },
    { isForCurrentUser: false, position: 2, score: 3, user: testUser2 },
  ],
};
