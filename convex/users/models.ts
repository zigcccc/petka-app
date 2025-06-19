import { defineTable } from 'convex/server';
import { zodToConvex } from 'convex-helpers/server/zod';
import { z } from 'zod';

import { baseDbModel } from '../shared/models';

export const userModel = baseDbModel.extend({
  lowercaseNickname: z.string(),
  nickname: z.string(),
});
export type User = z.infer<typeof userModel>;

export const createUserModel = z.object({
  nickname: z.string().min(4, { message: 'Vzdevek mora vsebovati vsaj 4 znake.' }),
});
export type CreateUser = z.infer<typeof createUserModel>;

export const usersTable = defineTable(zodToConvex(userModel));
