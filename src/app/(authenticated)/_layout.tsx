import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native-unistyles';

import { useUser } from '@/hooks/useUser';

export default function AuthenticatedLayout() {
  const router = useRouter();
  const { shouldCreateAccount } = useUser();

  useEffect(() => {
    if (shouldCreateAccount) {
      router.navigate('/create-account');
    }
  }, [router, shouldCreateAccount]);

  return (
    <Stack initialRouteName="index" screenOptions={{ contentStyle: styles.content }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="app-info" />
      <Stack.Screen name="history" />
      <Stack.Screen name="leaderboard" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="play/daily-puzzle" />
    </Stack>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    backgroundColor: theme.colors.white,
  },
}));
