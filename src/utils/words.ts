import { type CheckedLetter, checkedLetterStatus } from '@/convex/puzzleGuessAttempts/models';

type WordEntry = {
  word: string;
  frequency: number;
  numOfTimesUsed: number;
};

export function pickRandomWord(words: WordEntry[], decayFactor = 1.75) {
  if (words.length === 0) throw new Error('No words to choose from');

  const weights = words.map((w) => {
    return w.frequency / Math.pow(1 + w.numOfTimesUsed, decayFactor);
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let rand = Math.random() * totalWeight;

  for (let i = 0; i < words.length; i++) {
    rand -= weights[i];
    if (rand <= 0) {
      return words[i].word;
    }
  }

  return words[words.length - 1].word;
}

// export function checkWordleAttempt(attempt: string, solution: string) {
//   const correctCharacters: string[] = [];
//   const misplacedCharacters: string[] = [];
//   const invalidCharacters: string[] = [];

//   const matchedSolutionFlags = Array(solution.length).fill(false);
//   const matchedAttemptFlags = Array(attempt.length).fill(false);

//   // Step 1: Find correct characters
//   for (let i = 0; i < attempt.length; i++) {
//     if (attempt[i] === solution[i]) {
//       correctCharacters.push(attempt[i]);
//       matchedSolutionFlags[i] = true;
//       matchedAttemptFlags[i] = true;
//     }
//   }

//   // Step 2: Find misplaced characters
//   for (let i = 0; i < attempt.length; i++) {
//     if (matchedAttemptFlags[i]) continue;

//     for (let j = 0; j < solution.length; j++) {
//       if (!matchedSolutionFlags[j] && attempt[i] === solution[j]) {
//         misplacedCharacters.push(attempt[i]);
//         matchedSolutionFlags[j] = true;
//         matchedAttemptFlags[i] = true;
//         break;
//       }
//     }
//   }

//   // Step 3: The rest are invalid
//   for (let i = 0; i < attempt.length; i++) {
//     if (!matchedAttemptFlags[i]) {
//       invalidCharacters.push(attempt[i]);
//     }
//   }

//   return { correctCharacters, misplacedCharacters, invalidCharacters };
// }

export function checkWordleAttempt(attempt: string, solution: string) {
  const result: CheckedLetter[] = [];
  const solutionLetters = solution.split('');
  const attemptLetters = attempt.split('');

  const usedIndices = new Array(solution.length).fill(false);

  for (let i = 0; i < attemptLetters.length; i++) {
    if (attemptLetters[i] === solutionLetters[i]) {
      result.push({ letter: attemptLetters[i], index: i, status: checkedLetterStatus.Enum.correct });
      usedIndices[i] = true;
    } else {
      result.push({ letter: attemptLetters[i], index: i, status: checkedLetterStatus.Enum.invalid });
    }
  }

  for (let i = 0; i < attemptLetters.length; i++) {
    const res = result[i];
    if (res.status !== checkedLetterStatus.Enum.invalid) continue;

    const matchIndex = solutionLetters.findIndex((l, j) => l === res.letter && !usedIndices[j]);

    if (matchIndex !== -1) {
      result[i].status = checkedLetterStatus.Enum.misplaced;
      usedIndices[matchIndex] = true;
    }
  }

  return result;
}
