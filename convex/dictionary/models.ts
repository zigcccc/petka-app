import { defineTable } from 'convex/server';
import { zodToConvex } from 'convex-helpers/server/zod';
import { z } from 'zod';

import { getBaseDbModel } from '../shared/models';

export const dictionaryEntryModel = getBaseDbModel('dictionaryEntries').extend({
  frequency: z.number(),
  word: z.string(),
  numOfTimesUsed: z.number(),
  explanation: z.string().optional(),
});
export type DictionaryEntry = z.infer<typeof dictionaryEntryModel>;

export const dictionaryEntriesTable = defineTable(zodToConvex(dictionaryEntryModel));
