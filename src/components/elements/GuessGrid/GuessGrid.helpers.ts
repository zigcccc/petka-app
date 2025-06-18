import { deepClone } from '@/utils/clone';

import { type KeyboardKey } from '../Keyboard';

export const findCurrentGridRowIdx = (grid: (string | null)[][]) => {
  return grid.findIndex((row) => !row.every(Boolean));
};

export const findCellIndexToInsert = (grid: (string | null)[][], rowIdx: number) => {
  const nextCellIndex = grid[rowIdx].findIndex((cell) => cell === null);
  return nextCellIndex !== -1 ? nextCellIndex : 5;
};

export const mockExternalDictionaryService = {
  checkWord: async (_word: string) => {
    return Math.random() > 0.5 ? true : false;
  },
} as const;

export const getUpdatedGrid = (
  grid: (string | null)[][],
  rowIdx: number,
  key: KeyboardKey,
  onCheckGuess?: (guess: (string | null)[]) => void
) => {
  const cellIdxToUpdate = findCellIndexToInsert(grid, rowIdx);
  const copy = deepClone(grid);

  if (key === '{Backspace}') {
    console.log({ cellIdxToUpdate });
    if (cellIdxToUpdate !== 0) {
      copy[rowIdx][cellIdxToUpdate - 1] = null;
    }
  } else if (key === '{Enter}') {
    onCheckGuess?.(copy[rowIdx]);
  } else {
    copy[rowIdx][cellIdxToUpdate] = key;
  }

  return copy;
};
