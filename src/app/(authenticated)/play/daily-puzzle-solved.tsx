import { Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, Platform } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { AttemptsDistributionGraph } from '@/components/elements';
import { Card, Button, Text } from '@/components/ui';
import { puzzleType } from '@/convex/puzzles/models';
import { useDailyPuzzle } from '@/hooks/useDailyPuzzle';
import { usePuzzleStatistics } from '@/hooks/usePuzzlesStatistics';

const UniIcon = withUnistyles(Octicons);

export default function DailyPuzzleSolvedScreen() {
  const router = useRouter();
  const { attempts, isFailed, onShareResults } = useDailyPuzzle();
  const { isLoading, data } = usePuzzleStatistics(puzzleType.Enum.daily);

  const title = isFailed ? 'O joj... 🙄' : 'Čestitke 🥳';
  const subtitle = isFailed ? 'Tokrat ti ni uspelo rešiti izziva.' : 'Uspešno si opravil/a dnevni izziv.';

  return (
    <View style={styles.container}>
      <Text size="2xl" weight="bold">
        {title}
      </Text>
      <Text size="lg">{subtitle}</Text>
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.contentLoadingContainer}>
            <ActivityIndicator
              accessibilityLabel="Nalagam statistiko dnevnih izzivov..."
              accessibilityRole="spinbutton"
              accessible
              size="small"
            />
          </View>
        ) : (
          <>
            <Text size="lg" weight="medium">
              Statistika dnevnih izzivov
            </Text>
            <View style={styles.gameStatsContainer}>
              <View style={styles.gameStatsEntry} testID="num-of-played-games">
                <Text color="grey50" size="xs">
                  Odigranih
                </Text>
                <Text color="grey70" size="lg">
                  {data.totalPlayed}
                </Text>
              </View>
              <View style={styles.gameStatsEntry} testID="percentage-solved-games">
                <Text color="grey50" size="xs">
                  % rešenih
                </Text>
                <Text color="grey70" size="lg">
                  {data.totalPlayed > 0 ? Math.ceil((data.totalWon / data.totalPlayed) * 100) : 100}%
                </Text>
              </View>
              <View style={styles.gameStatsEntry} testID="current-streak">
                <Text color="grey50" numberOfLines={1} size="xs">
                  Niz rešenih
                </Text>
                <Text color="grey70" size="lg">
                  {data.currentStreak}
                </Text>
              </View>
            </View>
            <Card title="Distribucija poskusov">
              <AttemptsDistributionGraph
                distribtions={data.distribution}
                isPuzzleFailed={isFailed}
                numberOfAllPuzzles={data.totalPlayed}
                numberOfCurrentAttempts={attempts?.length}
              />
            </Card>
            <Button onPress={onShareResults} size="sm" variant="outline">
              <Button.Text>Deli</Button.Text>
              <UniIcon name="share" size={16} uniProps={(theme) => ({ color: theme.colors.petka.green })} />
            </Button>
          </>
        )}
      </View>
      <View style={styles.actions}>
        <Button onPress={() => router.back()} variant="outline">
          Nazaj
        </Button>
        <Button onPress={() => router.navigate('/leaderboards/weekly-leaderboard')}>Lestvica</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    paddingTop: Platform.select({ ios: theme.spacing[8], android: theme.spacing[2] }),
    paddingHorizontal: theme.spacing[6],
    paddingBottom: rt.insets.bottom + rt.insets.ime,
  },
  content: {
    paddingVertical: theme.spacing[8],
    gap: theme.spacing[6],
    flex: 1,
  },
  contentLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    gap: theme.spacing[4],
  },
  gameStatsContainer: {
    flexDirection: 'row',
    gap: theme.spacing[4],
  },
  gameStatsEntry: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing[4],
    backgroundColor: rt.themeName === 'dark' ? theme.colors.grey[20] : theme.colors.grey[5],
    borderRadius: 4,
  },
}));
