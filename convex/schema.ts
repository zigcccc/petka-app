import { defineSchema } from 'convex/server';

import { dictionaryEntriesTable } from './dictionary/models';
import { leaderboardEntriesTable } from './leaderboardEntries/model';
import { leaderboardsTable } from './leaderboards/models';
import { puzzleGuessAttemptsTable } from './puzzleGuessAttempts/models';
import { puzzlesTable } from './puzzles/models';
import { userPuzzleStatisticsTable } from './userPuzzleStatistics/models';
import { usersTable } from './users/models';

export default defineSchema({
  dictionaryEntries: dictionaryEntriesTable.index('dictionary_word', ['word']),
  leaderboards: leaderboardsTable
    .index('by_invite_code', ['inviteCode'])
    .index('by_type', ['type'])
    .index('by_creator_id', ['creatorId']),
  leaderboardEntries: leaderboardEntriesTable
    .index('by_user', ['userId'])
    .index('by_leaderboard', ['leaderboardId'])
    .index('by_leaderboard_user', ['leaderboardId', 'userId'])
    .index('by_leaderboard_recordedAt', ['leaderboardId', 'recordedAt']),
  puzzles: puzzlesTable
    .index('by_type', ['type'])
    .index('by_type_creator', ['type', 'creatorId'])
    .index('by_type_year_month_day', ['type', 'year', 'month', 'day']),
  puzzleGuessAttempts: puzzleGuessAttemptsTable
    .index('by_user', ['userId'])
    .index('by_user_puzzle', ['userId', 'puzzleId']),
  userPuzzleStatistics: userPuzzleStatisticsTable.index('by_user_puzzle_type', ['userId', 'puzzleType']),
  users: usersTable.index('users_nickname', ['nickname']),
});
