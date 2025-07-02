import { useMutation, useQuery } from 'convex/react';
import { ConvexError } from 'convex/values';
import * as Clipboard from 'expo-clipboard';
import { useRef, useState } from 'react';
import { ActionSheetIOS, Alert } from 'react-native';

import { api } from '@/convex/_generated/api';
import { type Id } from '@/convex/_generated/dataModel';
import { type LeaderboardWithScores, type LeaderboardRange, type LeaderboardType } from '@/convex/leaderboards/models';

import { useToaster } from '../useToaster';
import { useUser } from '../useUser';

export function useLeaderboards(type: LeaderboardType, range: LeaderboardRange) {
  const { user } = useUser();
  const toaster = useToaster();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const timestampRef = useRef(Date.now());
  const createPrivateLeaderboard = useMutation(api.leaderboards.queries.createPrivateLeaderboard);
  const joinPrivateLeaderboard = useMutation(api.leaderboards.queries.joinPrivateLeaderboard);
  const deletePrivateLeaderboard = useMutation(api.leaderboards.queries.deletePrivateLeaderboard);
  const leavePrivateLeaderboard = useMutation(api.leaderboards.queries.leavePrivateLeadeboard);
  const updateLeaderboardName = useMutation(api.leaderboards.queries.updateLeaderboardName);
  const leaderboards = useQuery(
    api.leaderboards.queries.list,
    user?._id ? { userId: user._id, type, range, timestamp: timestampRef.current } : 'skip'
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
            setIsLeaving(true);

            leavePrivateLeaderboard({ leaderboardId, userId: user._id })
              .catch(() => {
                toaster.toast('Nekaj je šlo narobe', { intent: 'error' });
              })
              .finally(() => setIsLeaving(false));
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
          setIsDeleting(true);

          deletePrivateLeaderboard({ leaderboardId, userId: user._id })
            .catch(() => {
              toaster.toast('Nekaj je šlo narobe.', { intent: 'error' });
            })
            .finally(() => {
              setIsDeleting(false);
            });
        },
      },
    ]);
  };

  const handleUpdateLeaderboardName = (leaderboardId: Id<'leaderboards'>) => {
    if (!user?._id) {
      return;
    }

    setIsUpdating(true);

    Alert.prompt('Ime lestvice:', '', [
      {
        text: 'Prekliči',
        isPreferred: false,
        style: 'cancel',
        onPress() {
          setIsUpdating(false);
        },
      },
      {
        text: 'Posodobi',
        isPreferred: true,
        onPress(leaderboardName) {
          if (!leaderboardName) {
            setIsUpdating(false);
            return;
          }
          updateLeaderboardName({ leaderboardId, userId: user._id, data: { name: leaderboardName } })
            .catch(() => {
              toaster.toast('Nekaj je šlo narobe.', { intent: 'error' });
            })
            .finally(() => {
              setIsUpdating(false);
            });
        },
      },
    ]);
  };

  const handleJoinPrivateLeaderboard = () => {
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
        onPress(inviteCode) {
          if (!inviteCode) {
            setIsJoining(false);
            return;
          }

          joinPrivateLeaderboard({ inviteCode: inviteCode.toUpperCase(), userId: user._id })
            .catch((err) => {
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
            })
            .finally(() => {
              setIsJoining(false);
            });
        },
      },
    ]);
  };

  const handleCreatePrivateLeaderboard = () => {
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
        onPress(leaderboardName) {
          if (!leaderboardName) {
            setIsCreating(false);
            return;
          }

          createPrivateLeaderboard({ userId: user._id, data: { name: leaderboardName } })
            .catch(() => {
              toaster.toast('Nekaj je šlo narobe.', { intent: 'error' });
            })
            .finally(() => {
              setIsCreating(false);
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

    ActionSheetIOS.showActionSheetWithOptions(
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
    isLoading: typeof leaderboards === 'undefined',
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
