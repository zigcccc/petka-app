import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/components/ui';
import { checkedLetterStatus, type PuzzleGuessAttempt } from '@/convex/puzzleGuessAttempts/models';

type Props = {
  attempts?: PuzzleGuessAttempt[];
  grid: (string | null)[][];
  isValidating?: boolean;
};

export function GuessGrid({ attempts = [], grid, isValidating = false }: Props) {
  return (
    <View style={styles.grid({ isValidating })}>
      {grid.map((row, rowIdx) => {
        const attempt = attempts[rowIdx];
        return (
          <View key={rowIdx} style={styles.row}>
            {row.map((cell, cellIdx) => {
              const checkedLetter = attempt?.checkedLetters.find(
                (checkedLetter) => checkedLetter.index === cellIdx && checkedLetter.letter === cell
              );
              const isCorrect = cell ? checkedLetter?.status === checkedLetterStatus.Enum.correct : false;
              const isMisplaced = cell ? checkedLetter?.status === checkedLetterStatus.Enum.misplaced : false;
              const isInvalid = cell ? checkedLetter?.status === checkedLetterStatus.Enum.invalid : false;

              return (
                <View key={cellIdx} style={styles.cell({ isCorrect, isInvalid, isMisplaced })}>
                  <Text color={attempt ? 'white' : 'black'} size="xl" style={styles.cellText} weight="bold">
                    {cell}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  grid: ({ isValidating }: Pick<Props, 'isValidating'>) => ({
    flexDirection: 'column',
    gap: theme.spacing[4],
    opacity: isValidating ? 0.4 : 1,
  }),
  row: {
    flexDirection: 'row',
    gap: theme.spacing[4],
  },
  cell({ isCorrect, isMisplaced, isInvalid }: { isCorrect: boolean; isMisplaced: boolean; isInvalid: boolean }) {
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
      width: (rt.screen.width - 40 - 4 * 12) / 5,
      aspectRatio: '1/1',
      alignItems: 'center',
      justifyContent: 'center',
    };
  },
  cellText: {
    textTransform: 'uppercase',
  },
}));
