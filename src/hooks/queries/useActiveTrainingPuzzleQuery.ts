import { api } from '@/convex/_generated/api';

import { generateUseQueryHook } from './generateUseQueryHook';

export const useActiveTrainingPuzzleQuery = generateUseQueryHook(api.puzzles.queries.readUserActiveTrainingPuzzle);
