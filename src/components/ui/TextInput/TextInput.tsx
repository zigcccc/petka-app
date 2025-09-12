import { type ComponentProps, type Ref } from 'react';
import { TextInput as RNTextInput, View } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { Text } from '../Text';

type Props = ComponentProps<typeof RNTextInput> & {
  error?: string;
  ref?: Ref<RNTextInput>;
  label?: string;
};

const UniTextInput = withUnistyles(RNTextInput, (theme) => ({
  cursorColor: theme.colors.petka.green,
  selectionColor: theme.colors.petka.green,
  underlineColorAndroid: 'transparent',
}));

export function TextInput({ error, ref, label, style, ...rest }: Readonly<Props>) {
  const hasError = !!error;

  styles.useVariants({ hasError });

  return (
    <View style={styles.container}>
      {!!label && (
        <Text color="grey70" size="sm" weight="medium">
          {label}
        </Text>
      )}
      <UniTextInput {...rest} ref={ref} accessibilityLabel={label ?? rest.placeholder} style={[styles.input, style]} />
      {hasError && (
        <Text color="red40" size="xs" weight="medium">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    gap: theme.spacing[3],
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[5],
    borderRadius: 4,
    color: theme.colors.foreground,
    variants: {
      hasError: {
        true: {
          borderColor: theme.colors.red[40],
        },
        false: {
          borderColor: rt.themeName === 'dark' ? theme.colors.grey[30] : theme.colors.grey[20],
        },
      },
    },
  },
}));
