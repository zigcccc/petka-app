import { Migrations } from '@convex-dev/migrations';

import { components, internal } from './_generated/api.js';
import { type DataModel } from './_generated/dataModel.js';
import { isAttemptCorrect } from './puzzleGuessAttempts/helpers.js';
import { checkedLetterStatus } from './puzzleGuessAttempts/models.js';
import { puzzleType } from './puzzles/models.js';

export const migrations = new Migrations<DataModel>(components.migrations);
export const run = migrations.runner();
export const runAll = migrations.runner([
  internal.migrations.setDefaultNumberOfTimesUsedOnDictonaryEntry,
  internal.migrations.backfillLeaderboardEntriesRecordedAt,
  internal.migrations.backfillUserPuzzleStatistics,
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

export const backfillUserPuzzleStatistics = migrations.define({
  table: 'users',
  async migrateOne(ctx, doc) {
    for (const type of [puzzleType.Enum.daily, puzzleType.Enum.training]) {
      const existingUserStatistics = await ctx.db
        .query('userPuzzleStatistics')
        .withIndex('by_user_puzzle_type', (q) => q.eq('userId', doc._id).eq('puzzleType', type))
        .first();
      if (existingUserStatistics) {
        return;
      }

      const basePuzzlesQuery =
        type === puzzleType.Enum.daily
          ? ctx.db.query('puzzles').withIndex('by_type', (q) => q.eq('type', type))
          : ctx.db.query('puzzles').withIndex('by_type_creator', (q) => q.eq('type', type).eq('creatorId', doc._id));
      const allPuzzles = await basePuzzlesQuery.order('desc').collect();
      const allPuzzlesAttempts = await Promise.all(
        allPuzzles.map((puzzle) =>
          ctx.db
            .query('puzzleGuessAttempts')
            .withIndex('by_user_puzzle', (q) => q.eq('userId', doc._id).eq('puzzleId', puzzle._id))
            .order('asc')
            .collect()
        )
      );
      const startedPuzzleAttempts = allPuzzlesAttempts.filter((attempts) => attempts.length > 0);
      const failedPuzzlesAttempts = allPuzzlesAttempts.filter(
        (attempts) => attempts.length === 6 && !isAttemptCorrect(attempts.at(-1))
      );
      const numOfSolvedPuzzles = startedPuzzleAttempts.length - (failedPuzzlesAttempts?.length ?? 0);
      const attemptsDistribution: Record<'_1' | '_2' | '_3' | '_4' | '_5' | '_6', number> = {
        _1: 0,
        _2: 0,
        _3: 0,
        _4: 0,
        _5: 0,
        _6: 0,
      };

      let currentStreak = 0;
      const streaks = [];

      for (const attempts of allPuzzlesAttempts) {
        const numOfAttempts = attempts.length;
        const lastAttempt = attempts.at(-1);
        const isLastAttemptCorrect = lastAttempt?.checkedLetters.every(
          (checkedLetter) => checkedLetter.status === checkedLetterStatus.Enum.correct
        );

        if (isLastAttemptCorrect) {
          currentStreak = currentStreak + 1;
        } else {
          streaks.push(currentStreak);
          currentStreak = 0;
        }

        if (numOfAttempts > 0 && isLastAttemptCorrect) {
          const distributionKey = `_${numOfAttempts}` as '_1' | '_2' | '_3' | '_4' | '_5' | '_6';
          attemptsDistribution[distributionKey] = (attemptsDistribution[distributionKey] ?? 0) + 1;
        }
      }

      streaks.push(currentStreak);
      const maxStreak = Math.max(...streaks);

      await ctx.db.insert('userPuzzleStatistics', {
        currentStreak: streaks[0],
        distribution: attemptsDistribution,
        maxStreak,
        puzzleType: type,
        totalFailed: failedPuzzlesAttempts?.length ?? 0,
        totalPlayed: startedPuzzleAttempts?.length ?? 0,
        totalWon: numOfSolvedPuzzles,
        userId: doc._id,
      });
    }
  },
});
