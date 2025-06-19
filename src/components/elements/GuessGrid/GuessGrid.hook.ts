import { useConvex } from 'convex/react';
import { useCallback, useMemo, useState } from 'react';

import { api } from '@/convex/_generated/api';
import { useToaster } from '@/hooks/useToaster';

import { type KeyboardKey } from '../Keyboard';

import { findCurrentGridRowIdx, getUpdatedGrid } from './GuessGrid.helpers';

const initialGuesses = new Array(5).fill(new Array(5).fill(null));

export function useGuessGrid() {
  const toaster = useToaster();
  const convex = useConvex();
  const [guesses, setGuesses] = useState<(string | null)[][]>(initialGuesses);
  const [isValidating, setIsValidating] = useState(false);

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

      // Proceed with logic
      console.log('Guessing: ', filteredGuess.join(''));
    },
    [toaster]
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
            console.log({ term });
          }
        } catch {
          toaster.toast('Prišlo je do napake', { intent: 'error' });
          setGuesses(getUpdatedGrid(updatedGuesses, rowIdx, '{Backspace}'));
        } finally {
          setIsValidating(false);
        }
      }
    },
    [checkGuessLength, convex, guesses, isValidating, toaster]
  );

  return useMemo(
    () => ({
      grid: guesses,
      isValidating,
      onInput: handleInput,
      onReset: handleReset,
    }),
    [guesses, handleInput, handleReset, isValidating]
  );
}
