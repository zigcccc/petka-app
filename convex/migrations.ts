import { Migrations } from '@convex-dev/migrations';

import { components, internal } from './_generated/api.js';
import type { DataModel } from './_generated/dataModel.js';
import { getMembership } from './leaderboardMembers/helpers';

export const migrations = new Migrations<DataModel>(components.migrations);
export const run = migrations.runner();
export const runAll = migrations.runner([
  internal.migrations.setDefaultNumberOfTimesUsedOnDictonaryEntry,
  internal.migrations.backfillLeaderboardEntriesRecordedAt,
  internal.migrations.unsetPuzzleSolvedBy,
  internal.migrations.backfillLeaderboardMembers,
]);

export const setDefaultNumberOfTimesUsedOnDictonaryEntry = migrations.define({
  table: 'dictionaryEntries',
  async migrateOne(ctx, doc) {
    if (!doc.numOfTimesUsed) {
      await ctx.db.patch(doc._id, { numOfTimesUsed: 0 });
    }
  },
});

export const backfillLeaderboardEntriesRecordedAt = migrations.define({
  table: 'leaderboardEntries',
  async migrateOne(ctx, doc) {
    if (!doc.recordedAt) {
      await ctx.db.patch(doc._id, { recordedAt: doc._creationTime });
    }
  },
});

// `solvedBy` grew by one user ID per solve, making the daily puzzle doc huge and re-firing every subscribed
// `readActiveDailyPuzzle` on every solve. It is no longer written; drop it from existing docs.
export const unsetPuzzleSolvedBy = migrations.define({
  table: 'puzzles',
  async migrateOne(ctx, doc) {
    if (doc.solvedBy !== undefined) {
      await ctx.db.patch(doc._id, { solvedBy: undefined });
    }
  },
});

// Creates a `leaderboardMembers` row for every user in a private leaderboard's `users` array, with `totalScore`
// summed from the member's existing entries. Idempotent: members that already have a row are skipped.
export const backfillLeaderboardMembers = migrations.define({
  table: 'leaderboards',
  async migrateOne(ctx, doc) {
    if (doc.type !== 'private') return;

    for (const rawUserId of doc.users ?? []) {
      const userId = ctx.db.normalizeId('users', rawUserId);
      if (!userId || !(await ctx.db.get(userId))) continue;
      if (await getMembership(ctx, doc._id, userId)) continue;

      let totalScore = 0;
      const entriesQuery = ctx.db
        .query('leaderboardEntries')
        .withIndex('by_leaderboard_user', (q) => q.eq('leaderboardId', doc._id).eq('userId', userId));
      for await (const entry of entriesQuery) {
        totalScore += entry.score;
      }

      await ctx.db.insert('leaderboardMembers', { leaderboardId: doc._id, userId, totalScore });
    }
  },
});
