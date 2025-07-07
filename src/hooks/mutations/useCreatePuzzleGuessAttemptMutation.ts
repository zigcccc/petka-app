import { api } from '@/convex/_generated/api';

import { generateUseMutationHook } from './generateUseMutationHook';

export const useCreatePuzzleGuessAttemptMutation = generateUseMutationHook(api.puzzleGuessAttempts.queries.create);
