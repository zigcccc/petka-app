import { api } from '@/convex/_generated/api';

import { generateUseQueryHook } from './generateUseQueryHook';

export const usePuzzleAttemptsQuery = generateUseQueryHook(api.puzzleGuessAttempts.queries.listPuzzleAttempts);
