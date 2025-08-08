import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

import { useToaster } from '../useToaster';

export const gameplayKeyboardType = z.enum(['qwerty', 'abcde']);
export type GameplayKeyboardType = z.infer<typeof gameplayKeyboardType>;

const gameplaySettingsModel = z.object({
  autosubmitPuzzleAttempt: z.boolean(),
  keyboardType: gameplayKeyboardType,
});
export type GameplaySettings = z.infer<typeof gameplaySettingsModel>;

const GAMEPLAY_SETTINGS_STORAGE_KEY = 'GAMEPLAY_SETTINGS';

const gameplaySettingsDefaultValues = {
  autosubmitPuzzleAttempt: true,
  keyboardType: gameplayKeyboardType.Enum.qwerty,
} as const;

export function useGameplaySettings() {
  const toaster = useToaster();
  const [settings, setSettings] = useState<GameplaySettings | null | 'loading'>('loading');

  const setDefaultSettings = useCallback(async () => {
    await AsyncStorage.setItem(GAMEPLAY_SETTINGS_STORAGE_KEY, JSON.stringify(gameplaySettingsDefaultValues));
    setSettings(gameplaySettingsDefaultValues);
  }, []);

  const updateSettings = useCallback(
    async (newValues: Partial<GameplaySettings>) => {
      const mergedValues =
        settings && settings !== 'loading'
          ? { ...settings, ...newValues }
          : { ...gameplaySettingsDefaultValues, ...newValues };
      await AsyncStorage.setItem(GAMEPLAY_SETTINGS_STORAGE_KEY, JSON.stringify(mergedValues));
      setSettings(mergedValues);
      toaster.toast('Nastavitev posodobljena', { intent: 'success' });
    },
    [settings, toaster]
  );

  useEffect(() => {
    async function loadSettingsFromStorage() {
      const savedSettings = await AsyncStorage.getItem(GAMEPLAY_SETTINGS_STORAGE_KEY).catch(() => null);
      const parsedSettings = await gameplaySettingsModel
        .parseAsync(JSON.parse(savedSettings ?? 'null'))
        .catch(() => null);
      setSettings(parsedSettings);
    }
    loadSettingsFromStorage();
  }, []);

  return useMemo(
    () => ({
      autosubmitPuzzleAttempt: settings && settings !== 'loading' ? settings.autosubmitPuzzleAttempt : true,
      keyboardType: settings && settings !== 'loading' ? settings.keyboardType : gameplayKeyboardType.Enum.qwerty,
      isUninitialised: settings !== 'loading' && !settings,
      updateSettings,
      setDefaultSettings,
    }),
    [setDefaultSettings, settings, updateSettings]
  );
}
