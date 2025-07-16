import { StyleSheet } from 'react-native-unistyles';

import { breakpoints } from './breakpoints';
import { defaultTheme } from './themes';

type AppThemes = { default: typeof defaultTheme };
type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends AppThemes {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({ breakpoints, themes: { default: defaultTheme }, settings: { initialTheme: 'default' } });
