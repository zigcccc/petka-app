import { checkedLetterStatus, type PuzzleGuessAttempt } from './models';

export function isAttemptCorrect(attempt?: Pick<PuzzleGuessAttempt, 'checkedLetters'>) {
  if (!attempt) {
    return false;
  }

  return attempt.checkedLetters.every((letter) => letter.status === checkedLetterStatus.Enum.correct);
}
