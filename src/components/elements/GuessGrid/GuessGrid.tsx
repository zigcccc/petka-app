import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/components/ui';

type Props = {
  grid: (string | null)[][];
};

export function GuessGrid({ grid }: Props) {
  return (
    <View style={styles.grid}>
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
  grid: {
    flexDirection: 'column',
    gap: theme.spacing[4],
  },
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
