import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useUser } from '@/hooks/useUser';

export default function AuthenticatedLayout() {
  const { theme } = useUnistyles();
  const router = useRouter();
  const { shouldCreateAccount, userId } = useUser();

  useEffect(() => {
    if (shouldCreateAccount) {
      router.navigate('/create-account');
    }
  }, [router, shouldCreateAccount, userId]);

  return (
    <Stack initialRouteName="index" screenOptions={{ contentStyle: styles.content }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="app-info" />
      <Stack.Screen name="history" />
      <Stack.Screen name="leaderboard" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="update-nickname" options={{ presentation: 'modal', title: '', headerShadowVisible: false }} />
      <Stack.Screen
        name="play/daily-puzzle"
        options={{
          headerBackTitle: 'Nazaj',
          headerBackTitleStyle: styles.back,
          headerShadowVisible: false,
          headerTintColor: theme.colors.petka.black,
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
          headerTintColor: theme.colors.petka.black,
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
    backgroundColor: theme.colors.white,
  },
}));
