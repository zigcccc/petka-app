import { useConvex } from 'convex/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { api } from '@/convex/_generated/api';
import { checkedLetterStatus, type CheckedLetter, type PuzzleGuessAttempt } from '@/convex/puzzleGuessAttempts/models';
import { useGameplaySettings } from '@/hooks/useGameplaySettings';
import { useToaster } from '@/hooks/useToaster';
import { deepClone } from '@/utils/clone';

import { type KeyboardKey } from '../Keyboard';

import { findCurrentGridRowIdx, getUpdatedGrid } from './GuessGrid.helpers';

const initialGuesses = new Array(6).fill(new Array(5).fill(null));

type Options = {
  attempts?: PuzzleGuessAttempt[];
  onSubmitAttempt: (attempt: string, attemptIdx: number) => Promise<void>;
};

export function useGuessGrid({ attempts, onSubmitAttempt }: Options) {
  const toaster = useToaster();
  const convex = useConvex();
  const [guesses, setGuesses] = useState<(string | null)[][]>(initialGuesses);
  const { autosubmitPuzzleAttempt } = useGameplaySettings();
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

  const handleSubmitPuzzleAttempt = useCallback(
    async (term: string, guesses: (string | null)[][], rowIdx: number) => {
      setIsValidating(true);
      try {
        const validatedTerm = await convex.query(api.dictionary.queries.read, { term });
        if (!validatedTerm) {
          toaster.toast('Uporabite besedo is SSKJ', { intent: 'error' });
          setGuesses(getUpdatedGrid(guesses, rowIdx, '{Backspace}'));
        } else {
          // Logic to check if the word is the correct word
          await onSubmitAttempt(validatedTerm.word, rowIdx);
        }
      } catch {
        toaster.toast('Prišlo je do napake', { intent: 'error' });
        setGuesses(getUpdatedGrid(guesses, rowIdx, '{Backspace}'));
      } finally {
        setIsValidating(false);
      }
    },
    [convex, onSubmitAttempt, toaster]
  );

  const checkGuessLength = useCallback(
    async (guess: (string | null)[], grid: (string | null)[][], rowIdx: number) => {
      const filteredGuess = guess.filter(Boolean);

      if (filteredGuess.length !== 5) {
        toaster.toast('Vnesite vseh pet znakov', { intent: 'error' });
        return;
      }

      await handleSubmitPuzzleAttempt(filteredGuess.join(''), grid, rowIdx);
    },
    [handleSubmitPuzzleAttempt, toaster]
  );

  const handleInput = useCallback(
    async (key: KeyboardKey) => {
      // Do not update anything if currently validating
      if (isValidating) {
        return;
      }

      const rowIdx = findCurrentGridRowIdx(guesses);
      const isLastRowFull = rowIdx === 0 ? false : guesses[rowIdx - 1].every((entry) => !!entry);
      const isLastRowSubmitted = rowIdx === 0 ? true : !!attempts?.[rowIdx - 1];

      let updatedGuesses: (string | null)[][];

      if (autosubmitPuzzleAttempt) {
        updatedGuesses = getUpdatedGrid(guesses, rowIdx, key, checkGuessLength);
      } else {
        if (!isLastRowFull || isLastRowSubmitted) {
          updatedGuesses = getUpdatedGrid(guesses, rowIdx, key, checkGuessLength);
        } else if (key === '{Backspace}' || key === '{Enter}') {
          updatedGuesses = getUpdatedGrid(guesses, rowIdx - 1, key, checkGuessLength);
        } else {
          updatedGuesses = guesses;
        }
      }

      setGuesses(updatedGuesses);

      if (autosubmitPuzzleAttempt) {
        const currentGuess = updatedGuesses[rowIdx].filter(Boolean);

        if (currentGuess.length === 5) {
          await handleSubmitPuzzleAttempt(currentGuess.join(''), updatedGuesses, rowIdx);
        }
      }
    },
    [attempts, autosubmitPuzzleAttempt, checkGuessLength, guesses, handleSubmitPuzzleAttempt, isValidating]
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
