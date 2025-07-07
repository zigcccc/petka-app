import { api } from '@/convex/_generated/api';

import { generateUseMutationHook } from './generateUseMutationHook';

export const useDeleteUserMutation = generateUseMutationHook(api.users.queries.destroy);
