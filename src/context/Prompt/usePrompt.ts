import { useContext } from 'react';

import { PromptContext } from './Prompt.context';

export function usePrompt() {
  const promptContext = useContext(PromptContext);

  if (!promptContext) {
    throw new Error('usePrompt() must be used within <PromptProvider /> component.');
  }

  return promptContext.prompt;
}
