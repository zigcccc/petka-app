import { type LeaderboardRange } from '@/convex/leaderboards/models';

import { useGlobalLeaderboardQuery } from '../queries';
import { useUser } from '../useUser';

export function useGlobalLeaderboard(range: LeaderboardRange) {
  const { user } = useUser();
  return useGlobalLeaderboardQuery(user?._id ? { range, userId: user._id } : 'skip');
}
