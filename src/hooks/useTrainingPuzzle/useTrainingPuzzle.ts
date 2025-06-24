import { useMutation, useQuery } from 'convex/react';
import { useState, useCallback, useEffect } from 'react';

import { api } from '@/convex/_generated/api';
import { checkedLetterStatus } from '@/convex/puzzleGuessAttempts/models';

import { useToaster } from '../useToaster';
import { useUser } from '../useUser';

export function useTrainingPuzzle() {
  const { user } = useUser();
  const toaster = useToaster();
  const [isCreatingPuzzle, setIsCreatingPuzzle] = useState(false);
  const createTrainingPuzzle = useMutation(api.puzzles.queries.createTrainingPuzzle);
  const markPuzzleAsSolved = useMutation(api.puzzles.queries.markAsSolved);
  const createPuzzleGuessAttempt = useMutation(api.puzzleGuessAttempts.queries.create);
  const puzzle = useQuery(api.puzzles.queries.readUserActiveTrainingPuzzle, user?._id ? { userId: user._id } : 'skip');
  const attempts = useQuery(
    api.puzzleGuessAttempts.queries.listPuzzleAttempts,
    user?._id && puzzle?._id ? { userId: user._id, puzzleId: puzzle._id } : 'skip'
  );
  const isSolved = attempts
    ?.at(-1)
    ?.checkedLetters.every((checkedLetter) => checkedLetter.status === checkedLetterStatus.Enum.correct);
  const isFailed = attempts?.length === 6 && !isSolved;

  const handleCreatePuzzleGuessAttempt = async (attempt: string) => {
    try {
      await createPuzzleGuessAttempt({
        data: {
          userId: user?._id!,
          puzzleId: puzzle?._id!,
          attempt,
        },
      });
    } catch {
      toaster.toast('Nekaj je šlo narobe.', { intent: 'error' });
    }
  };

  const handleCreateTrainingPuzzle = useCallback(async () => {
    try {
      setIsCreatingPuzzle(true);
      await createTrainingPuzzle({ userId: user?._id! });
    } catch {
      toaster.toast('Nekaj je šlo narobe.', { intent: 'error' });
    } finally {
      setIsCreatingPuzzle(false);
    }
  }, [createTrainingPuzzle, toaster, user?._id]);

  const handleMarkPuzzleAsSolved = async () => {
    return markPuzzleAsSolved({ puzzleId: puzzle?._id!, userId: user?._id! });
  };

  useEffect(() => {
    // Puzzle query has finished but not puzzles were found - we need to create a new one!
    if (puzzle === null && !isCreatingPuzzle) {
      handleCreateTrainingPuzzle();
    }
  }, [handleCreateTrainingPuzzle, puzzle, isCreatingPuzzle]);

  return {
    attempts,
    puzzle,
    isLoading: typeof puzzle === 'undefined',
    isCreating: isCreatingPuzzle,
    isSolved,
    isFailed,
    onSubmitAttempt: handleCreatePuzzleGuessAttempt,
    onMarkAsSolved: handleMarkPuzzleAsSolved,
  };
}
