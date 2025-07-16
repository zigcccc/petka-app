import { api } from '@/convex/_generated/api';

import { generateUseMutationHook } from './generateUseMutationHook';

export const useCreateUserMutation = generateUseMutationHook(api.users.queries.create);
