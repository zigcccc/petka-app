import { type Id } from '@/convex/_generated/dataModel';
import { leaderboardType, type LeaderboardWithUserScores } from '@/convex/leaderboards/models';

import { testUser1, testUser2 } from './users';

export const testGlobalLeaderboard1: LeaderboardWithUserScores = {
  _id: 'testGlobalLeaderboard1' as Id<'leaderboards'>,
  _creationTime: 1751879215893,
  inviteCode: null,
  name: 'Globalna lestvica',
  type: leaderboardType.Enum.global,
  users: [testUser1._id],
  creatorId: undefined,
  scoresWithUsers: [{ isForCurrentUser: true, position: 1, score: 7, user: testUser1 }],
};

export const testPriverLeaderboard1: LeaderboardWithUserScores = {
  _id: 'testPrivateLeaderboard1' as Id<'leaderboards'>,
  _creationTime: 1751879215893,
  inviteCode: null,
  name: 'Moja lestvica',
  type: leaderboardType.Enum.global,
  users: [testUser1._id],
  creatorId: testUser1._id,
  scoresWithUsers: [
    { isForCurrentUser: true, position: 1, score: 7, user: testUser1 },
    { isForCurrentUser: false, position: 2, score: 3, user: testUser2 },
  ],
};
