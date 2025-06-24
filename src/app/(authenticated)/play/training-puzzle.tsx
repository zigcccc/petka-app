import { useNavigation, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { GuessGrid, Keyboard, useGuessGrid } from '@/components/elements';
import { Button, Text } from '@/components/ui';
import { useTrainingPuzzle } from '@/hooks/useTrainingPuzzle';

export default function TrainingPuzzleScreen() {
  const { theme } = useUnistyles();
  const router = useRouter();
  const navigation = useNavigation();
  const { attempts, puzzle, isCreating, isSolved, onSubmitAttempt } = useTrainingPuzzle();
  const { grid, onInput, isValidating, allCheckedLetters } = useGuessGrid({ attempts, onSubmitAttempt });

  useEffect(() => {
    if (isSolved) {
      router.navigate('/play/training-puzzle-solved');
      navigation.setOptions({
        headerRight: () => (
          <Button intent="terciary" onPress={() => router.navigate('/play/training-puzzle-solved')} size="sm">
            Statistika
          </Button>
        ),
      });
    } else {
      navigation.setOptions({ headerRight: null });
    }
  }, [isSolved, router, navigation]);

  if (!puzzle) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator color={theme.colors.petka.green} size="large" />
          <Text size="sm">{isCreating ? 'Ustvarjam novo igro...' : 'Iščem aktivno igro...'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <GuessGrid attempts={attempts} grid={grid} isValidating={isValidating} />
      </View>
      <View style={styles.spacer} />
      <Keyboard checkedLetters={allCheckedLetters} onKeyPress={onInput} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  spacer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    gap: theme.spacing[2],
  },
  container: {
    flex: 1,
  },
  content: {
    paddingTop: theme.spacing[6],
    paddingHorizontal: theme.spacing[6],
  },
}));
