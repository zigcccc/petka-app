import { defineSchema } from 'convex/server';

import { dictionaryEntriesTable } from './dictionary/models';
import { leaderboardEntriesTable } from './leaderboardEntries/model';
import { leaderboardsTable } from './leaderboards/models';
import { puzzleGuessAttemptsTable } from './puzzleGuessAttempts/models';
import { puzzlesTable } from './puzzles/models';
import { usersTable } from './users/models';

export default defineSchema({
  dictionaryEntries: dictionaryEntriesTable
    .index('dictionary_word', ['word'])
    .index('dictionary_frequency', ['frequency'])
    .index('dictionary_word_frequency', ['word', 'frequency'])
    .searchIndex('dictionaryEntry_word', { searchField: 'word' }),
  leaderboards: leaderboardsTable.index('by_invite_code', ['inviteCode']).index('by_type', ['type']),
  leaderboardEntries: leaderboardEntriesTable
    .index('by_leaderboard', ['leaderboardId'])
    .index('by_leaderboard_user', ['leaderboardId', 'userId']),
  puzzles: puzzlesTable
    .index('by_puzzles_solution', ['solution'])
    .index('by_creator_id', ['creatorId'])
    .index('by_type', ['type'])
    .index('by_type_creator', ['creatorId', 'type']),
  puzzleGuessAttempts: puzzleGuessAttemptsTable
    .index('by_user', ['userId'])
    .index('by_puzzle', ['puzzleId'])
    .index('by_user_puzzle', ['userId', 'puzzleId']),
  users: usersTable.index('users_nickname', ['nickname']),
});
