import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/components/ui';
import { type LeaderboardScoreWithUser } from '@/convex/leaderboards/models';

type Props = {
  scores?: LeaderboardScoreWithUser[];
};

export function Leaderboard({ scores = [] }: Readonly<Props>) {
  return (
    <>
      {scores.map((score) => (
        <View key={score.position} style={styles.container}>
          <View style={styles.contentLeft}>
            <View style={styles.chip({ isForCurrentUser: score.isForCurrentUser })}>
              <Text
                color={score.isForCurrentUser ? 'white' : 'black'}
                size="base"
                style={{ textAlign: 'center' }}
                weight="bold"
              >
                {score.position}
              </Text>
            </View>
            <Text weight={score.isForCurrentUser ? 'semibold' : 'regular'}>{score.user.nickname}</Text>
          </View>
          <Text size="lg" weight="bold">
            {score.score}
          </Text>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 8,
  },
  chip({ isForCurrentUser }: { isForCurrentUser: boolean }) {
    return {
      aspectRatio: '1/1',
      alignSelf: 'stretch',
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isForCurrentUser ? theme.colors.petka.green : theme.colors.grey[10],
    };
  },
}));
