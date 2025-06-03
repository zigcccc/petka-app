import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import '@/styles/unistyles';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
    'Inter-Bold': require('@/assets/fonts/inter/Inter-Bold.ttf'),
    'Inter-Light': require('@/assets/fonts/inter/Inter-Light.ttf'),
    'Inter-Medium': require('@/assets/fonts/inter/Inter-Medium.ttf'),
    'Inter-Regular': require('@/assets/fonts/inter/Inter-Regular.ttf'),
    'Inter-SemiBold': require('@/assets/fonts/inter/Inter-SemiBold.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <>
      <Stack initialRouteName="index">
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
