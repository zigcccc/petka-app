import { Stack } from 'expo-router';
import { type PropsWithChildren } from 'react';
import { ScrollView } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type Props = PropsWithChildren<{
  title: string;
  backText?: string;
}>;

export function GenericStackScreen({ backText = 'Nazaj', children, title }: Props) {
  const { theme } = useUnistyles();

  return (
    <ScrollView contentContainerStyle={styles.container} contentInsetAdjustmentBehavior="automatic">
      <Stack.Screen
        options={{
          title,
          headerBackTitle: backText,
          headerBackTitleStyle: styles.back,
          headerTintColor: theme.colors.petka.black,
          headerLargeTitle: true,
        }}
      />
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  back: {
    fontFamily: theme.fonts.sans.medium,
  },
  container: {
    paddingTop: theme.spacing[6],
    paddingHorizontal: theme.spacing[6],
  },
}));
