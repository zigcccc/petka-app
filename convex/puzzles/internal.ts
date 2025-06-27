import { pickRandomWord } from '@/utils/words';

import { internalMutation } from '../_generated/server';

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
