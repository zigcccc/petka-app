import { checkedLetterStatus, type PuzzleGuessAttempt } from './models';

export function isAttemptCorrect(attempt?: PuzzleGuessAttempt) {
  if (!attempt) {
    return false;
  }

  return attempt.checkedLetters.every((letter) => letter.status === checkedLetterStatus.Enum.correct);
}
