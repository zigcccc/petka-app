import { type PuzzleType } from '@/convex/puzzles/models';

import { usePuzzlesStatisticsQuery } from '../queries';
import { useUser } from '../useUser';

export function usePuzzlesStatistics(type: PuzzleType) {
  const { user } = useUser();
  const { data, isLoading, isNotFound } = usePuzzlesStatisticsQuery(user ? { userId: user._id, type } : 'skip');

  if (isLoading || isNotFound) {
    return { isLoading: true, data: null } as const;
  }

  return { isLoading: false, data } as const;
}
