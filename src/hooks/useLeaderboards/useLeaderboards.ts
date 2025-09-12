import { ConvexError } from 'convex/values';
import * as Clipboard from 'expo-clipboard';
import { usePostHog } from 'posthog-react-native';
import { Alert } from 'react-native';

import { useActionSheet } from '@/context/ActionSheet';
import { usePrompt } from '@/context/Prompt';
import { type Id } from '@/convex/_generated/dataModel';
import {
  type LeaderboardWithScores,
  type LeaderboardRange,
  type LeaderboardType,
  leaderboardType,
} from '@/convex/leaderboards/models';

import {
  useCreatePrivateLeaderboardMutation,
  useDeletePrivateLeaderboardMutation,
  useJoinPrivateLeaderboardMutation,
  useLeavePrivateLeaderboardMutation,
  useUpdateLeaderboardNameMutation,
} from '../mutations';
import { useLeaderboardsQuery } from '../queries';
import { useToaster } from '../useToaster';
import { useUser } from '../useUser';

export function useLeaderboards(type: LeaderboardType, range: LeaderboardRange) {
  const { user } = useUser();
  const toaster = useToaster();
  const posthog = usePostHog();
  const actionSheet = useActionSheet();
  const prompt = usePrompt();
  const { mutate: createPrivateLeaderboard, isLoading: isCreating } = useCreatePrivateLeaderboardMutation();
  const { mutate: joinPrivateLeaderboard, isLoading: isJoining } = useJoinPrivateLeaderboardMutation();
  const { mutate: deletePrivateLeaderboard, isLoading: isDeleting } = useDeletePrivateLeaderboardMutation();
  const { mutate: leavePrivateLeaderboard, isLoading: isLeaving } = useLeavePrivateLeaderboardMutation();
  const { mutate: updateLeaderboardName, isLoading: isUpdating } = useUpdateLeaderboardNameMutation();
  const { data: leaderboards, isLoading } = useLeaderboardsQuery(
    user?._id ? { userId: user._id, type, range } : 'skip'
  );

  const handleLeaveLeaderboard = (leaderboardId: Id<'leaderboards'>) => {
    if (!user?._id) {
      return;
    }

    Alert.alert(
      'Si prepričan/a?',
      'Ko enkrat zapustiš lestvico bodo iz te lestvice izbrisani vsi tvoji pretekli rezultati.',
      [
        { isPreferred: true, style: 'cancel', text: 'Prekliči' },
        {
          isPreferred: false,
          style: 'destructive',
          text: 'Zapusti',
          onPress() {
            leavePrivateLeaderboard({ leaderboardId, userId: user._id })
              .then(() => {
                posthog.capture('leaderboards:leave', {
                  leaderboardId,
                  userId: user._id,
                  leaderboardType: leaderboardType.Enum.private,
                });
              })
              .catch(() => {
                toaster.toast('Nekaj je šlo narobe', { intent: 'error' });
              });
          },
        },
      ]
    );
  };

  const handleDeleteLeaderboard = (leaderboardId: Id<'leaderboards'>) => {
    if (!user?._id) {
      return;
    }

    Alert.alert('Si prepričan/a?', 'Ko je lestvica enkrat izbrisana je ni mogoče pridobiti nazaj.', [
      { isPreferred: true, style: 'cancel', text: 'Prekliči' },
      {
        isPreferred: false,
        style: 'destructive',
        text: 'Izbriši',
        onPress() {
          deletePrivateLeaderboard({ leaderboardId, userId: user._id })
            .then(() => {
              posthog.capture('leaderboards:delete', {
                leaderboardId,
                userId: user._id,
                leaderboardType: leaderboardType.Enum.private,
              });
            })
            .catch(() => {
              toaster.toast('Nekaj je šlo narobe.', { intent: 'error' });
            });
        },
      },
    ]);
  };

  const handleUpdateLeaderboardName = (leaderboardId: Id<'leaderboards'>) => {
    if (!user?._id) {
      return;
    }

    prompt('Ime lestvice:', '', [
      {
        text: 'Prekliči',
        isPreferred: false,
        style: 'cancel',
      },
      {
        text: 'Posodobi',
        isPreferred: true,
        onPress(leaderboardName?: string) {
          if (!leaderboardName) {
            return;
          }
          updateLeaderboardName({ leaderboardId, userId: user._id, data: { name: leaderboardName } })
            .then(() => {
              posthog.capture('leaderboards:update_name', {
                leaderboardId,
                userId: user._id,
                leaderboardType: leaderboardType.Enum.private,
              });
            })
            .catch(() => {
              toaster.toast('Nekaj je šlo narobe.', { intent: 'error' });
            });
        },
      },
    ]);
  };

  const handleJoinPrivateLeaderboard = () => {
    if (!user?._id) {
      return;
    }

    prompt('Koda:', '', [
      {
        text: 'Prekliči',
        isPreferred: false,
        style: 'cancel',
      },
      {
        text: 'Pridruži se',
        isPreferred: true,
        onPress(inviteCode?: string) {
          if (!inviteCode) {
            return;
          }

          joinPrivateLeaderboard({ inviteCode: inviteCode.toUpperCase(), userId: user._id })
            .then((leaderboard) => {
              posthog.capture('leaderboards:join', {
                leaderboardId: leaderboard._id,
                userId: user._id,
                leaderboardType: leaderboardType.Enum.private,
              });
            })
            .catch((err) => {
              if (err instanceof ConvexError) {
                if (err.data.message === 'Invalid invite code.') {
                  toaster.toast('Neveljavna koda.', { intent: 'error' });
                } else if (err.data.message === 'Already joined this leaderboard.') {
                  toaster.toast('Tej lestvici si že pridružen/a.', { intent: 'warning' });
                } else {
                  toaster.toast('Nekaj je šlo narobe.', { intent: 'error' });
                }
              } else {
                toaster.toast('Nekaj je šlo narobe.', { intent: 'error' });
              }
            });
        },
      },
    ]);
  };

  const handleCreatePrivateLeaderboard = () => {
    if (!user?._id) {
      return;
    }

    prompt('Ime lestvice:', '', [
      {
        text: 'Prekliči',
        isPreferred: false,
        style: 'cancel',
      },
      {
        text: 'Ustvari',
        isPreferred: true,
        onPress(leaderboardName?: string) {
          if (!leaderboardName) {
            return;
          }

          createPrivateLeaderboard({ userId: user._id, data: { name: leaderboardName } })
            .then((leaderboardId) => {
              posthog.capture('leaderboards:create', {
                leaderboardId,
                userId: user._id,
                leaderboardType: leaderboardType.Enum.private,
              });
            })
            .catch(() => {
              toaster.toast('Nekaj je šlo narobe.', { intent: 'error' });
            });
        },
      },
    ]);
  };

  const handleShowInviteCodeAlert = (inviteCode: string | null) => {
    if (!inviteCode) {
      return;
    }

    Alert.alert('Povabi prijatelja', `Koda: ${inviteCode}`, [
      { isPreferred: false, style: 'cancel', text: 'Zapri' },
      {
        isPreferred: true,
        style: 'default',
        text: 'Kopiraj',
        onPress() {
          Clipboard.setStringAsync(inviteCode).then(() => {
            posthog.capture('leaderboards:invite_code:copy', { leaderboardType: leaderboardType.Enum.private });
            toaster.toast('Koda kopirana', { intent: 'success' });
          });
        },
      },
    ]);
  };

  const handlePresentLeaderboardActions = (
    leaderboard: Pick<LeaderboardWithScores, '_id' | 'creatorId' | 'inviteCode' | 'name'>
  ) => {
    const isCurrentUserCreator = !!leaderboard.creatorId && leaderboard.creatorId === user?._id;
    posthog.capture('leaderboards:actions_open', {
      leaderboardId: leaderboard._id,
      userId: user?._id!,
      leaderboardType: leaderboardType.Enum.private,
    });

    actionSheet.present(
      {
        options: isCurrentUserCreator
          ? ['Izbriši lestvico', 'Uredi ime lestvice', 'Povabi prijatelja', 'Prekliči']
          : ['Zapusti lestvico', 'Povabi prijatelja', 'Prekliči'],
        cancelButtonIndex: isCurrentUserCreator ? 3 : 2,
        destructiveButtonIndex: 0,
        title: `Upravljanje lestvice "${leaderboard.name}"`,
        message: isCurrentUserCreator ? 'Si lastnik/ca te lestvice.' : 'Si pridružen/a tej lestvici.',
        disabledButtonIndices: leaderboard.inviteCode === null ? (isCurrentUserCreator ? [2] : [1]) : undefined,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          if (isCurrentUserCreator) {
            handleDeleteLeaderboard(leaderboard._id);
          } else {
            handleLeaveLeaderboard(leaderboard._id);
          }
        } else if (buttonIndex === 1) {
          if (isCurrentUserCreator) {
            handleUpdateLeaderboardName(leaderboard._id);
          } else {
            handleShowInviteCodeAlert(leaderboard.inviteCode);
          }
        } else if (buttonIndex === 2 && isCurrentUserCreator) {
          handleShowInviteCodeAlert(leaderboard.inviteCode);
        }
      }
    );
  };

  return {
    isJoining,
    isCreating,
    isLoading,
    isUpdating,
    isDeleting,
    isLeaving,
    leaderboards,
    onJoinPrivateLeaderboard: handleJoinPrivateLeaderboard,
    onCreatePrivateLeaderboard: handleCreatePrivateLeaderboard,
    onUpdateLeaderboardName: handleUpdateLeaderboardName,
    onDeleteLeaderboard: handleDeleteLeaderboard,
    onLeaveLeaderboard: handleLeaveLeaderboard,
    onPresentLeaderboardActions: handlePresentLeaderboardActions,
  };
}
