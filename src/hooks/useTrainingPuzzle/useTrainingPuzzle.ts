import { usePostHog } from 'posthog-react-native';
import { useCallback, useEffect } from 'react';

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

  const handleCreatePuzzleGuessAttempt = async (attempt: string) => {
    try {
      await createPuzzleGuessAttempt({ data: { userId: user?._id!, puzzleId: puzzle?._id!, attempt } });
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
    isMarkingAsSolved,
    onSubmitAttempt: handleCreatePuzzleGuessAttempt,
    onMarkAsSolved: handleMarkPuzzleAsSolved,
  };
}
