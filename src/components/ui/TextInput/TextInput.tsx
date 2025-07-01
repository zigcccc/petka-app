import { type ComponentProps, type Ref } from 'react';
import { TextInput as RNTextInput, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Text } from '../Text';

type Props = ComponentProps<typeof RNTextInput> & {
  error?: string;
  ref?: Ref<RNTextInput>;
  label?: string;
};

export function TextInput({ error, ref, label, style, ...rest }: Readonly<Props>) {
  const { theme } = useUnistyles();
  const hasError = !!error;

  styles.useVariants({ hasError });

  return (
    <View style={styles.container}>
      {!!label && (
        <Text color="grey70" size="sm" weight="medium">
          {label}
        </Text>
      )}
      <RNTextInput
        {...rest}
        ref={ref}
        accessibilityLabel={label ?? rest.placeholder}
        cursorColor={theme.colors.petka.green}
        selectionColor={theme.colors.petka.green}
        style={[styles.input, style]}
      />
      {hasError && (
        <Text color="red40" size="xs" weight="medium">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing[3],
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[5],
    borderRadius: 4,
    variants: {
      hasError: {
        true: {
          borderColor: theme.colors.red[40],
        },
        false: {
          borderColor: theme.colors.grey[20],
        },
      },
    },
  },
}));
