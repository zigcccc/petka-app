import { api } from '@/convex/_generated/api';

import { generateUseMutationHook } from './generateUseMutationHook';

export const useValidateUserAccount = generateUseMutationHook(api.users.queries.validateExistingAccount);
