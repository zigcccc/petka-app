import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/components/ui';

type Props = {
  grid: (string | null)[][];
  isValidating?: boolean;
};

export function GuessGrid({ grid, isValidating = false }: Props) {
  return (
    <View style={styles.grid({ isValidating })}>
      {grid.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {row.map((cell, cellIdx) => (
            <View key={cellIdx} style={styles.cell}>
              <Text size="xl" style={styles.cellText} weight="bold">
                {cell}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  grid: ({ isValidating }: Pick<Props, 'isValidating'>) => ({
    flexDirection: 'column',
    gap: theme.spacing[4],
    opacity: isValidating ? 0.4 : 1,
  }),
  row: {
    flexDirection: 'row',
    gap: theme.spacing[4],
  },
  cell: {
    backgroundColor: theme.colors.grey[10],
    borderColor: theme.colors.grey[20],
    borderWidth: 2,
    // screen width - 2*20 padding - 4*12 gap
    width: (rt.screen.width - 40 - 4 * 12) / 5,
    aspectRatio: '1/1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    textTransform: 'uppercase',
  },
}));
