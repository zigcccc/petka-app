import { z } from 'zod';

import { query } from '../shared/queries';

export const read = query({
  args: {
    term: z.string(),
  },
  async handler(ctx, args) {
    const term = await ctx.db
      .query('dictionaryEntries')
      .filter((q) => q.eq(q.field('word'), args.term))
      .first();

    return term;
  },
});
