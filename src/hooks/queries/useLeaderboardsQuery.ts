import { api } from '@/convex/_generated/api';

import { generateUseQueryHookWithTimestampArg } from './generateUseQueryHook';

export const useLeaderboardsQuery = generateUseQueryHookWithTimestampArg(api.leaderboards.queries.list);
