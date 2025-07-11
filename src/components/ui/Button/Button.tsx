import { type IconProps } from '@expo/vector-icons/build/createIconSet';
import { cloneElement, createContext, type ReactElement, useContext, useMemo, type PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, type StyleProp, Text, type ViewStyle } from 'react-native';
import { StyleSheet, type UnistylesVariants } from 'react-native-unistyles';

import { defaultTheme } from '@/styles/themes';

type Props = PropsWithChildren<{
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  loading?: boolean;
}> &
  UnistylesVariants<typeof styles>;

const intentToSpinnerColorMap = new Map<Props['intent'], string>([
  ['danger', defaultTheme.colors.red[40]],
  ['warning', defaultTheme.colors.gold[40]],
  ['primary', defaultTheme.colors.petka.green],
  ['secondary', defaultTheme.colors.petka.yellow],
  ['terciary', defaultTheme.colors.petka.black],
  ['shaded', defaultTheme.colors.grey[70]],
]);

const sizeToIconSizeMap = new Map<Required<Props>['size'], number>([
  ['xxs', 12],
  ['xs', 14],
  ['sm', 16],
  ['md', 18],
  ['lg', 20],
]);

const ButtonContext = createContext<Pick<
  Required<Props>,
  'fullwidth' | 'size' | 'variant' | 'disabled' | 'loading' | 'intent'
> | null>(null);

function useButtonContext() {
  const buttonContext = useContext(ButtonContext);

  if (!buttonContext) {
    throw new Error('Must be used within <Button> component.');
  }

  return buttonContext;
}

export function Button({
  children,
  disabled = false,
  fullwidth = false,
  intent = 'primary',
  loading = false,
  onPress,
  size = 'md',
  style,
  variant = 'fill',
}: Readonly<Props>) {
  styles.useVariants({ size, intent, fullwidth, variant, disabled });

  const spinnerColor = useMemo(() => {
    if (variant === 'fill') {
      return defaultTheme.colors.white;
    }

    return intentToSpinnerColorMap.get(intent);
  }, [intent, variant]);

  const buttonText = useMemo(() => {
    return typeof children === 'string' ? <Text style={styles.text}>{children}</Text> : children;
  }, [children]);

  const contextValue = useMemo(
    () => ({ size, variant, intent, fullwidth, disabled, loading }),
    [disabled, fullwidth, intent, loading, size, variant]
  );

  return (
    <ButtonContext.Provider value={contextValue}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled || loading}
        onPress={onPress}
        style={({ pressed }) => [styles.container, pressed && styles.containerPressed, style]}
      >
        {loading ? (
          <ActivityIndicator
            accessibilityLabel="Loading..."
            accessibilityRole="spinbutton"
            accessible
            color={spinnerColor}
            size={sizeToIconSizeMap.get(size)! + 2}
            style={styles.loader}
          />
        ) : (
          buttonText
        )}
      </Pressable>
    </ButtonContext.Provider>
  );
}

function ButtonText({ children }: Readonly<PropsWithChildren>) {
  const buttonStyles = useButtonContext();
  styles.useVariants(buttonStyles);

  return <Text style={styles.text}>{children}</Text>;
}

Button.Text = ButtonText;

function ButtonIcon({ children }: Readonly<{ children: ReactElement<IconProps<string>> }>) {
  const buttonStyles = useButtonContext();
  styles.useVariants(buttonStyles);

  if (!children) {
    return null;
  }

  return (
    <>
      {cloneElement(children, {
        color: styles.text.color ?? '',
        size: sizeToIconSizeMap.get(buttonStyles.size),
        testID: children.props.testID ?? `icon-${children.props.name}`,
        accessibilityLabel: `icon-${children.props.name}`,
      })}
    </>
  );
}

Button.Icon = ButtonIcon;

