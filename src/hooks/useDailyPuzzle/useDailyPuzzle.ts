import { usePostHog } from 'posthog-react-native';

import { isAttemptCorrect } from '@/convex/puzzleGuessAttempts/helpers';
import { puzzleType } from '@/convex/puzzles/models';

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

  const handleCreatePuzzleGuessAttempt = async (attempt: string) => {
    try {
      const { isCorrect } = await createPuzzleGuessAttempt({
        data: {
          userId: user?._id!,
          puzzleId: puzzle?._id!,
          attempt,
        },
      });

      if (isCorrect) {
        markPuzzleAsSolved({ puzzleId: puzzle?._id!, userId: user?._id! });
        posthog.capture('puzzle:solved', { puzzleId: puzzle?._id!, userId: user?._id!, type: puzzleType.Enum.daily });
      }
    } catch {
      toaster.toast('Nekaj je šlo narobe.', { intent: 'error' });
    }
  };

  return {
    attempts,
    puzzle,
    isLoading,
    isSolved,
    isFailed,
    onSubmitAttempt: handleCreatePuzzleGuessAttempt,
  };
}
