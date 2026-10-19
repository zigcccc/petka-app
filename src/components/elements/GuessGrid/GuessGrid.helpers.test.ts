import { getGuessGridCellSize } from './GuessGrid.helpers';

describe('getGuessGridCellSize', () => {
  it('is limited by width on a tall portrait phone', () => {
    // iPhone 18 Pro: 402pt wide window minus 2 * 20pt padding, plenty of height
    expect(getGuessGridCellSize({ width: 362, height: 500, gap: 12, maxSize: 100 })).toBeCloseTo(62.8);
  });

  it('is limited by height when the available area is short', () => {
    // 6 rows + 5 gaps must fit into 300pt: (300 - 60) / 6
    expect(getGuessGridCellSize({ width: 600, height: 300, gap: 12, maxSize: 100 })).toBe(40);
  });

  it('never exceeds the maximum cell size', () => {
    expect(getGuessGridCellSize({ width: 2000, height: 2000, gap: 12, maxSize: 100 })).toBe(100);
  });

  it('never returns a negative size', () => {
    expect(getGuessGridCellSize({ width: 10, height: 10, gap: 12, maxSize: 100 })).toBe(0);
  });
});
