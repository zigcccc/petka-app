import { NoOp } from 'convex-helpers/server/customFunctions';
import { zCustomQuery, zCustomAction } from 'convex-helpers/server/zod';

import { query as baseQuery, action as baseAction } from '../_generated/server';

export const query = zCustomQuery(baseQuery, NoOp);
export const action = zCustomAction(baseAction, NoOp);
