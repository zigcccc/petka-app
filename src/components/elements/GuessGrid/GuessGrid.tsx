import { useState } from 'react';
import { type LayoutRectangle, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Text } from '@/components/ui';
import { checkedLetterStatus } from '@/convex/puzzleGuessAttempts/models';

import { getGuessGridCellSize } from './GuessGrid.helpers';
import type { GuessGridCellProps, GuessGridProps } from './GuessGrid.types';

const MAX_CELL_SIZE = 100;

function GuessGridCell({ testID, value, idx, checkedLetters = [], cellWidth }: Readonly<GuessGridCellProps>) {
  const checkedLetter = checkedLetters.find(
    (checkedLetter) => checkedLetter.index === idx && checkedLetter.letter === value
  );
  const isCorrect = value ? checkedLetter?.status === checkedLetterStatus.enum.correct : false;
  const isMisplaced = value ? checkedLetter?.status === checkedLetterStatus.enum.misplaced : false;
  const isInvalid = value ? checkedLetter?.status === checkedLetterStatus.enum.invalid : false;

  return (
    <View style={styles.cell({ isCorrect, isInvalid, isMisplaced, cellWidth })} testID={testID}>
      <Text allowFontScaling={false} size="xl" style={styles.cellText(!!checkedLetters.length)} weight="bold">
        {value}
      </Text>
    </View>
  );
}

/**
 * Fills the space it's given and sizes its cells to fit it, so the grid never pushes the keyboard off-screen in
 * short or resized windows.
 */
export function GuessGrid({ attempts = [], grid, isValidating = false }: Readonly<GuessGridProps>) {
  const { theme } = useUnistyles();
  const [area, setArea] = useState<LayoutRectangle | null>(null);
  const cellWidth = area
    ? getGuessGridCellSize({ width: area.width, height: area.height, gap: theme.spacing[4], maxSize: MAX_CELL_SIZE })
    : undefined;

  return (
    <View onLayout={(event) => setArea(event.nativeEvent.layout)} style={styles.container}>
      <View style={styles.grid({ isValidating })}>
        {grid.map((row, rowIdx) => {
          const attempt = attempts[rowIdx];
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: Fine with it here
            <View key={rowIdx} style={styles.row} testID={`guess-grid--row-${rowIdx}`}>
              {row.map((cell, cellIdx) => (
                <GuessGridCell
                  cellWidth={cellWidth}
                  checkedLetters={attempt?.checkedLetters}
                  idx={cellIdx}
                  // biome-ignore lint/suspicious/noArrayIndexKey: Fine with it here
                  key={cellIdx}
                  testID={`guess-grid--row-${rowIdx}--cell-${cellIdx}`}
                  value={cell}
                />
              ))}
            </View>
          );
        })}
      </View>
    </View>
  );
}

GuessGrid.Cell = GuessGridCell;

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    alignSelf: 'stretch',
  },
  grid: ({ isValidating }: Pick<GuessGridProps, 'isValidating'>) => ({
    flexDirection: 'column',
    gap: theme.spacing[4],
    opacity: isValidating ? 0.4 : 1,
    alignSelf: 'center',
  }),
  row: {
    flexDirection: 'row',
    gap: theme.spacing[4],
  },
  cell({
    isCorrect,
    isMisplaced,
    isInvalid,
    cellWidth,
  }: {
    isCorrect: boolean;
    isMisplaced: boolean;
    isInvalid: boolean;
    cellWidth?: number;
  }) {
    const invalidColor = rt.themeName === 'dark' ? theme.colors.grey[5] : theme.colors.grey[70];

    return {
      backgroundColor: isCorrect
        ? theme.colors.petka.green
        : isMisplaced
          ? theme.colors.petka.yellow
          : isInvalid
            ? invalidColor
            : theme.colors.grey[10],
      borderColor: isCorrect
        ? theme.colors.petka.green
        : isMisplaced
          ? theme.colors.petka.yellow
          : isInvalid
            ? invalidColor
            : theme.colors.grey[20],
      borderWidth: 2,
      // Explicit width and height once measured: `aspectRatio` combined with breakpoint styles isn't reapplied
      // reliably when the window is resized (e.g. folding/unfolding the iPhone Duo).
      ...(cellWidth === undefined
        ? {
            // Fallback before the grid is measured: screen width - 2*20 padding - 4*12 gap
            width: { xs: (rt.screen.width - 40 - 4 * 12) / 5, md: MAX_CELL_SIZE },
            aspectRatio: 1,
          }
        : { width: cellWidth, height: cellWidth }),
      alignItems: 'center',
      justifyContent: 'center',
    };
  },
  cellText(hasCheckedLetters: boolean) {
    const inferredColor = hasCheckedLetters ? theme.colors.white : theme.colors.black;

    return {
      color: rt.themeName === 'dark' ? theme.colors.white : inferredColor,
      textTransform: 'uppercase',
    };
  },
}));
