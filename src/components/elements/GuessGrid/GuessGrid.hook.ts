import * as toaster from 'burnt';
import { useCallback, useMemo, useState } from 'react';

import { type KeyboardKey } from '../Keyboard';

import { findCurrentGridRowIdx, getUpdatedGrid, mockExternalDictionaryService } from './GuessGrid.helpers';

const initialGuesses = new Array(5).fill(new Array(5).fill(null));

export function useGuessGrid() {
  const [guesses, setGuesses] = useState<(string | null)[][]>(initialGuesses);

  const handleReset = useCallback(() => {
    setGuesses(initialGuesses);
  }, []);

  const checkGuessLength = (guess: (string | null)[]) => {
    const filteredGuess = guess.filter(Boolean);

    if (filteredGuess.length !== 5) {
      toaster.toast({
        title: 'Vnesite vseh pet znakov',
        haptic: 'error',
        preset: 'error',
        from: 'top',
      });
      return;
    }

    // Proceed with logic
    console.log('Guessing: ', filteredGuess.join(''));
  };

  const handleInput = useCallback(
    async (key: KeyboardKey) => {
      const rowIdx = findCurrentGridRowIdx(guesses);
      const updatedGuesses = getUpdatedGrid(guesses, rowIdx, key, checkGuessLength);
      setGuesses(updatedGuesses);

      const currentGuess = updatedGuesses[rowIdx].filter(Boolean);

      if (currentGuess.length === 5) {
        const isValid = await mockExternalDictionaryService.checkWord(currentGuess.join(''));
        if (!isValid) {
          toaster.toast({
            title: 'Uporabite besedo is SSKJ',
            haptic: 'error',
            preset: 'error',
            from: 'top',
          });
          setGuesses(getUpdatedGrid(updatedGuesses, rowIdx, '{Backspace}'));
        } else {
          // Logic to check if the word is the correct word
        }
      }
    },
    [guesses]
  );

  return useMemo(
    () => ({
      grid: guesses,
      onInput: handleInput,
      onReset: handleReset,
    }),
    [guesses, handleInput, handleReset]
  );
}
