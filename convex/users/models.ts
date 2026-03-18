import { defineTable } from 'convex/server';
import { zodToConvex } from 'convex-helpers/server/zod4';
import { z } from 'zod';

import { getBaseDbModel } from '../shared/models';

export const userModel = getBaseDbModel('users').extend({
  lowercaseNickname: z.string(),
  nickname: z.string(),
});
export type User = z.infer<typeof userModel>;

export const createUserModel = z.object({
  nickname: z
    .string()
    .min(3, { error: 'Vzdevek mora vsebovati vsaj 3 znake.' })
    .max(20, { error: 'Vzdevek lahko vsebuje največ 20 znakov.' })
    .regex(/^(?!.*(@|https?:\/\/|www\.|\.\w{2,})).*$/, {
      error: 'Vzdevek ne sme vsebovati spletnih ali e-poštnih naslovov.',
    })
    .regex(/[a-zA-Z0-9]/, {
      error: 'Vzdevek mora vsebovati vsaj eno črko ali številko.',
    }),
});
export type CreateUser = z.infer<typeof createUserModel>;

export const patchUserModel = createUserModel.partial();
export type PatchUser = z.infer<typeof patchUserModel>;

export const usersTable = defineTable(zodToConvex(userModel));
