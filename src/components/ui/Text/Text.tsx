import { type PropsWithChildren } from 'react';
import { type AccessibilityRole, Text as RNText, type StyleProp, type TextStyle } from 'react-native';
import { StyleSheet, type UnistylesVariants } from 'react-native-unistyles';

type Props = PropsWithChildren<{
  allowFontScaling?: boolean;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  onPress?: () => void;
  accessibilityRole?: AccessibilityRole;
}> &
  UnistylesVariants<typeof styles>;

export function Text({
  accessibilityRole,
  align = 'auto',
  allowFontScaling,
  children,
  numberOfLines,
  size = 'base',
  style,
  weight = 'regular',
  color = 'black',
  onPress,
}: Readonly<Props>) {
  styles.useVariants({ align, size, weight, color, isLink: !!onPress });

  return (
    <RNText
      accessibilityRole={accessibilityRole}
      allowFontScaling={allowFontScaling}
      numberOfLines={numberOfLines}
      onPress={onPress}
      style={[styles.text, style]}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create((theme) => ({
  text: {
    variants: {
      align: {
        left: {
          textAlign: 'left',
        },
        center: {
          textAlign: 'center',
        },
        right: {
          textAlign: 'right',
        },
        auto: {
          textAlign: 'auto',
        },
        justify: {
          textAlign: 'justify',
        },
      },
      color: {
        black: {
          color: theme.colors.foreground,
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
        gold40: {
          color: theme.colors.gold[40],
        },
        white: {
          color: theme.colors.background,
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
      isLink: {
        true: {
          textDecorationLine: 'underline',
        },
        false: {},
      },
    },
  },
}));
