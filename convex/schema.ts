import { defineSchema } from 'convex/server';

import { dictionaryEntriesTable } from './dictionary/models';
import { puzzlesTable } from './puzzles/models';
import { usersTable } from './users/models';

export default defineSchema({
  dictionaryEntries: dictionaryEntriesTable
    .index('dictionary_word', ['word'])
    .index('dictionary_frequency', ['frequency'])
    .index('dictionary_word_frequency', ['word', 'frequency'])
    .searchIndex('dictionaryEntry_word', { searchField: 'word' }),
  puzzles: puzzlesTable.index('puzzles_solution', ['solution']),
  users: usersTable.index('users_nickname', ['nickname']),
});
