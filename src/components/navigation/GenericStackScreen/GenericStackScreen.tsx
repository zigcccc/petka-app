import { Stack } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { ScrollView } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { horizontalSafePadding } from '@/styles/insets';

type Props = PropsWithChildren<{
  title: string;
  backText?: string;
}>;

export function GenericStackScreen({ backText = 'Nazaj', children, title }: Readonly<Props>) {
  const { theme } = useUnistyles();

  return (
    <ScrollView contentContainerStyle={styles.container} contentInsetAdjustmentBehavior="automatic">
      <Stack.Screen
        options={{
          title,
          headerBackTitle: backText,
          headerBackTitleStyle: styles.back,
          headerTintColor: theme.colors.foreground,
          headerLargeTitle: true,
        }}
      />
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  back: {
    fontFamily: theme.fonts.sans.medium,
  },
  container: {
    paddingTop: theme.spacing[6],
    ...horizontalSafePadding(rt.insets, theme.spacing[6]),
  },
}));
