import { checkedLetterStatus } from '@/convex/puzzleGuessAttempts/models';

export const checkedStatusToEmojiMap = new Map([
  [checkedLetterStatus.enum.invalid, '⬛️'],
  [checkedLetterStatus.enum.misplaced, '🟨'],
  [checkedLetterStatus.enum.correct, '🟩'],
]);
