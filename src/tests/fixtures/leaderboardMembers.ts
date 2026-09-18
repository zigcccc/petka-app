import type { Id } from '@/convex/_generated/dataModel';
import type { LeaderboardMember } from '@/convex/leaderboardMembers/model';

import { testPrivateLeaderboard1 } from './leaderboards';
import { testUser1, testUser2 } from './users';

export const testLeaderboardMember1: LeaderboardMember = {
  _id: 'testLeaderboardMember1' as Id<'leaderboardMembers'>,
  _creationTime: 1751879215893,
  leaderboardId: testPrivateLeaderboard1._id,
  userId: testUser1._id,
  totalScore: 7,
};

export const testLeaderboardMember2: LeaderboardMember = {
  _id: 'testLeaderboardMember2' as Id<'leaderboardMembers'>,
  _creationTime: 1751879215893,
  leaderboardId: testPrivateLeaderboard1._id,
  userId: testUser2._id,
  totalScore: 3,
};
