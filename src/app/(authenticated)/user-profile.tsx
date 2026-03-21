import dayjs from 'dayjs';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AttemptsDistributionGraph } from '@/components/elements';
import { Card, Text } from '@/components/ui';
import { puzzleType } from '@/convex/puzzles/models';
import { usePuzzlesStatisticsQuery, useUserQuery } from '@/hooks/queries';

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const { isLoading: isLoadingUser, data: user } = useUserQuery({ id: userId });
  const {
    isLoading: isLoadingStats,
    isNotFound: hasNoStats,
    data: stats,
  } = usePuzzlesStatisticsQuery({
    puzzleType: puzzleType.enum.daily,
    userId,
  });

  const isLoading = isLoadingUser || isLoadingStats;
  const title = isLoadingUser ? 'Nalagam podatke...' : (user?.nickname ?? 'Profil');
  const memberSince = user ? dayjs(user._creationTime).format('MMMM YYYY') : '';
  const winRate = stats && stats.totalPlayed > 0 ? Math.ceil((stats.totalWon / stats.totalPlayed) * 100) : 100;

  return (
    <>
      <Stack.Screen options={{ title }} />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            accessibilityLabel="Nalagam podatke o uporabniku..."
            accessibilityRole="spinbutton"
            accessible
            size="small"
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container} contentInsetAdjustmentBehavior="automatic">
          <View style={styles.header}>
            <Text color="grey50" size="sm">
              Član od: {memberSince}
            </Text>
          </View>
          {hasNoStats ? (
            <Text align="center" color="grey70" size="sm">
              Ta igralec še ni rešil nobene uganke.
            </Text>
          ) : (
            <View style={styles.statsSection}>
              <Text size="lg" weight="medium">
                Statistika dnevnih izzivov
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statEntry} testID="stat-total-played">
                  <Text color="grey50" size="xs">
                    Odigranih
                  </Text>
                  <Text color="grey70" size="lg">
                    {stats?.totalPlayed}
                  </Text>
                </View>
                <View style={styles.statEntry} testID="stat-win-rate">
                  <Text color="grey50" size="xs">
                    % rešenih
                  </Text>
                  <Text color="grey70" size="lg">
                    {winRate}%
                  </Text>
                </View>
                <View style={styles.statEntry} testID="stat-current-streak">
                  <Text color="grey50" numberOfLines={1} size="xs">
                    Trenutni niz
                  </Text>
                  <Text color="grey70" size="lg">
                    {stats?.currentStreak}
                  </Text>
                </View>
                <View style={styles.statEntry} testID="stat-max-streak">
                  <Text color="grey50" numberOfLines={1} size="xs">
                    Najdaljši niz
                  </Text>
                  <Text color="grey70" size="lg">
                    {stats?.maxStreak}
                  </Text>
                </View>
              </View>
              <Card title="Distribucija poskusov">
                <AttemptsDistributionGraph distribtions={stats!.distribution} isPuzzleFailed={false} />
              </Card>
            </View>
          )}
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flexGrow: 1,
    paddingTop: 0,
    paddingHorizontal: theme.spacing[6],
    paddingBottom: rt.insets.bottom + theme.spacing[6],
    gap: theme.spacing[6],
  },
  header: {
    gap: theme.spacing[1],
  },
  statsSection: {
    gap: theme.spacing[6],
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing[4],
  },
  statEntry: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing[4],
    backgroundColor: rt.themeName === 'dark' ? theme.colors.grey[20] : theme.colors.grey[5],
    borderRadius: 4,
  },
}));
