import { api } from '@/convex/_generated/api';

import { generateUseMutationHook } from './generateUseMutationHook';

export const useCreatePrivateLeaderboardMutation = generateUseMutationHook(
  api.leaderboards.queries.createPrivateLeaderboard
);
