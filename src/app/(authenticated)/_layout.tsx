import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Platform } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useUser } from '@/hooks/useUser';
import { getOsMajorVersion } from '@/utils/platform';

export default function AuthenticatedLayout() {
  const { theme } = useUnistyles();
  const router = useRouter();
  const { shouldCreateAccount } = useUser();

  useFocusEffect(
    useCallback(() => {
      if (shouldCreateAccount) {
        router.navigate('/onboard/create-account');
      }
    }, [router, shouldCreateAccount])
  );

  return (
    <Stack initialRouteName="index" screenOptions={{ contentStyle: styles.content, headerStyle: styles.header }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="app-info" />
      <Stack.Screen
        name="history"
        options={{
          title: 'Zgodovina',
          headerTintColor: theme.colors.foreground,
          headerBackTitle: 'Nazaj',
          headerBackTitleStyle: styles.back,
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="leaderboards"
        options={{
          title: 'Lestvica',
          headerTintColor: theme.colors.foreground,
          headerBackTitle: 'Nazaj',
          headerBackTitleStyle: styles.back,
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen name="settings" options={{ headerTintColor: theme.colors.foreground }} />
      <Stack.Screen
        name="update-nickname"
        options={{
          presentation: 'modal',
          title: '',
          headerShadowVisible: false,
          headerTintColor: theme.colors.foreground,
        }}
      />
      <Stack.Screen
        name="play/daily-puzzle"
        options={{
          headerBackTitle: 'Nazaj',
          headerBackTitleStyle: styles.back,
          headerShadowVisible: false,
          headerTintColor: theme.colors.foreground,
          title: '',
          headerStyle: { backgroundColor: theme.colors.background },
        }}
      />
      <Stack.Screen
        name="play/daily-puzzle-solved"
        options={{
          headerShadowVisible: false,
          headerShown: Platform.select({ ios: false, android: true }),
          title: '',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="play/training-puzzle"
        options={{
          headerBackTitle: 'Nazaj',
          headerBackTitleStyle: styles.back,
          headerShadowVisible: false,
          headerTintColor: theme.colors.foreground,
          title: '',
          headerStyle: { backgroundColor: theme.colors.background },
        }}
      />
      <Stack.Screen
        name="play/training-puzzle-solved"
        options={{
          headerShadowVisible: false,
          title: '',
          headerShown: Platform.select({ ios: false, android: true }),
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create((theme) => ({
  back: {
    fontFamily: theme.fonts.sans.medium,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: Platform.select({
      ios: getOsMajorVersion() > 18 ? 'transparent' : theme.colors.background,
      android: theme.colors.background,
    }),
  },
}));
