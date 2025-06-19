import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { Asset } from 'expo-asset';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native-unistyles';

import 'react-native-reanimated';
import '@/styles/unistyles';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

function RootLayout() {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [fontsLoaded] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
    'Inter-Bold': require('@/assets/fonts/inter/Inter-Bold.ttf'),
    'Inter-Light': require('@/assets/fonts/inter/Inter-Light.ttf'),
    'Inter-Medium': require('@/assets/fonts/inter/Inter-Medium.ttf'),
    'Inter-Regular': require('@/assets/fonts/inter/Inter-Regular.ttf'),
    'Inter-SemiBold': require('@/assets/fonts/inter/Inter-SemiBold.ttf'),
  });

  const isReady = fontsLoaded && imagesLoaded;

  useEffect(() => {
    async function loadLocalImageAssets() {
      await Asset.loadAsync([
        require('@/assets/images/petka-app-icon.png'),
        require('@/assets/images/petka-app-wordmark.png'),
      ]);
      setImagesLoaded(true);
    }

    if (!imagesLoaded) {
      loadLocalImageAssets();
    }
  }, [imagesLoaded, setImagesLoaded]);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack screenOptions={{ contentStyle: styles.content }}>
          <Stack.Screen name="(authenticated)" options={{ headerShown: false }} />
          <Stack.Screen
            name="create-account"
            options={{ presentation: 'modal', title: '', headerShadowVisible: false }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

export default function RootLayoutWithProviders() {
  return (
    <ConvexProvider client={convex}>
      <RootLayout />
    </ConvexProvider>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    backgroundColor: theme.colors.white,
  },
}));
