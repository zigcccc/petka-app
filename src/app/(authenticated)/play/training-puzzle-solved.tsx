import { Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AttemptsDistributionGraph } from '@/components/elements';
import { Button, Card, Text } from '@/components/ui';
import { puzzleType } from '@/convex/puzzles/models';
import { usePuzzleStatistics } from '@/hooks/usePuzzlesStatistics';
import { useTrainingPuzzle } from '@/hooks/useTrainingPuzzle';

export default function TrainingPuzzleSolvedScreen() {
  const router = useRouter();
  const { attempts, onMarkAsSolved, isMarkingAsSolved, isFailed, onShareResults } = useTrainingPuzzle();
  const { isLoading, data } = usePuzzleStatistics(puzzleType.Enum.training);

  const title = isFailed ? 'O joj... 🙄' : 'Čestitke 🥳';
  const subtitle = isFailed ? 'Tokrat ti ni uspelo rešiti izziva.' : 'Uspešno si opravil/a trening izziv.';

  const handleCreateNewChallenge = async () => {
    onMarkAsSolved();
    router.back();
  };

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
              accessibilityLabel="Nalagam statistiko trening izzivov..."
              accessibilityRole="spinbutton"
              accessible
              size="small"
            />
          </View>
        ) : (
          <>
            <Text size="lg" weight="medium">
              Trening statistika
            </Text>
            <View style={styles.gameStatsContainer}>
              <View style={styles.gameStatsEntry} testID="num-of-played-games">
                <Text color="grey50" size="xs">
                  Odigranih
                </Text>
                <Text color="grey70" size="lg">
                  {data.numberOfAllPuzzles}
                </Text>
              </View>
              <View style={styles.gameStatsEntry} testID="percentage-solved-games">
                <Text color="grey50" size="xs">
                  % rešenih
                </Text>
                <Text color="grey70" size="lg">
                  {data.solvedPercentage}%
                </Text>
              </View>
              <View style={styles.gameStatsEntry} testID="current-streak">
                <Text color="grey50" numberOfLines={1} size="xs">
                  Niz rešenih
                </Text>
                <Text color="grey70" size="lg">
                  {data.streak}
                </Text>
              </View>
            </View>
            <Card title="Distribucija poskusov">
              <AttemptsDistributionGraph
                distribtions={data.attemptsDistribution}
                isPuzzleFailed={isFailed}
                numberOfAllPuzzles={data.numberOfSolvedPuzzles}
                numberOfCurrentAttempts={attempts?.length}
              />
            </Card>
            <Button intent="shaded" onPress={onShareResults} size="sm" variant="outline">
              <Button.Text>Deli</Button.Text>
              <Button.Icon>
                <Octicons name="share" />
              </Button.Icon>
            </Button>
          </>
        )}
      </View>
      <View style={styles.actions}>
        <Button onPress={() => router.back()} variant="outline">
          Nazaj
        </Button>
        <Button loading={isMarkingAsSolved} onPress={handleCreateNewChallenge}>
          Začni nov izziv
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    paddingTop: theme.spacing[2],
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
    backgroundColor: theme.colors.grey[5],
    borderRadius: 4,
  },
}));
