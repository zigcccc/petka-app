import { type Id } from '@/convex/_generated/dataModel';
import { checkedLetterStatus, type PuzzleGuessAttempt } from '@/convex/puzzleGuessAttempts/models';

import { testTrainingPuzzle1 } from './puzzles';
import { testUser1 } from './users';

export const testIncorrectPuzzleGuessAttempt1: PuzzleGuessAttempt = {
  _id: 'incorrectPuzzleGuessAttempt1' as Id<'puzzleGuessAttempts'>,
  _creationTime: Date.now(),
  attempt: 'spawn',
  checkedLetters: [
    { index: 0, letter: 's', status: checkedLetterStatus.Enum.correct },
    { index: 1, letter: 'p', status: checkedLetterStatus.Enum.invalid },
    { index: 2, letter: 'a', status: checkedLetterStatus.Enum.misplaced },
    { index: 3, letter: 'w', status: checkedLetterStatus.Enum.invalid },
    { index: 4, letter: 'n', status: checkedLetterStatus.Enum.invalid },
  ],
  puzzleId: testTrainingPuzzle1._id,
  userId: testUser1._id,
};

export const testCorrectPuzzleGuessAttempt1: PuzzleGuessAttempt = {
  _id: 'correctPuzzleGuessAttempt1' as Id<'puzzleGuessAttempts'>,
  _creationTime: Date.now(),
  attempt: 'steak',
  checkedLetters: [
    { index: 0, letter: 's', status: checkedLetterStatus.Enum.correct },
    { index: 1, letter: 't', status: checkedLetterStatus.Enum.correct },
    { index: 2, letter: 'e', status: checkedLetterStatus.Enum.correct },
    { index: 3, letter: 'a', status: checkedLetterStatus.Enum.correct },
    { index: 4, letter: 'k', status: checkedLetterStatus.Enum.correct },
  ],
  puzzleId: testTrainingPuzzle1._id,
  userId: testUser1._id,
};
