import { checkedLetterStatus } from '@/convex/puzzleGuessAttempts/models';

export const checkedStatusToEmojiMap = new Map([
  [checkedLetterStatus.Enum.invalid, '⬛️'],
  [checkedLetterStatus.Enum.misplaced, '🟨'],
  [checkedLetterStatus.Enum.correct, '🟩'],
]);
