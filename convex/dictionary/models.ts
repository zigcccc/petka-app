import { defineTable } from 'convex/server';
import { zodToConvex } from 'convex-helpers/server/zod';
import { z } from 'zod';

import { baseDbModel } from '../shared/models';

export const dictionaryEntryModel = baseDbModel.extend({
  frequency: z.number(),
  word: z.string(),
});
export type DictionaryEntry = z.infer<typeof dictionaryEntryModel>;

export const dictionaryEntriesTable = defineTable(zodToConvex(dictionaryEntryModel));
