import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useUser } from '@/hooks/useUser';

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
      <Stack.Screen name="leaderboard" />
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
        }}
      />
      <Stack.Screen
        name="play/daily-puzzle-solved"
        options={{ gestureEnabled: false, headerShadowVisible: false, title: '', presentation: 'modal' }}
      />
      <Stack.Screen
        name="play/training-puzzle"
        options={{
          headerBackTitle: 'Nazaj',
          headerBackTitleStyle: styles.back,
          headerShadowVisible: false,
          headerTintColor: theme.colors.foreground,
          title: '',
        }}
      />
      <Stack.Screen
        name="play/training-puzzle-solved"
        options={{ gestureEnabled: false, headerShadowVisible: false, title: '', presentation: 'modal' }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create((theme) => ({
  back: {
    fontFamily: theme.fonts.sans.medium,
  },
  content: {
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.background,
  },
}));
