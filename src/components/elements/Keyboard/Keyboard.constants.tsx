import { CornerDownRightIcon, DeleteIcon } from 'lucide-react-native';

export const qwertyKeys = [
  ['e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'š', 'ž'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'č'],
  ['{Enter}', 'c', 'v', 'b', 'n', 'm', '-', '{Backspace}'],
] as const;

export const abcdKeys = [
  ['a', 'b', 'c', 'č', 'd', 'e', 'f', 'g', 'h', 'i'],
  ['j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 'š'],
  ['{Enter}', 't', 'u', 'v', 'z', 'ž', '-', '{Backspace}'],
] as const;

export const keys = qwertyKeys;

export type KeyboardKey = (typeof keys)[number][number];

export const keysToIconMap = new Map([
  ['{Backspace}', <DeleteIcon key="backspace" size={22} testID="keyboard-icon--backspace" />],
  ['{Enter}', <CornerDownRightIcon key="enter" size={22} testID="keyboard-icon--enter" />],
]);
