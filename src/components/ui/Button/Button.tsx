import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
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
  ['primary', defaultTheme.colors.petka.green],
  ['secondary', defaultTheme.colors.petka.yellow],
  ['terciary', defaultTheme.colors.petka.black],
]);

const ButtonContext = createContext<Pick<
  Props,
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
  fullwidth,
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
            size={size === 'lg' ? 22 : 20}
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

const styles = StyleSheet.create((theme) => ({
  container: {
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    variants: {
      size: {
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
      },
      variant: {
        fill: {},
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
      },
      variant: {
        fill: {
          color: theme.colors.white,
        },
        outline: {},
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
    ],
  },
}));
