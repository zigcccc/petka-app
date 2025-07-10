import { api } from '@/convex/_generated/api';

import { generateUseMutationHook } from './generateUseMutationHook';

export const useUpdateLeaderboardNameMutation = generateUseMutationHook(api.leaderboards.queries.updateLeaderboardName);