const styles = StyleSheet.create((theme) => ({
  container: {
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    variants: {
      size: {
        xxs: {
          paddingVertical: theme.spacing[3],
          paddingHorizontal: theme.spacing[4],
          gap: theme.spacing[2],
        },
        xs: {
          paddingVertical: theme.spacing[4],
          paddingHorizontal: theme.spacing[5],
          gap: theme.spacing[2],
        },
        sm: {
          paddingVertical: theme.spacing[4],
          paddingHorizontal: theme.spacing[5],
          gap: theme.spacing[3],
        },
        md: {
          paddingVertical: theme.spacing[5],
          paddingHorizontal: theme.spacing[6],
          gap: theme.spacing[4],
        },
        lg: {
          paddingVertical: theme.spacing[6],
          paddingHorizontal: theme.spacing[7],
          gap: theme.spacing[4],
        },
      },
      intent: {
        primary: {},
        secondary: {},
        terciary: {},
        danger: {},
        warning: {},
        shaded: {},
      },
      variant: {
        fill: {},
        transparent: {
          backgroundColor: 'transparent',
        },
        outline: {
          borderWidth: 1,
        },
      },
      fullwidth: {
        true: {
          width: '100%',
        },
        false: {
          width: 'auto',
        },
      },
      disabled: {
        true: {
          opacity: 0.2,
        },
        false: {
          opacity: 1,
        },
      },
    },
    compoundVariants: [
      {
        variant: 'fill',
        intent: 'primary',
        styles: {
          backgroundColor: theme.colors.petka.green,
        },
      },
      {
        variant: 'fill',
        intent: 'secondary',
        styles: {
          backgroundColor: theme.colors.petka.yellow,
        },
      },
      {
        variant: 'fill',
        intent: 'terciary',
        styles: {
          backgroundColor: theme.colors.petka.black,
        },
      },
      {
        variant: 'fill',
        intent: 'danger',
        styles: {
          backgroundColor: theme.colors.red[40],
        },
      },
      {
        variant: 'fill',
        intent: 'warning',
        styles: {
          backgroundColor: theme.colors.red[40],
        },
      },
      {
        variant: 'fill',
        intent: 'shaded',
        styles: {
          backgroundColor: theme.colors.grey[70],
        },
      },
      {
        variant: 'outline',
        intent: 'primary',
        styles: {
          borderColor: theme.colors.petka.green,
        },
      },
      {
        variant: 'outline',
        intent: 'secondary',
        styles: {
          borderColor: theme.colors.petka.yellow,
        },
      },
      {
        variant: 'outline',
        intent: 'terciary',
        styles: {
          borderColor: theme.colors.petka.black,
        },
      },
      {
        variant: 'outline',
        intent: 'danger',
        styles: {
          borderColor: theme.colors.red[40],
        },
      },
      {
        variant: 'outline',
        intent: 'warning',
        styles: {
          borderColor: theme.colors.gold[40],
        },
      },
      {
        variant: 'outline',
        intent: 'shaded',
        styles: {
          borderColor: theme.colors.grey[70],
        },
      },
    ],
  },
  containerPressed: {
    opacity: 0.4,
  },
  loader: {
    variants: {
      size: {},
      variant: {},
      intent: {},
      fullwidth: {},
    },
  },
  text: {
    fontFamily: theme.fonts.sans.bold,
    variants: {
      size: {
        xxs: {
          fontSize: 10,
        },
        xs: {
          fontSize: 12,
        },
        sm: {
          fontSize: 14,
        },
        md: {
          fontSize: 16,
        },
        lg: {
          fontSize: 18,
        },
      },
      fullwidth: {},
      intent: {
        primary: {},
        secondary: {},
        terciary: {},
        danger: {},
        shaded: {},
      },
      variant: {
        fill: {
          color: theme.colors.white,
        },
        outline: {},
        transparent: {},
      },
    },
    compoundVariants: [
      {
        variant: 'outline',
        intent: 'primary',
        styles: {
          color: theme.colors.petka.green,
        },
      },
      {
        variant: 'outline',
        intent: 'seconary',
        styles: {
          color: theme.colors.petka.yellow,
        },
      },
      {
        variant: 'outline',
        intent: 'terciary',
        styles: {
          color: theme.colors.petka.black,
        },
      },
      {
        variant: 'outline',
        intent: 'danger',
        styles: {
          color: theme.colors.red[40],
        },
      },
      {
        variant: 'outline',
        intent: 'warning',
        styles: {
          color: theme.colors.gold[40],
        },
      },
      {
        variant: 'outline',
        intent: 'shaded',
        styles: {
          color: theme.colors.grey[70],
        },
      },
      {
        variant: 'transparent',
        intent: 'primary',
        styles: {
          color: theme.colors.petka.green,
        },
      },
      {
        variant: 'transparent',
        intent: 'seconary',
        styles: {
          color: theme.colors.petka.yellow,
        },
      },
      {
        variant: 'transparent',
        intent: 'terciary',
        styles: {
          color: theme.colors.petka.black,
        },
      },
      {
        variant: 'transparent',
        intent: 'danger',
        styles: {
          color: theme.colors.red[40],
        },
      },
      {
        variant: 'transparent',
        intent: 'warning',
        styles: {
          color: theme.colors.gold[40],
        },
      },
      {
        variant: 'transparent',
        intent: 'shaded',
        styles: {
          color: theme.colors.grey[70],
        },
      },
    ],
  },
}));
