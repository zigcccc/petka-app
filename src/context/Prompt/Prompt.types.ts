import { type AlertButton } from 'react-native';

export type PromptProviderProps = {
  prompt: (title: string, message?: string, buttons?: AlertButton[]) => void;
};
