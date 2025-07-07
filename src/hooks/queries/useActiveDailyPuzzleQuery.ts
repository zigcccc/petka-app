import { api } from '@/convex/_generated/api';

import { generateUseQueryHookWithTimestampArg } from './generateUseQueryHook';

export const useActiveDailyPuzzleQuery = generateUseQueryHookWithTimestampArg(
  api.puzzles.queries.readActiveDailyPuzzle
);
