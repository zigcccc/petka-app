import dayjs from 'dayjs';
import { useMemo } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/components/ui';
import { type PuzzleGuessAttempt } from '@/convex/puzzleGuessAttempts/models';
import { puzzleType, type PuzzleWithAttempts } from '@/convex/puzzles/models';
import { getDateObjectFromPuzzle } from '@/utils/puzzles';

import { GuessGrid } from '../GuessGrid';

type Props = {
  style?: StyleProp<ViewStyle>;
  puzzle: PuzzleWithAttempts;
  userId?: string;
  cellWidth?: number;
};

export function HistoryGrid({ puzzle, userId, style, cellWidth }: Readonly<Props>) {
  const puzzleCreatedDate = getDateObjectFromPuzzle(puzzle);

  const isInPast = puzzleCreatedDate.isBefore(dayjs(), 'day');
  const isSolvedByUser = userId && puzzle.solvedBy.includes(userId);
  const shouldShowSolution = puzzle.type === puzzleType.Enum.daily ? isInPast || isSolvedByUser : isSolvedByUser;
  const shouldShowOverlay = !isSolvedByUser && puzzle.type === puzzleType.Enum.daily;

  const paddedAttempts = useMemo(() => {
    const padded: PuzzleGuessAttempt[] = new Array(6)
      .fill({
        checkedLetters: new Array(5).fill({ letter: null, status: null }),
      })
      .map((paddedAttempt, idx) => ({ ...paddedAttempt, _id: idx }));

    if (puzzle.attempts) {
      for (const attemptIdx in puzzle.attempts) {
        padded[attemptIdx] = puzzle.attempts[attemptIdx];
      }
    }

    return padded;
  }, [puzzle.attempts]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={{ textTransform: 'capitalize' }} weight="medium">
          {puzzleCreatedDate.format('dddd, DD. MMM YYYY')}
        </Text>
        {shouldShowSolution && (
          <Text weight="medium">
            Rešitev:{' '}
            <Text style={{ textTransform: 'uppercase' }} weight="bold">
              {puzzle.solution}
            </Text>
          </Text>
        )}
      </View>
      <View style={styles.grid}>
        {paddedAttempts.map((attempt) => (
          <View key={attempt._id} style={styles.gridRow}>
            {attempt.checkedLetters.map((letter, idx) => (
              <GuessGrid.Cell
                key={idx}
                cellWidth={cellWidth}
                checkedLetters={attempt.checkedLetters}
                idx={idx}
                testID={`cell-${attempt._id}-${idx}`}
                value={letter.letter}
              />
            ))}
          </View>
        ))}
        {shouldShowOverlay && (
          <View style={styles.overlay}>
            <Text color="white" size="lg" weight="bold">
              {isInPast ? 'Izziv je ostal ne rešen...' : 'Dnevnega izziva še nisi rešil/a'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    padding: theme.spacing[8],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing[4],
  },
  grid: { flexDirection: 'column', gap: theme.spacing[3], alignSelf: 'center' },
  gridRow: { flexDirection: 'row', gap: theme.spacing[3] },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: rt.themeName === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
