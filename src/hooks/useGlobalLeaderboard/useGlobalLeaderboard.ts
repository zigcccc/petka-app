import { useQuery } from 'convex/react';
import { useRef } from 'react';

import { api } from '@/convex/_generated/api';
import { type LeaderboardRange } from '@/convex/leaderboards/models';

import { useUser } from '../useUser';

export function useGlobalLeaderboard(range: LeaderboardRange) {
  const { user } = useUser();
  const timestampRef = useRef(Date.now());
  const leaderboard = useQuery(
    api.leaderboards.queries.readGlobalLeaderboard,
    user?._id ? { range, userId: user._id, timestamp: timestampRef.current } : 'skip'
  );

  return {
    isLoading: typeof leaderboard === 'undefined',
    leaderboard,
  };
}
