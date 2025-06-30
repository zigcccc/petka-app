import { useMutation, useQuery } from 'convex/react';
import { ConvexError } from 'convex/values';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';

import { api } from '@/convex/_generated/api';
import { type LeaderboardRange, type LeaderboardType } from '@/convex/leaderboards/models';

import { useToaster } from '../useToaster';
import { useUser } from '../useUser';

export function useLeaderboards(type: LeaderboardType, range: LeaderboardRange) {
  const { user } = useUser();
  const toaster = useToaster();
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const timestampRef = useRef(Date.now());
  const createPrivateLeaderboard = useMutation(api.leaderboards.queries.createPrivateLeaderboard);
  const joinPrivateLeaderboard = useMutation(api.leaderboards.queries.joinPrivateLeaderboard);
  const leaderboards = useQuery(
    api.leaderboards.queries.list,
    user?._id ? { userId: user._id, type, range, timestamp: timestampRef.current } : 'skip'
  );

  const handleJoinPrivateLeaderboard = async () => {
    if (!user?._id) {
      return;
    }

    setIsJoining(true);

    Alert.prompt('Koda:', '', [
      {
        text: 'Prekliči',
        isPreferred: false,
        style: 'cancel',
        onPress() {
          setIsJoining(false);
        },
      },
      {
        text: 'Pridruži se',
        isPreferred: true,
        async onPress(inviteCode) {
          if (!inviteCode) {
            setIsJoining(false);
            return;
          }

          try {
            await joinPrivateLeaderboard({ inviteCode: inviteCode.toUpperCase(), userId: user._id });
          } catch (err) {
            if (err instanceof ConvexError) {
              if (err.data.message === 'Invalid invite code.') {
                toaster.toast('Neveljavna koda.', { intent: 'error' });
              } else if (err.data.message === 'Already joined this leaderboard.') {
                toaster.toast('Tej lestivici si že pridružen/a.', { intent: 'warning' });
              } else {
                toaster.toast('Nekaj je šlo narobe.', { intent: 'error' });
              }
            } else {
              toaster.toast('Nekaj je šlo narobe.', { intent: 'error' });
            }
          } finally {
            setIsJoining(false);
          }
        },
      },
    ]);
  };

  const handleCreatePrivateLeaderboard = async () => {
    if (!user?._id) {
      return;
    }

    setIsCreating(true);

    Alert.prompt('Ime lestvice:', '', [
      {
        text: 'Prekliči',
        isPreferred: false,
        style: 'cancel',
        onPress() {
          setIsCreating(false);
        },
      },
      {
        text: 'Ustvari',
        isPreferred: true,
        async onPress(leaderboardName) {
          if (!leaderboardName) {
            setIsCreating(false);
            return;
          }
          try {
            await createPrivateLeaderboard({ userId: user._id, data: { name: leaderboardName } });
          } catch {
            toaster.toast('Nekaj je šlo narobe.', { intent: 'error' });
          } finally {
            setIsCreating(false);
          }
        },
      },
    ]);
  };

  return {
    isJoining,
    isCreating,
    isLoading: typeof leaderboards === 'undefined',
    leaderboards,
    onJoinPrivateLeaderboard: handleJoinPrivateLeaderboard,
    onCreatePrivateLeaderboard: handleCreatePrivateLeaderboard,
  };
}
