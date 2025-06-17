import { type PropsWithChildren } from 'react';
import { Text as RNText, type StyleProp, type TextStyle } from 'react-native';
import { StyleSheet, type UnistylesVariants } from 'react-native-unistyles';

type Props = PropsWithChildren<{
  style?: StyleProp<TextStyle>;
}> &
  UnistylesVariants<typeof styles>;

export function Text({ children, size = 'base', style, weight = 'regular' }: Props) {
  styles.useVariants({ size, weight });

  return <RNText style={[styles.text, style]}>{children}</RNText>;
}

const styles = StyleSheet.create((theme) => ({
  text: {
    variants: {
      size: {
        xs: {
          fontSize: 10,
        },
        sm: {
          fontSize: 12,
        },
        base: {
          fontSize: 16,
        },
        lg: {
          fontSize: 18,
        },
        xl: {
          fontSize: 20,
        },
        '2xl': {
          fontSize: 24,
        },
      },
      weight: {
        light: {
          fontFamily: theme.fonts.sans.light,
        },
        regular: {
          fontFamily: theme.fonts.sans.regular,
        },
        medium: {
          fontFamily: theme.fonts.sans.medium,
        },
        semibold: {
          fontFamily: theme.fonts.sans.semiBold,
        },
        bold: {
          fontFamily: theme.fonts.sans.bold,
        },
      },
    },
  },
}));
