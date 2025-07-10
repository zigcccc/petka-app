import { type ActionSheetIOSOptions } from 'react-native';

export type ActionSheetPressCallback = (buttonIndex: number) => void;

export type ActionSheetProviderProps = {
  present: (options: ActionSheetIOSOptions, onActionPress: ActionSheetPressCallback) => void;
};
