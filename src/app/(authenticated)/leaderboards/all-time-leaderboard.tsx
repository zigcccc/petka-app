import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Leaderboard } from '@/components/elements';
import { Button, Card, Text } from '@/components/ui';
import { leaderboardRange, leaderboardType } from '@/convex/leaderboards/models';
import { useGlobalLeaderboard } from '@/hooks/useGlobalLeaderboard';
import { useLeaderboards } from '@/hooks/useLeaderboards';

export default function AllTimeLeaderboardScreen() {
  const navigation = useNavigation();
  const { data: globalLeaderboard } = useGlobalLeaderboard(leaderboardRange.Enum.alltime);
  const {
    leaderboards: privateLeaderboards,
    isCreating,
    isJoining,
    onPresentLeaderboardActions,
    onCreatePrivateLeaderboard,
    onJoinPrivateLeaderboard,
  } = useLeaderboards(leaderboardType.Enum.private, leaderboardRange.Enum.alltime);

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({ title: 'Lestvica vseh časov' });
    }, [navigation])
  );

  return (
    <ScrollView contentContainerStyle={styles.container} contentInsetAdjustmentBehavior="automatic">
      <Card title="Globalna lestvica">
        <Leaderboard scores={globalLeaderboard?.scores} />
      </Card>
      <View style={styles.contentContainer}>
        <Text size="lg" weight="medium">
          Tvoje lestvice
        </Text>
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
          <View style={styles.noLeaderboardsContainer}>
            <Image source={require('@/assets/images/no-leaderboards.png')} style={styles.image} />
            <Text align="center" color="grey70" size="sm">
              Pridružen/a nisi še nobeni zasebni lestvici...
            </Text>
          </View>
        )}
        <View style={styles.actions}>
          <Button intent="terciary" loading={isJoining} onPress={onJoinPrivateLeaderboard} variant="fill">
            Pridruži se lestvici
          </Button>
          <Button intent="terciary" loading={isCreating} onPress={onCreatePrivateLeaderboard} variant="outline">
            Ustvari lestvico
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingTop: theme.spacing[8],
    paddingHorizontal: theme.spacing[6],
  },
  contentContainer: {
    paddingVertical: theme.spacing[8],
  },
  noLeaderboardsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[8],
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
