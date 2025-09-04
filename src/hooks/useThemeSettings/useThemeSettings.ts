import { useCallback, useMemo } from 'react';
import { Appearance } from 'react-native';
import { UnistylesRuntime, type UnistylesThemes, useUnistyles } from 'react-native-unistyles';

import { storage } from '@/utils/storage';

export function useThemeSettings() {
  const { rt } = useUnistyles();

  const handleThemeChange = useCallback((newThemeSetting: 'system' | keyof UnistylesThemes) => {
    if (newThemeSetting === 'system') {
      UnistylesRuntime.setAdaptiveThemes(true);
      Appearance.setColorScheme(null);
      storage.delete('preferredtheme');
    } else {
      UnistylesRuntime.setAdaptiveThemes(false);
      UnistylesRuntime.setTheme(newThemeSetting);
      Appearance.setColorScheme(newThemeSetting);
      storage.set('preferredtheme', newThemeSetting);
    }
  }, []);

  return useMemo(
    () =>
      ({
        currentTheme: rt.hasAdaptiveThemes ? 'system' : rt.themeName,
        onThemeChange: handleThemeChange,
      }) as const,
    [rt.hasAdaptiveThemes, rt.themeName, handleThemeChange]
  );
}
