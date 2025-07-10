import { api } from '@/convex/_generated/api';

import { generateUseMutationHook } from './generateUseMutationHook';

export const useJoinPrivateLeaderboardMutation = generateUseMutationHook(
  api.leaderboards.queries.joinPrivateLeaderboard
);
