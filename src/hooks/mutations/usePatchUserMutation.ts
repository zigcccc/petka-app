import { api } from '@/convex/_generated/api';

import { generateUseMutationHook } from './generateUseMutationHook';

export const usePatchUserMutation = generateUseMutationHook(api.users.queries.patch);
