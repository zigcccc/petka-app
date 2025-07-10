import { useNavigation, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { GuessGrid, Keyboard, useGuessGrid } from '@/components/elements';
import { Button, Text } from '@/components/ui';
import { useTrainingPuzzle } from '@/hooks/useTrainingPuzzle';

export default function TrainingPuzzleScreen() {
  const { theme } = useUnistyles();
  const router = useRouter();
  const navigation = useNavigation();
  const { attempts, puzzle, isCreating, isDone, onSubmitAttempt } = useTrainingPuzzle();
  const { grid, onInput, isValidating, allCheckedLetters } = useGuessGrid({ attempts, onSubmitAttempt });

  useEffect(() => {
    if (isDone) {
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
  }, [isDone, router, navigation]);

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
      <Keyboard checkedLetters={allCheckedLetters} isDisabled={isDone} onKeyPress={onInput} />
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
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
    paddingBottom: Platform.select({ android: rt.insets.bottom + theme.spacing[3], ios: 0 }),
  },
  content: {
    paddingTop: theme.spacing[6],
    paddingHorizontal: theme.spacing[6],
  },
}));
