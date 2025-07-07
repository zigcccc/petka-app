import { api } from '@/convex/_generated/api';

import { generateUseQueryHook } from './generateUseQueryHook';

export const usePuzzlesStatisticsQuery = generateUseQueryHook(api.puzzles.queries.readUserPuzzlesStatistics);
