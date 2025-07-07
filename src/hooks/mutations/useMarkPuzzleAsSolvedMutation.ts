import { api } from '@/convex/_generated/api';

import { generateUseMutationHook } from './generateUseMutationHook';

export const useMarkPuzzleAsSolvedMutation = generateUseMutationHook(api.puzzles.queries.markAsSolved);
