import { createContext } from 'react';

import { type PromptProviderProps } from './Prompt.types';

export const PromptContext = createContext<PromptProviderProps | null>(null);
