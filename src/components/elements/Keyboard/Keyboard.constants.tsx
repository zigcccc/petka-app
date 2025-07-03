import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export const keys = [
  ['a', 'b', 'c', 'č', 'd', 'e', 'f', 'g', 'h'],
  ['i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r'],
  ['{Enter}', 's', 'š', 't', 'u', 'v', 'z', 'ž', '{Backspace}'],
] as const;

export type KeyboardKey = (typeof keys)[number][number];

export const keysToIconMap = new Map([
  ['{Backspace}', <Ionicons key="backspace" name="backspace-outline" size={22} testID="keyboard-icon--backspace" />],
  ['{Enter}', <MaterialIcons key="enter" name="subdirectory-arrow-right" size={22} testID="keyboard-icon--enter" />],
]);
