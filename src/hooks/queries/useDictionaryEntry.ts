import { api } from '@/convex/_generated/api';

import { generateUseQueryHook } from './generateUseQueryHook';

export const useDictionaryEntry = generateUseQueryHook(api.dictionary.queries.read);
