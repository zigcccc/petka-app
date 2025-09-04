import { StyleSheet } from 'react-native-unistyles';

import { storage } from '@/utils/storage';

import { breakpoints } from './breakpoints';
import { darkTheme, lightTheme } from './themes';

type AppThemes = { light: typeof lightTheme; dark: typeof darkTheme };
type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends AppThemes {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  breakpoints,
  themes: { light: lightTheme, dark: darkTheme },
  settings: {
    ...(storage.getString('preferredtheme') === 'dark' || storage.getString('preferredtheme') === 'light'
      ? { initialTheme: storage.getString('preferredtheme') as 'light' | 'dark' }
      : { adaptiveThemes: true }),
  },
});
