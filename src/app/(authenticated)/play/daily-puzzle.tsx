import { Stack } from 'expo-router';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { GuessGrid, Keyboard, useGuessGrid } from '@/components/elements';

export default function DailyPuzzleScreen() {
  const { theme } = useUnistyles();
  const { grid, onInput, isValidating } = useGuessGrid();

  return (
    <>
      <Stack.Screen
        options={{
          headerBackTitle: 'Nazaj',
          headerBackTitleStyle: styles.back,
          headerShadowVisible: false,
          headerTintColor: theme.colors.petka.black,
          title: '',
        }}
      />
      <View style={styles.container}>
        <View style={styles.content}>
          <GuessGrid grid={grid} isValidating={isValidating} />
        </View>
        <View style={styles.spacer} />
        <Keyboard
          correctCharacters={['i', 'j']}
          invalidCharacters={['d', 'e', 'f']}
          misplacedCharacters={['a', 'b', 'c']}
          onKeyPress={onInput}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  back: {
    fontFamily: theme.fonts.sans.medium,
  },
  spacer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingTop: theme.spacing[6],
    paddingHorizontal: theme.spacing[6],
  },
}));
