import { type Id } from '@/convex/_generated/dataModel';
import { puzzleType } from '@/convex/puzzles/models';
import { type UserPuzzleStatistics } from '@/convex/userPuzzleStatistics/models';

import { testUser1 } from './users';

export const testPuzzleStatistics1: UserPuzzleStatistics = {
  _id: 'testPuzzleStatistics1' as Id<'userPuzzleStatistics'>,
  _creationTime: 1751414400000, // 2025-07-02
  distribution: {
    _1: 0,
    _2: 2,
    _3: 1,
    _4: 2,
    _5: 0,
    _6: 0,
  },
  totalPlayed: 5,
  totalWon: 4,
  totalFailed: 1,
  currentStreak: 2,
  maxStreak: 3,
  puzzleType: puzzleType.Enum.daily,
  userId: testUser1._id,
};
