import { NoOp } from 'convex-helpers/server/customFunctions';
import { zCustomQuery, zCustomAction, zCustomMutation } from 'convex-helpers/server/zod';

import { query as baseQuery, action as baseAction, mutation as baseMutation } from '../_generated/server';

export const query = zCustomQuery(baseQuery, NoOp);
export const action = zCustomAction(baseAction, NoOp);
export const mutation = zCustomMutation(baseMutation, NoOp);
