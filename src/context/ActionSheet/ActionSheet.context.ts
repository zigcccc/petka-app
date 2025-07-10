import { createContext } from 'react';

import { type ActionSheetProviderProps } from './ActionSheet.types';

export const ActionSheetContext = createContext<ActionSheetProviderProps | null>(null);
