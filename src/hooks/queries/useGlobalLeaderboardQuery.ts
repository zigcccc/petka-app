import { api } from '@/convex/_generated/api';

import { generateUseQueryHookWithTimestampArg } from './generateUseQueryHook';

export const useGlobalLeaderboardQuery = generateUseQueryHookWithTimestampArg(
  api.leaderboards.queries.readGlobalLeaderboard
);
