import * as Haptics from 'expo-haptics';
import { usePostHog } from 'posthog-react-native';
import { useCallback } from 'react';
import { Share } from 'react-native';

import { checkedStatusToEmojiMap } from '@/constants/puzzles';
import { isAttemptCorrect } from '@/convex/puzzleGuessAttempts/helpers';
import { puzzleType } from '@/convex/puzzles/models';
import { getDateObjectFromPuzzle } from '@/utils/puzzles';

import { useCreatePuzzleGuessAttemptMutation, useMarkPuzzleAsSolvedMutation } from '../mutations';
import { useActiveDailyPuzzleQuery, usePuzzleAttemptsQuery } from '../queries';
import { useToaster } from '../useToaster';
import { useUser } from '../useUser';

export function useDailyPuzzle() {
  const { user } = useUser();
  const posthog = usePostHog();
  const toaster = useToaster();
  const { mutate: markPuzzleAsSolved } = useMarkPuzzleAsSolvedMutation();
  const { mutate: createPuzzleGuessAttempt } = useCreatePuzzleGuessAttemptMutation();
  const { data: puzzle, isLoading } = useActiveDailyPuzzleQuery({});
  const { data: attempts } = usePuzzleAttemptsQuery(
    user?._id && puzzle?._id ? { userId: user._id, puzzleId: puzzle._id } : 'skip'
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
        markPuzzleAsSolved({ puzzleId: puzzle?._id!, userId: user?._id! });
        posthog.capture('puzzle:solved', { puzzleId: puzzle?._id!, userId: user?._id!, type: puzzleType.Enum.daily });
      } else if (attemptIdx === 5) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        markPuzzleAsSolved({ puzzleId: puzzle?._id!, userId: user?._id! });
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {
      toaster.toast('Nekaj je šlo narobe.', { intent: 'error' });
    }
  };

  const handleSharePuzzleResults = useCallback(async () => {
    if (!puzzle || !attempts) {
      return;
    }

    const dateObj = getDateObjectFromPuzzle(puzzle);
    const messageTitle = `Petka (${dateObj.format('DD. MM. YYYY')}) - ${isFailed ? 'X' : attempts.length}/6`;
    const mappedAttempts = attempts
      .map((attempt) => attempt.checkedLetters.map(({ status }) => checkedStatusToEmojiMap.get(status)).join(''))
      .join('\n');

    await Share.share({ message: `${messageTitle}\n\n${mappedAttempts}` });
  }, [puzzle, attempts, isFailed]);

  return {
    attempts,
    puzzle,
    isLoading,
    isSolved,
    isFailed,
    isDone,
    onSubmitAttempt: handleCreatePuzzleGuessAttempt,
    onShareResults: handleSharePuzzleResults,
  };
}
