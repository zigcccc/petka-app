import { NoOp } from 'convex-helpers/server/customFunctions';
import { zCustomQuery, zCustomAction, zCustomMutation } from 'convex-helpers/server/zod';

import {
  query as baseQuery,
  action as baseAction,
  mutation as baseMutation,
  internalMutation as baseInternalMutation,
} from '../_generated/server';

export const query = zCustomQuery(baseQuery, NoOp);
export const action = zCustomAction(baseAction, NoOp);
export const mutation = zCustomMutation(baseMutation, NoOp);
export const internalMutation = zCustomMutation(baseInternalMutation, NoOp);
