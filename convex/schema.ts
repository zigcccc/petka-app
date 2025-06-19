import { defineSchema } from 'convex/server';

import { dictionaryEntriesTable } from './dictionary/models';
import { usersTable } from './users/models';

export default defineSchema({
  dictionaryEntries: dictionaryEntriesTable
    .index('dictionary_word', ['word'])
    .index('dictionary_frequency', ['frequency'])
    .index('dictionary_word_frequency', ['word', 'frequency'])
    .searchIndex('dictionaryEntry_word', { searchField: 'word' }),
  users: usersTable.index('users_nickname', ['nickname']),
});
