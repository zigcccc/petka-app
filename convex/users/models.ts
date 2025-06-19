import { defineTable } from 'convex/server';
import { zodToConvex } from 'convex-helpers/server/zod';
import { z } from 'zod';

import { baseDbModel } from '../shared/models';

export const userModel = baseDbModel.extend({
  nickname: z.string(),
});
export type User = z.infer<typeof userModel>;

export const usersTable = defineTable(zodToConvex(userModel));
