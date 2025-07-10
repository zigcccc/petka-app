import { type Id } from '@/convex/_generated/dataModel';
import { type Puzzle, puzzleType } from '@/convex/puzzles/models';

import { testUser1 } from './users';

export const testDailyPuzzle1: Puzzle = {
  _id: 'dailyPuzzle1' as Id<'puzzles'>,
  _creationTime: 1751414400000, // 2025-07-02
  creatorId: testUser1._id,
  day: 2,
  month: 7,
  year: 2025,
  solution: 'cloth',
  solvedBy: [],
  type: puzzleType.Enum.daily,
};

export const testTrainingPuzzle1: Puzzle = {
  _id: 'trainingPuzzle1' as Id<'puzzles'>,
  _creationTime: 1751587200000, // 2025-07-04
  creatorId: testUser1._id,
  day: 4,
  month: 7,
  year: 2025,
  solution: 'steak',
  solvedBy: [],
  type: puzzleType.Enum.training,
};
