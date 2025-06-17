import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { Pressable, type StyleProp, Text, type ViewStyle } from 'react-native';
import { StyleSheet, type UnistylesVariants } from 'react-native-unistyles';

type Props = PropsWithChildren<{
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}> &
  UnistylesVariants<typeof styles>;

const ButtonContext = createContext<Pick<Props, 'fullwidth' | 'size' | 'variant'> | null>(null);

function useButtonContext() {
  const buttonContext = useContext(ButtonContext);

  if (!buttonContext) {
    throw new Error('Must be used within <Button> component.');
  }

  return buttonContext;
}

export function Button({ children, onPress, size = 'medium', fullwidth, style, variant = 'primary' }: Props) {
  styles.useVariants({ size, fullwidth, variant });

  const buttonText = useMemo(() => {
    return typeof children === 'string' ? <Text style={styles.text}>{children}</Text> : children;
  }, [children]);

  return (
    <ButtonContext.Provider value={{ size, variant, fullwidth }}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.container, pressed && styles.containerPressed, style]}
      >
        {buttonText}
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
    },
  },
  containerPressed: {
    opacity: 0.4,
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
          fontSize: 20,
        },
      },
      fullwidth: {},
      variant: {},
    },
  },
}));
