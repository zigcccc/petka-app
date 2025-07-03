import { useConvex, useMutation, useQuery } from 'convex/react';
import { useRef } from 'react';

import { api } from '@/convex/_generated/api';
import { isAttemptCorrect } from '@/convex/puzzleGuessAttempts/helpers';

import { useToaster } from '../useToaster';
import { useUser } from '../useUser';

export function useDailyPuzzle() {
  const { user } = useUser();
  const convex = useConvex();
  const toaster = useToaster();
  const markPuzzleAsSolved = useMutation(api.puzzles.queries.markAsSolved);
  const createPuzzleGuessAttempt = useMutation(api.puzzleGuessAttempts.queries.create);
  const timestampRef = useRef(Date.now());
  const puzzle = useQuery(api.puzzles.queries.readActiveDailyPuzzle, { timestamp: timestampRef.current });
  const attempts = useQuery(
    api.puzzleGuessAttempts.queries.listPuzzleAttempts,
    user?._id && puzzle?._id ? { userId: user._id, puzzleId: puzzle._id } : 'skip'
  );
  const isSolved = isAttemptCorrect(attempts?.at(-1));
  const isFailed = attempts?.length === 6 && !isSolved;

  const handleCreatePuzzleGuessAttempt = async (attempt: string) => {
    try {
      const attemptId = await createPuzzleGuessAttempt({
        data: {
          userId: user?._id!,
          puzzleId: puzzle?._id!,
          attempt,
        },
      });
      const createdAttempt = await convex.query(api.puzzleGuessAttempts.queries.read, { id: attemptId });
      if (createdAttempt && isAttemptCorrect(createdAttempt)) {
        await markPuzzleAsSolved({ puzzleId: puzzle?._id!, userId: user?._id! });
      }
    } catch {
      toaster.toast('Nekaj je šlo narobe.', { intent: 'error' });
    }
  };

  return {
    attempts,
    puzzle,
    isLoading: typeof puzzle === 'undefined',
    isSolved,
    isFailed,
    onSubmitAttempt: handleCreatePuzzleGuessAttempt,
  };
}
