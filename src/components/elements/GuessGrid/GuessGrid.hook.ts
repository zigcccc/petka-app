import { useConvex } from 'convex/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { api } from '@/convex/_generated/api';
import { checkedLetterStatus, type CheckedLetter, type PuzzleGuessAttempt } from '@/convex/puzzleGuessAttempts/models';
import { useToaster } from '@/hooks/useToaster';
import { deepClone } from '@/utils/clone';

import { type KeyboardKey } from '../Keyboard';

import { findCurrentGridRowIdx, getUpdatedGrid } from './GuessGrid.helpers';

const initialGuesses = new Array(6).fill(new Array(5).fill(null));

type Options = {
  attempts?: PuzzleGuessAttempt[];
  onSubmitAttempt: (attempt: string) => Promise<void>;
};

export function useGuessGrid({ attempts, onSubmitAttempt }: Options) {
  const toaster = useToaster();
  const convex = useConvex();
  const [guesses, setGuesses] = useState<(string | null)[][]>(initialGuesses);
  const [isValidating, setIsValidating] = useState(false);

  const allCheckedLetters = useMemo(() => {
    const lettersMap = new Map<CheckedLetter['letter'], CheckedLetter>();

    if (!attempts) {
      return [];
    }

    for (const attempt of attempts) {
      for (const letter of attempt.checkedLetters) {
        const existingLetter = lettersMap.get(letter.letter);

        if (!existingLetter) {
          lettersMap.set(letter.letter, letter);
          continue;
        }

        const isExistingLetterCorrect = existingLetter.status === checkedLetterStatus.Enum.correct;
        const isExistingLetterMisplaced = existingLetter.status === checkedLetterStatus.Enum.misplaced;

        if (isExistingLetterCorrect) {
          continue;
        }

        if (isExistingLetterMisplaced && letter.status === checkedLetterStatus.Enum.invalid) {
          continue;
        }

        lettersMap.set(letter.letter, letter);
      }
    }

    return Array.from(lettersMap.values());
  }, [attempts]);

  const handleReset = useCallback(() => {
    setGuesses(initialGuesses);
  }, []);

  const checkGuessLength = useCallback(
    (guess: (string | null)[]) => {
      const filteredGuess = guess.filter(Boolean);

      if (filteredGuess.length !== 5) {
        toaster.toast('Vnesite vseh pet znakov', { intent: 'error' });
        return;
      }

      onSubmitAttempt(filteredGuess.join());
    },
    [toaster, onSubmitAttempt]
  );

  const handleInput = useCallback(
    async (key: KeyboardKey) => {
      // Do not update anything if currently validating
      if (isValidating) {
        return;
      }

      const rowIdx = findCurrentGridRowIdx(guesses);
      const updatedGuesses = getUpdatedGrid(guesses, rowIdx, key, checkGuessLength);
      setGuesses(updatedGuesses);

      const currentGuess = updatedGuesses[rowIdx].filter(Boolean);

      if (currentGuess.length === 5) {
        setIsValidating(true);
        try {
          const term = await convex.query(api.dictionary.queries.read, { term: currentGuess.join('') });
          if (!term) {
            toaster.toast('Uporabite besedo is SSKJ', { intent: 'error' });
            setGuesses(getUpdatedGrid(updatedGuesses, rowIdx, '{Backspace}'));
          } else {
            // Logic to check if the word is the correct word
            await onSubmitAttempt(term.word);
          }
        } catch {
          toaster.toast('Prišlo je do napake', { intent: 'error' });
          setGuesses(getUpdatedGrid(updatedGuesses, rowIdx, '{Backspace}'));
        } finally {
          setIsValidating(false);
        }
      }
    },
    [checkGuessLength, convex, guesses, isValidating, onSubmitAttempt, toaster]
  );

  useEffect(() => {
    if (!attempts) {
      setGuesses(initialGuesses);
      return;
    }

    setGuesses((currentGuesses) => {
      const copy = deepClone(currentGuesses);
      attempts.forEach((attempt, idx) => {
        copy[idx] = attempt.attempt.split('');
      });
      return copy;
    });
  }, [attempts]);

  return useMemo(
    () => ({
      grid: guesses,
      isValidating,
      onInput: handleInput,
      onReset: handleReset,
      allCheckedLetters,
    }),
    [allCheckedLetters, guesses, handleInput, handleReset, isValidating]
  );
}
