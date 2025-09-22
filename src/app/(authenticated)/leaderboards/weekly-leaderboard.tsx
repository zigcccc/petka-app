import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Leaderboard } from '@/components/elements';
import { NoLeaderboards } from '@/components/graphics';
import { Button, Card, Text } from '@/components/ui';
import { leaderboardRange, leaderboardType } from '@/convex/leaderboards/models';
import { useLeaderboards } from '@/hooks/useLeaderboards';

export default function WeeklyLeaderboardScreen() {
  const navigation = useNavigation();
  const {
    leaderboards: privateLeaderboards,
    isLoading,
    isCreating,
    isJoining,
    onCreatePrivateLeaderboard,
    onJoinPrivateLeaderboard,
    onPresentLeaderboardActions,
  } = useLeaderboards(leaderboardType.Enum.private, leaderboardRange.Enum.weekly);

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({ title: 'Tedenska lestvica' });
    }, [navigation])
  );

  return (
    <ScrollView contentContainerStyle={styles.container} contentInsetAdjustmentBehavior="automatic">
      {privateLeaderboards?.length ? (
        <View style={styles.privateLeaderboardsContainer}>
          {privateLeaderboards.map((leaderboard) => (
            <Card
              key={leaderboard._id}
              onShowActions={() => onPresentLeaderboardActions(leaderboard)}
              title={leaderboard.name ?? leaderboard._id}
            >
              <Leaderboard scores={leaderboard.scores} />
            </Card>
          ))}
        </View>
      ) : (
        <>
          {isLoading ? null : (
            <View style={styles.noLeaderboardsContainer}>
              <NoLeaderboards
                accessibilityLabel="No leaderboards"
                accessibilityRole="image"
                accessible
                height={200}
                width={200}
              />
              <Text align="center" color="grey70" size="sm">
                Pridružen/a nisi še nobeni lestvici...
              </Text>
            </View>
          )}
        </>
      )}
      <View style={styles.actions}>
        <Button intent="terciary" loading={isJoining} onPress={onJoinPrivateLeaderboard} variant="fill">
          Pridruži se lestvici
        </Button>
        <Button intent="terciary" loading={isCreating} onPress={onCreatePrivateLeaderboard} variant="outline">
          Ustvari lestvico
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexGrow: 1,
    paddingTop: theme.spacing[6],
    paddingHorizontal: theme.spacing[6],
  },
  noLeaderboardsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[8],
    paddingBottom: theme.spacing[4],
  },
  image: {
    aspectRatio: '1/1',
    resizeMode: 'contain',
    width: '50%',
    height: 'auto',
  },
  privateLeaderboardsContainer: {
    paddingVertical: theme.spacing[6],
    gap: theme.spacing[8],
  },
  actions: {
    gap: theme.spacing[3],
    paddingTop: theme.spacing[5],
  },
}));
