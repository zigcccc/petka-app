import { type PropsWithChildren } from 'react';
import { Text as RNText, type StyleProp, type TextStyle } from 'react-native';
import { StyleSheet, type UnistylesVariants } from 'react-native-unistyles';

type Props = PropsWithChildren<{
  style?: StyleProp<TextStyle>;
}> &
  UnistylesVariants<typeof styles>;

export function Text({ children, size = 'base', style, weight = 'regular', color = 'black' }: Props) {
  styles.useVariants({ size, weight, color });

  return <RNText style={[styles.text, style]}>{children}</RNText>;
}

const styles = StyleSheet.create((theme) => ({
  text: {
    variants: {
      color: {
        black: {
          color: theme.colors.black,
        },
        grey70: {
          color: theme.colors.grey[70],
        },
        grey50: {
          color: theme.colors.grey[50],
        },
        grey20: {
          color: theme.colors.grey[20],
        },
        red40: {
          color: theme.colors.red[40],
        },
        white: {
          color: theme.colors.white,
        },
        default: {
          color: theme.colors.black,
        },
      },
      size: {
        xs: {
          fontSize: 12,
        },
        sm: {
          fontSize: 14,
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
