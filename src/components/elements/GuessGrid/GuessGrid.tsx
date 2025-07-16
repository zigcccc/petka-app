import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/components/ui';
import { checkedLetterStatus } from '@/convex/puzzleGuessAttempts/models';

import { type GuessGridCellProps, type GuessGridProps } from './GuessGrid.types';

function GuessGridCell({ testID, value, idx, checkedLetters = [], cellWidth }: Readonly<GuessGridCellProps>) {
  const checkedLetter = checkedLetters.find(
    (checkedLetter) => checkedLetter.index === idx && checkedLetter.letter === value
  );
  const isCorrect = value ? checkedLetter?.status === checkedLetterStatus.Enum.correct : false;
  const isMisplaced = value ? checkedLetter?.status === checkedLetterStatus.Enum.misplaced : false;
  const isInvalid = value ? checkedLetter?.status === checkedLetterStatus.Enum.invalid : false;

  return (
    <View style={styles.cell({ isCorrect, isInvalid, isMisplaced, cellWidth })} testID={testID}>
      <Text
        allowFontScaling={false}
        color={checkedLetters.length ? 'white' : 'black'}
        size="xl"
        style={styles.cellText}
        weight="bold"
      >
        {value}
      </Text>
    </View>
  );
}

export function GuessGrid({ attempts = [], grid, isValidating = false }: Readonly<GuessGridProps>) {
  return (
    <View style={styles.grid({ isValidating })}>
      {grid.map((row, rowIdx) => {
        const attempt = attempts[rowIdx];
        return (
          <View key={rowIdx} style={styles.row} testID={`guess-grid--row-${rowIdx}`}>
            {row.map((cell, cellIdx) => (
              <GuessGridCell
                key={cellIdx}
                checkedLetters={attempt?.checkedLetters}
                idx={cellIdx}
                testID={`guess-grid--row-${rowIdx}--cell-${cellIdx}`}
                value={cell}
              />
            ))}
          </View>
        );
      })}
    </View>
  );
}

GuessGrid.Cell = GuessGridCell;

const styles = StyleSheet.create((theme, rt) => ({
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
    return {
      backgroundColor: isCorrect
        ? theme.colors.petka.green
        : isMisplaced
          ? theme.colors.petka.yellow
          : isInvalid
            ? theme.colors.grey[70]
            : theme.colors.grey[10],
      borderColor: isCorrect
        ? theme.colors.petka.green
        : isMisplaced
          ? theme.colors.petka.yellow
          : isInvalid
            ? theme.colors.grey[70]
            : theme.colors.grey[20],
      borderWidth: 2,
      // screen width - 2*20 padding - 4*12 gap
      width: {
        xs: cellWidth ?? (rt.screen.width - 40 - 4 * 12) / 5,
        md: cellWidth ?? 100,
      },
      aspectRatio: '1/1',
      alignItems: 'center',
      justifyContent: 'center',
    };
  },
  cellText: {
    textTransform: 'uppercase',
  },
}));
