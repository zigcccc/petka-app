import { NoOp } from 'convex-helpers/server/customFunctions';
import { zCustomAction, zCustomMutation, zCustomQuery } from 'convex-helpers/server/zod4';

import {
  action as baseAction,
  internalMutation as baseInternalMutation,
  mutation as baseMutation,
  query as baseQuery,
} from '../_generated/server';

export const query = zCustomQuery(baseQuery, NoOp);
export const action = zCustomAction(baseAction, NoOp);
export const mutation = zCustomMutation(baseMutation, NoOp);
export const internalMutation = zCustomMutation(baseInternalMutation, NoOp);
