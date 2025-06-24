import { useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { type PuzzleType } from '@/convex/puzzles/models';

import { useUser } from '../useUser';

export function usePuzzlesStatistics(type: PuzzleType) {
  const { user } = useUser();
  const stats = useQuery(api.puzzles.queries.readUserPuzzlesStatistics, user ? { userId: user._id, type } : 'skip');

  if (!stats) {
    return {
      isLoading: true,
      data: null,
    } as const;
  }

  return {
    isLoading: false,
    data: stats,
  } as const;
}
