import { api } from '@/convex/_generated/api';

import { generateUseMutationHook } from './generateUseMutationHook';

export const useLeavePrivateLeaderboardMutation = generateUseMutationHook(
  api.leaderboards.queries.leavePrivateLeaderboard
);
