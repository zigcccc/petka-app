import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/components/ui';

type Props = {
  numberOfAllPuzzles: number;
  numberOfCurrentAttempts?: number;
  distribtions: Record<number, number>;
};

export function AttemptsDistributionGraph({
  distribtions,
  numberOfAllPuzzles,
  numberOfCurrentAttempts = 0,
}: Readonly<Props>) {
  return (
    <View style={styles.distrubitionsContainer}>
      {Object.entries(distribtions).map(([k, v]) => {
        const isCurrent = numberOfCurrentAttempts === parseInt(k);

        return (
          <View key={k} style={styles.distrubitionsEntry}>
            <Text size="sm" style={{ width: '5%', textAlign: 'left' }}>
              {k}
            </Text>
            <View style={styles.ditributionsEntryLine({ percentage: (v / numberOfAllPuzzles) * 95, isCurrent })}>
              <Text color={isCurrent ? 'white' : 'grey70'} size="sm">
                {v}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  distrubitionsContainer: {
    width: '100%',
    gap: theme.spacing[2],
  },
  distrubitionsEntry: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  ditributionsEntryLine({ percentage, isCurrent }: { percentage: number; isCurrent: boolean }) {
    return {
      paddingHorizontal: theme.spacing[2],
      paddingVertical: theme.spacing[3],
      borderRadius: 2,
      minWidth: '5%',
      width: `${percentage}%`,
      flexGrow: 0,
      flexShrink: 0,
      backgroundColor: isCurrent ? theme.colors.petka.green : theme.colors.grey[20],
    };
  },
}));
