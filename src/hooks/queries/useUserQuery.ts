import { api } from '@/convex/_generated/api';

import { generateUseQueryHook } from './generateUseQueryHook';

export const useUserQuery = generateUseQueryHook(api.users.queries.read);
