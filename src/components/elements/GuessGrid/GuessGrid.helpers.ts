import { deepClone } from '@/utils/clone';

import type { KeyboardKey } from '../Keyboard';

/**
 * Largest square cell size that fits a `rows` x `columns` grid (with `gap` between cells) into the given area,
 * capped at `maxSize`.
 */
export const getGuessGridCellSize = ({
  width,
  height,
  gap,
  maxSize,
  rows = 6,
  columns = 5,
}: {
  width: number;
  height: number;
  gap: number;
  maxSize: number;
  rows?: number;
  columns?: number;
}) => {
  const sizeByWidth = (width - (columns - 1) * gap) / columns;
  const sizeByHeight = (height - (rows - 1) * gap) / rows;
  return Math.max(0, Math.min(sizeByWidth, sizeByHeight, maxSize));
};

export const findCurrentGridRowIdx = (grid: (string | null)[][]) => {
  const rowIdx = grid.findIndex((row) => !row.every(Boolean));
  return rowIdx >= 0 ? rowIdx : grid.length;
};

export const findCellIndexToInsert = (grid: (string | null)[][], rowIdx: number) => {
  const nextCellIndex = grid[rowIdx].indexOf(null);
  return nextCellIndex !== -1 ? nextCellIndex : 5;
};

export const getUpdatedGrid = (
  grid: (string | null)[][],
  rowIdx: number,
  key: KeyboardKey,
  onCheckGuess?: (guess: (string | null)[], grid: (string | null)[][], rowIdx: number) => void
) => {
  const cellIdxToUpdate = findCellIndexToInsert(grid, rowIdx);
  const copy = deepClone(grid);

  if (key === '{Backspace}') {
    if (cellIdxToUpdate !== 0) {
      copy[rowIdx][cellIdxToUpdate - 1] = null;
    }
  } else if (key === '{Enter}') {
    onCheckGuess?.(copy[rowIdx], grid, rowIdx);
  } else {
    copy[rowIdx][cellIdxToUpdate] = key;
  }

  return copy;
};
