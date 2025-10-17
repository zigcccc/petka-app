import { zid } from 'convex-helpers/server/zod';

import { puzzleType } from '../puzzles/models';
import { query } from '../shared/queries';

export const readUserPuzzleStatistics = query({
  args: { puzzleType: puzzleType, userId: zid('users') },
  async handler(ctx, { puzzleType, userId }) {
    const statistics = await ctx.db
      .query('userPuzzleStatistics')
      .withIndex('by_user_puzzle_type', (q) => q.eq('userId', userId).eq('puzzleType', puzzleType))
      .first();
    return statistics;
  },
});
