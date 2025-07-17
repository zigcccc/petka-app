import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export const keys = [
  ['e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'š', 'ž'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'č'],
  ['{Enter}', 'c', 'v', 'b', 'n', 'm', '-', '{Backspace}'],
] as const;

export type KeyboardKey = (typeof keys)[number][number];

export const keysToIconMap = new Map([
  ['{Backspace}', <Ionicons key="backspace" name="backspace-outline" size={22} testID="keyboard-icon--backspace" />],
  ['{Enter}', <MaterialIcons key="enter" name="subdirectory-arrow-right" size={22} testID="keyboard-icon--enter" />],
]);
