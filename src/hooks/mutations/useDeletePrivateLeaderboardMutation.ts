import { api } from '@/convex/_generated/api';

import { generateUseMutationHook } from './generateUseMutationHook';

export const useDeletePrivateLeaderboardMutation = generateUseMutationHook(
  api.leaderboards.queries.deletePrivateLeaderboard
);
