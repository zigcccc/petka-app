import { useMemo } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/components/ui';
import { type PresenceState } from '@/hooks/presence';
import { usePlural } from '@/hooks/usePlural';

type Props = {
  presence: PresenceState[];
};

export function DailyPuzzleUsersPresence({ presence }: Readonly<Props>) {
  const onlineUsers = useMemo(() => presence.filter((state) => !!state.userId && state.online), [presence]);
  const numItemsToDisplay = Math.min(onlineUsers.length, 4);

  const currentlyPlayingText = usePlural(onlineUsers.length, {
    one: 'uporabnik igra',
    two: 'uporabnika igrata',
    few: 'uporabniki igrajo',
    many: 'uporabnikov igra',
  });

  const usersToDisplay = useMemo(() => {
    return onlineUsers.slice(0, numItemsToDisplay);
  }, [numItemsToDisplay, onlineUsers]);

  if (onlineUsers.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.badgesContainer}>
        {usersToDisplay.map((state, idx) => (
          <View key={state.userId} style={styles.badge(idx)}>
            <Text size="xs" style={styles.badgeText} weight="bold">
              {state.userId.charAt(0)}
            </Text>
          </View>
        ))}
        {onlineUsers.length > numItemsToDisplay && (
          <View style={styles.badge(numItemsToDisplay)}>
            <Text size="xs" style={styles.badgeText} weight="bold">
              +{onlineUsers.length - numItemsToDisplay}
            </Text>
          </View>
        )}
      </View>

      <Text size="sm" weight="regular">
        {onlineUsers.length} {currentlyPlayingText} dnevni izziv 🧠
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingVertical: theme.spacing[7],
    gap: theme.spacing[1],
  },
  badgesContainer: {
    flexDirection: 'row',
    transform: [{ translateX: -4 }],
  },
  badge: (idx: number) => ({
    borderRadius: 16,
    width: 32,
    height: 32,
    backgroundColor: theme.colors.grey[20],
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -8 * idx }],
    zIndex: idx * -1,
    borderWidth: 2,
    borderColor: theme.colors.white,
  }),
  badgeText: {
    textTransform: 'uppercase',
  },
}));
