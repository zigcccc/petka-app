import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { GuessGrid, Keyboard, useGuessGrid } from '@/components/elements';

export default function DailyPuzzleScreen() {
  const { grid, onInput, isValidating } = useGuessGrid();

  return (
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
  );
}

const styles = StyleSheet.create((theme) => ({
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
