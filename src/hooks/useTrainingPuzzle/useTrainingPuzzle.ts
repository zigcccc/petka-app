import * as Haptics from 'expo-haptics';
import { usePostHog } from 'posthog-react-native';
import { useCallback, useEffect } from 'react';
import { Share } from 'react-native';

import { checkedStatusToEmojiMap } from '@/constants/puzzles';
import { isAttemptCorrect } from '@/convex/puzzleGuessAttempts/helpers';
import { puzzleType } from '@/convex/puzzles/models';

import {
  useCreatePuzzleGuessAttemptMutation,
  useCreateTrainingPuzzleMutation,
  useMarkPuzzleAsSolvedMutation,
} from '../mutations';
import { useActiveTrainingPuzzleQuery, usePuzzleAttemptsQuery } from '../queries';
import { useToaster } from '../useToaster';
import { useUser } from '../useUser';

export function useTrainingPuzzle() {
  const posthog = usePostHog();
  const { user } = useUser();
  const toaster = useToaster();
  const { mutate: createTrainingPuzzle, isLoading: isCreatingPuzzle } = useCreateTrainingPuzzleMutation();
  const { mutate: markPuzzleAsSolved, isLoading: isMarkingAsSolved } = useMarkPuzzleAsSolvedMutation();
  const { mutate: createPuzzleGuessAttempt } = useCreatePuzzleGuessAttemptMutation();
  const { data: puzzle, isLoading } = useActiveTrainingPuzzleQuery(user?._id ? { userId: user._id } : 'skip');
  const { data: attempts } = usePuzzleAttemptsQuery(
    user?._id && puzzle?._id ? { userId: user?._id, puzzleId: puzzle?._id } : 'skip'
  );

  const isSolved = isAttemptCorrect(attempts?.at(-1));
  const isFailed = attempts?.length === 6 && !isSolved;
  const isDone = isSolved || isFailed;

  const handleCreatePuzzleGuessAttempt = async (attempt: string, attemptIdx: number) => {
    try {
      const { isCorrect } = await createPuzzleGuessAttempt({
        data: { userId: user?._id!, puzzleId: puzzle?._id!, attempt },
      });

      if (isCorrect) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        markPuzzleAsSolved({ userId: user?._id!, puzzleId: puzzle?._id! });
      } else if (attemptIdx === 5) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        markPuzzleAsSolved({ userId: user?._id!, puzzleId: puzzle?._id! });
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {
      toaster.toast('Nekaj je šlo narobe.', { intent: 'error' });
    }
  };

  const handleCreateTrainingPuzzle = useCallback(async () => {
    try {
      const puzzleId = await createTrainingPuzzle({ userId: user?._id! });
      posthog.capture('puzzle:created', { puzzleId, userId: user?._id!, type: puzzleType.Enum.training });
    } catch {
      toaster.toast('Nekaj je šlo narobe.', { intent: 'error' });
    }
  }, [createTrainingPuzzle, posthog, toaster, user?._id]);

  const handleMarkPuzzleAsSolved = async () => {
    await markPuzzleAsSolved({ puzzleId: puzzle?._id!, userId: user?._id! });
    posthog.capture('puzzle:solved', { puzzleId: puzzle?._id!, userId: user?._id!, type: puzzleType.Enum.training });
  };

  const handleSharePuzzleResults = useCallback(async () => {
    if (!attempts) {
      return;
    }

    const messageTitle = `Petka (trening) - ${isFailed ? 'X' : attempts.length}/6`;
    const mappedAttempts = attempts
      .map((attempt) => attempt.checkedLetters.map(({ status }) => checkedStatusToEmojiMap.get(status)).join(''))
      .join('\n');

    await Share.share({ message: `${messageTitle}\n\n${mappedAttempts}` });
  }, [attempts, isFailed]);

  useEffect(() => {
    // Puzzle query has finished but no puzzle was found - we need to create a new one!
    if (puzzle === null && !isCreatingPuzzle) {
      handleCreateTrainingPuzzle();
    }
  }, [handleCreateTrainingPuzzle, puzzle, isCreatingPuzzle]);

  return {
    attempts,
    puzzle,
    isLoading,
    isCreating: isCreatingPuzzle,
    isSolved,
    isFailed,
    isDone,
    isMarkingAsSolved,
    onCreateTrainingPuzzle: handleCreateTrainingPuzzle,
    onSubmitAttempt: handleCreatePuzzleGuessAttempt,
    onMarkAsSolved: handleMarkPuzzleAsSolved,
    onShareResults: handleSharePuzzleResults,
  };
}
