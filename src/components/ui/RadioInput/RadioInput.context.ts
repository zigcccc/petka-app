import { createContext, useContext } from 'react';

import { type RadioInputContextProps } from './RadioInput.types';

export const RadioInputContext = createContext<RadioInputContextProps | null>(null);

export function useRadioInputContext() {
  const context = useContext(RadioInputContext);

  if (!context) {
    throw new Error('useRadioInputContext hook must be used inside of the <RadioInput /> component.');
  }

  return context;
}
