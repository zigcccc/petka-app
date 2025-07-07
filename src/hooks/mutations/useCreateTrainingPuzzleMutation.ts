import { api } from '@/convex/_generated/api';

import { generateUseMutationHook } from './generateUseMutationHook';

export const useCreateTrainingPuzzleMutation = generateUseMutationHook(api.puzzles.queries.createTrainingPuzzle);
