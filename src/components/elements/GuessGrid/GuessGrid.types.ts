import { type CheckedLetter, type PuzzleGuessAttempt } from '@/convex/puzzleGuessAttempts/models';

export type GuessGridProps = {
  attempts?: PuzzleGuessAttempt[];
  grid: (string | null)[][];
  isValidating?: boolean;
};

export type GuessGridCellProps = {
  testID?: string;
  value: string | null;
  idx: number;
  checkedLetters?: CheckedLetter[];
  cellWidth?: number;
};
