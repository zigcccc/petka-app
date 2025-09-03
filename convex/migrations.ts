import { Migrations } from '@convex-dev/migrations';

import { components, internal } from './_generated/api.js';
import { type DataModel } from './_generated/dataModel.js';

export const migrations = new Migrations<DataModel>(components.migrations);
export const run = migrations.runner();
export const runAll = migrations.runner([
  internal.migrations.setDefaultNumberOfTimesUsedOnDictonaryEntry,
  internal.migrations.backfillLeaderboardEntriesRecordedAt,
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
