import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, type StyleProp, Text, type ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles, type UnistylesVariants } from 'react-native-unistyles';

type Props = PropsWithChildren<{
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  loading?: boolean;
}> &
  UnistylesVariants<typeof styles>;

const ButtonContext = createContext<Pick<Props, 'fullwidth' | 'size' | 'variant' | 'disabled' | 'loading'> | null>(
  null
);

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
  loading = false,
  onPress,
  size = 'medium',
  style,
  variant = 'primary',
}: Props) {
  const { theme } = useUnistyles();

  styles.useVariants({ size, fullwidth, variant, disabled });

  const buttonText = useMemo(() => {
    return typeof children === 'string' ? <Text style={styles.text}>{children}</Text> : children;
  }, [children]);

  return (
    <ButtonContext.Provider value={{ size, variant, fullwidth, disabled, loading }}>
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
            color={theme.colors.white}
            size={size === 'large' ? 22 : 20}
            style={styles.loader}
          />
        ) : (
          buttonText
        )}
      </Pressable>
    </ButtonContext.Provider>
  );
}

function ButtonText({ children }: PropsWithChildren) {
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
    gap: theme.spacing[4],
    variants: {
      size: {
        medium: {
          paddingVertical: theme.spacing[5],
          paddingHorizontal: theme.spacing[6],
        },
        large: {
          paddingVertical: theme.spacing[6],
          paddingHorizontal: theme.spacing[7],
        },
      },
      variant: {
        primary: {
          backgroundColor: theme.colors.petka.green,
        },
        secondary: {
          backgroundColor: theme.colors.petka.yellow,
        },
        terciary: {
          backgroundColor: theme.colors.petka.black,
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
  },
  containerPressed: {
    opacity: 0.4,
  },
  loader: {
    variants: {
      size: {
        medium: {},
        large: {},
      },
      variant: {},
      fullwidth: {},
    },
  },
  text: {
    color: theme.colors.white,
    fontFamily: theme.fonts.sans.bold,
    variants: {
      size: {
        medium: {
          fontSize: 16,
        },
        large: {
          fontSize: 18,
        },
      },
      fullwidth: {},
      variant: {},
    },
  },
}));
