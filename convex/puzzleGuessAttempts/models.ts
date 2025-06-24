import { defineTable } from 'convex/server';
import { zodToConvex } from 'convex-helpers/server/zod';
import { z } from 'zod';

import { baseDbModel } from '../shared/models';

export const checkedLetterStatus = z.enum(['invalid', 'misplaced', 'correct']);
export type CheckedLetterStatus = z.infer<typeof checkedLetterStatus>;

export const checkedLetterModel = z.object({
  letter: z.string(),
  index: z.number().min(0).max(4),
  status: checkedLetterStatus,
});
export type CheckedLetter = z.infer<typeof checkedLetterModel>;

export const puzzleGuessAttemptModel = baseDbModel.extend({
  puzzleId: z.string(),
  userId: z.string(),
  attempt: z.string().min(5).max(5),
  checkedLetters: z.array(checkedLetterModel),
});
export type PuzzleGuessAttempt = z.infer<typeof puzzleGuessAttemptModel>;

export const createPuzzleGuessAttemptModel = z.object({
  puzzleId: z.string(),
  userId: z.string(),
  attempt: z.string().min(5).max(5),
});
export type CreatePuzzleGuessAttempt = z.infer<typeof createPuzzleGuessAttemptModel>;

export const puzzleGuessAttemptsTable = defineTable(zodToConvex(puzzleGuessAttemptModel));
