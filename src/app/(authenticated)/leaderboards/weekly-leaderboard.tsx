import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback } from 'react';
import { ActionSheetIOS, ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Leaderboard } from '@/components/elements';
import { Button, Card, Text } from '@/components/ui';
import { type Id } from '@/convex/_generated/dataModel';
import { leaderboardRange, leaderboardType } from '@/convex/leaderboards/models';
import { useGlobalLeaderboard } from '@/hooks/useGlobalLeaderboard';
import { useLeaderboards } from '@/hooks/useLeaderboards';
import { useUser } from '@/hooks/useUser';

export default function WeeklyLeaderboardScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const { leaderboard: globalLeaderboard } = useGlobalLeaderboard(leaderboardRange.Enum.weekly);
  const {
    leaderboards: privateLeaderboards,
    isCreating,
    isJoining,
    onCreatePrivateLeaderboard,
    onJoinPrivateLeaderboard,
    onUpdateLeaderboardName,
  } = useLeaderboards(leaderboardType.Enum.private, leaderboardRange.Enum.weekly);

  const handlePresentLeaderboardActions = (leaderboardId: Id<'leaderboards'>) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Izbriši lestvico', 'Zapusti lestvico', 'Uredi ime lestvice', 'Prekliči'],
        cancelButtonIndex: 3,
        destructiveButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
        } else if (buttonIndex === 1) {
        } else if (buttonIndex === 2) {
          onUpdateLeaderboardName(leaderboardId);
        }
      }
    );
  };

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({ title: 'Tedenska lestvica' });
    }, [navigation])
  );

  return (
    <ScrollView contentContainerStyle={styles.container} contentInsetAdjustmentBehavior="automatic">
      <Card title="Globalna lestvica">
        <Leaderboard scores={globalLeaderboard?.scoresWithUsers} />
      </Card>
      <View style={styles.contentContainer}>
        <Text size="lg" weight="medium">
          Tvoje lestvice
        </Text>
        <View style={styles.privateLeaderboardsContainer}>
          {privateLeaderboards?.map((leaderboard) => (
            <Card
              key={leaderboard._id}
              onShowActions={
                leaderboard.creatorId === user?._id ? () => handlePresentLeaderboardActions(leaderboard._id) : undefined
              }
              title={leaderboard.name ?? leaderboard._id}
            >
              <Leaderboard scores={leaderboard.scores} />
            </Card>
          ))}
        </View>
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
  privateLeaderboardsContainer: {
    paddingVertical: theme.spacing[5],
  },
  actions: {
    gap: theme.spacing[3],
    paddingTop: theme.spacing[5],
  },
}));
