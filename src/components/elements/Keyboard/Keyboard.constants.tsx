import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export const keys = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['{Enter}', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '{Backspace}'],
] as const;

const _specialKeys = ['š', 'č', 'ž'] as const;

export type KeyboardKey = (typeof keys)[number][number] | (typeof _specialKeys)[number];

export const specialKeysPairingMap = new Map<KeyboardKey, KeyboardKey>([
  ['s', 'š'],
  ['z', 'ž'],
  ['c', 'č'],
]);

export const keysToIconMap = new Map([
  ['{Backspace}', <Ionicons key="backspace" name="backspace-outline" size={22} />],
  ['{Enter}', <MaterialIcons key="enter" name="subdirectory-arrow-right" size={22} />],
]);
