import { ConvexError } from 'convex/values';

import { pickRandomWord } from '@/utils/words';

import { internalMutation } from '../_generated/server';
import { pushNotifications } from '../notifications/services';

import { puzzleType } from './models';

export const createDailyPuzzle = internalMutation({
  args: {},
  async handler(ctx) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const nextYear = tomorrow.getFullYear();
    const nextMonth = tomorrow.getMonth() + 1;
    const nextDay = tomorrow.getDate();

    const words = await ctx.db.query('dictionaryEntries').collect();
    const word = pickRandomWord(words);

    await ctx.db.insert('puzzles', {
      type: puzzleType.Enum.daily,
      creatorId: null,
      solution: word,
      solvedBy: [],
      year: nextYear,
      month: nextMonth,
      day: nextDay,
    });

    const usedDictionaryEntry = words.find((w) => w.word === word);

    if (usedDictionaryEntry) {
      await ctx.db.patch(usedDictionaryEntry._id, { numOfTimesUsed: usedDictionaryEntry.numOfTimesUsed + 1 });
    }
  },
});

export const sendReminderForDailyChallenge = internalMutation({
  args: {},
  async handler(ctx) {
    const today = new Date();

    const puzzle = await ctx.db
      .query('puzzles')
      .withIndex('by_type_year_month_day', (q) =>
        q
          .eq('type', puzzleType.Enum.daily)
          .eq('year', today.getFullYear())
          .eq('month', today.getMonth() + 1)
          .eq('day', today.getDate())
      )
      .unique();

    if (!puzzle) {
      throw new ConvexError({ message: 'Daily puzzle not found', code: 404 });
    }

    const users = await ctx.db.query('users').collect();
    const userIds = users.map((user) => user._id);

    const idsToNotify = new Set(userIds).difference(new Set(puzzle.solvedBy));

    for (const userId of idsToNotify.values()) {
      const { hasToken } = await pushNotifications.getStatusForUser(ctx, { userId });
      if (hasToken) {
        await pushNotifications.sendPushNotification(ctx, {
          userId,
          notification: {
            title: 'Tik-tak, tik-tak... ⏰',
            body: 'Ne pozabi rešiti današnjega dnevnega iziva!',
            data: { url: '/(authenticated)/play/daily-puzzle' },
          },
        });
      }
    }
  },
});
