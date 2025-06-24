import { Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AttemptsDistributionGraph } from '@/components/elements';
import { Button, Card, Text } from '@/components/ui';
import { puzzleType } from '@/convex/puzzles/models';
import { usePuzzlesStatistics } from '@/hooks/usePuzzlesStatistics';
import { useToaster } from '@/hooks/useToaster';
import { useTrainingPuzzle } from '@/hooks/useTrainingPuzzle';

export default function TrainingPuzzleSolved() {
  const router = useRouter();
  const toaster = useToaster();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { attempts, onMarkAsSolved } = useTrainingPuzzle();
  const { isLoading, data } = usePuzzlesStatistics(puzzleType.Enum.training);

  const handleCreateNewChallenge = async () => {
    try {
      setIsSubmitting(true);
      onMarkAsSolved();
      router.back();
    } catch {
      toaster.toast('Nekaj je šlo narobe.', { intent: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text size="2xl" weight="bold">
        Čestitke 🥳
      </Text>
      <Text size="lg">Uspešno si opravil/a trening izziv.</Text>
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.contentLoadingContainer}>
            <ActivityIndicator size="small" />
          </View>
        ) : (
          <>
            <Text size="lg" weight="medium">
              Trening statistika
            </Text>
            <View style={styles.gameStatsContainer}>
              <View style={styles.gameStatsEntry}>
                <Text color="grey50" size="xs">
                  Odigranih
                </Text>
                <Text color="grey70" size="lg">
                  {data.numberOfAllPuzzles}
                </Text>
              </View>
              <View style={styles.gameStatsEntry}>
                <Text color="grey50" size="xs">
                  % rešenih
                </Text>
                <Text color="grey70" size="lg">
                  {data.solvedPercentage}%
                </Text>
              </View>
              <View style={styles.gameStatsEntry}>
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
                numberOfAllPuzzles={data.numberOfSolvedPuzzles}
                numberOfCurrentAttempts={attempts?.length}
              />
            </Card>
            <Button onPress={() => null} size="sm" variant="outline">
              <Button.Text>Deli</Button.Text>
              <Octicons color="green" name="share" size={16} />
            </Button>
          </>
        )}
      </View>
      <View style={styles.actions}>
        <Button onPress={() => router.back()} variant="outline">
          Nazaj
        </Button>
        <Button loading={isSubmitting} onPress={handleCreateNewChallenge}>
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
