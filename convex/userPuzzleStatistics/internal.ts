import { v } from 'convex/values';

import { internal } from '../_generated/api';
import { internalAction, internalMutation, internalQuery } from '../_generated/server';
import { isAttemptCorrect } from '../puzzleGuessAttempts/helpers';
import { checkedLetterStatus } from '../puzzleGuessAttempts/models';
import { puzzleType } from '../puzzles/models';

export const readAllUsersQuery = internalQuery({
  async handler(ctx) {
    return ctx.db.query('users').collect();
  },
});

export const populateForUser = internalMutation({
  args: { id: v.id('users') },
  async handler(ctx, { id }) {
    for (const type of [puzzleType.Enum.daily, puzzleType.Enum.training]) {
      const existingUserStatistics = await ctx.db
        .query('userPuzzleStatistics')
        .withIndex('by_user_puzzle_type', (q) => q.eq('userId', id).eq('puzzleType', type))
        .first();
      if (existingUserStatistics) {
        continue;
      }

      const basePuzzlesQuery =
        type === puzzleType.Enum.daily
          ? ctx.db.query('puzzles').withIndex('by_type', (q) => q.eq('type', type))
          : ctx.db.query('puzzles').withIndex('by_type_creator', (q) => q.eq('type', type).eq('creatorId', id));
      const allPuzzles = await basePuzzlesQuery.order('desc').collect();
      const allPuzzlesAttempts = await Promise.all(
        allPuzzles.map((puzzle) =>
          ctx.db
            .query('puzzleGuessAttempts')
            .withIndex('by_user_puzzle', (q) => q.eq('userId', id).eq('puzzleId', puzzle._id))
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
        userId: id,
      });
    }
  },
});

export const populateFromExistingPuzzleAttempts = internalAction({
  async handler(ctx) {
    const allUsers = await ctx.runQuery(internal.userPuzzleStatistics.internal.readAllUsersQuery, {});
    for (const user of allUsers) {
      await ctx.scheduler.runAfter(1, internal.userPuzzleStatistics.internal.populateForUser, { id: user._id });
    }
  },
});
