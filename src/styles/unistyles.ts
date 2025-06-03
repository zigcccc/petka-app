import { StyleSheet } from 'react-native-unistyles';

import { defaultTheme } from './themes';

type AppThemes = { default: typeof defaultTheme };

declare module 'react-native-unistyles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({ themes: { default: defaultTheme }, settings: { initialTheme: 'default' } });
