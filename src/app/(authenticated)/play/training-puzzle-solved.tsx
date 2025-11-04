import { Octicons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { ActivityIndicator, Platform, ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AttemptsDistributionGraph } from '@/components/elements';
import { Button, Card, Text } from '@/components/ui';
import { puzzleType } from '@/convex/puzzles/models';
import { useDictionaryEntry } from '@/hooks/queries';
import { usePuzzleStatistics } from '@/hooks/usePuzzlesStatistics';
import { useTrainingPuzzle } from '@/hooks/useTrainingPuzzle';
import { capitalize } from '@/utils/strings';

export default function TrainingPuzzleSolvedScreen() {
  const router = useRouter();
  const { attempts, onCreateTrainingPuzzle, isCreating, isMarkingAsSolved, isFailed, onShareResults, puzzle } =
    useTrainingPuzzle();
  const { isLoading, data } = usePuzzleStatistics(puzzleType.Enum.training);
  const { isLoading: isLoadingDictionaryEntry, data: dictionaryEntry } = useDictionaryEntry(
    puzzle ? { term: puzzle.solution } : 'skip'
  );

  const title = isFailed ? 'O joj... 🙄' : 'Čestitke 🥳';
  const subtitle = isFailed ? 'Tokrat ti ni uspelo rešiti izziva.' : 'Uspešno si opravil/a trening izziv.';

  const handleCreateNewChallenge = async () => {
    await onCreateTrainingPuzzle();
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
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.solution}>
              <Text weight="medium">Rešitev: &quot;{puzzle?.solution.toUpperCase()}&quot;</Text>
              {!isLoadingDictionaryEntry && (
                <Text size="xs" weight="italic">
                  <Text numberOfLines={2} size="xs" weight="italic">
                    {capitalize(dictionaryEntry?.explanation) || 'Razlaga besede na voljo v Fran slovarju'}
                    {'. '}
                  </Text>
                  <Link
                    accessibilityRole="link"
                    accessible
                    asChild
                    href={`https://www.fran.si/iskanje?View=1&Query=${puzzle?.solution}`}
                  >
                    <Text size="xs" weight="medium">
                      SSKJ <Octicons name="arrow-up-right" />
                    </Text>
                  </Link>
                </Text>
              )}
            </View>
            <Text size="lg" weight="medium">
              Trening statistika
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
                numberOfAllPuzzles={data.totalWon}
                numberOfCurrentAttempts={attempts?.length}
              />
            </Card>
            <Button intent="shaded" onPress={onShareResults} size="sm" variant="outline">
              <Button.Text>Deli</Button.Text>
              <Button.Icon>
                <Octicons name="share" />
              </Button.Icon>
            </Button>
          </ScrollView>
        )}
      </View>
      <View style={styles.actions}>
        <Button onPress={() => router.back()} variant="outline">
          Nazaj
        </Button>
        <Button loading={isMarkingAsSolved || isCreating} onPress={handleCreateNewChallenge}>
          Začni nov izziv
        </Button>
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
    paddingTop: theme.spacing[6],
    paddingBottom: theme.spacing[8],
    gap: theme.spacing[6],
    flex: 1,
  },
  contentLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    gap: theme.spacing[6],
  },
  solution: {
    gap: theme.spacing[2],
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
