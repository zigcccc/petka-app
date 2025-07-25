import * as Sentry from '@sentry/react-native';
import { useRouter, useNavigation, type ErrorBoundaryProps } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useEffect } from 'react';
import { ActivityIndicator, Image, Platform, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { GuessGrid, Keyboard, useGuessGrid } from '@/components/elements';
import { Button, Text } from '@/components/ui';
import { useDailyPuzzle } from '@/hooks/useDailyPuzzle';

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.errorContainer}>
      <Image source={require('@/assets/images/error.png')} style={styles.errorImage} />
      <View>
        <Text size="xl" weight="bold">
          To pa je nerodno...
        </Text>
        <Text size="lg">Dnevne uganke nismo uspeli najti.</Text>
      </View>
      <Button intent="terciary" onPress={retry}>
        Poizkusi ponovno
      </Button>
    </View>
  );
}

export default function DailyPuzzleScreen() {
  const { theme } = useUnistyles();
  const router = useRouter();
  const navigation = useNavigation();
  const posthog = usePostHog();
  const { attempts, puzzle, isLoading, isDone, onSubmitAttempt } = useDailyPuzzle();
  const { grid, onInput, isValidating, allCheckedLetters } = useGuessGrid({ attempts, onSubmitAttempt });

  useEffect(() => {
    if (isDone) {
      router.navigate('/play/daily-puzzle-solved');
      navigation.setOptions({
        headerRight: () => (
          <Button intent="terciary" onPress={() => router.navigate('/play/daily-puzzle-solved')} size="sm">
            Statistika
          </Button>
        ),
      });
    } else {
      navigation.setOptions({ headerRight: null });
    }
  }, [isDone, router, navigation]);

  if (!puzzle) {
    if (!isLoading) {
      const error = new Error('Daily puzzle not found!');
      posthog.captureException(error);
      Sentry.captureException(error);
      throw error;
    }

    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator color={theme.colors.petka.green} size="large" />
          <Text size="sm">Iščem aktivno igro...</Text>
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
  errorContainer: {
    paddingHorizontal: theme.spacing[8],
    flex: 1,
    gap: theme.spacing[4],
    paddingTop: theme.spacing[8],
  },
  errorImage: {
    aspectRatio: '1/1',
    width: '100%',
    height: 'auto',
    resizeMode: 'contain',
  },
}));
