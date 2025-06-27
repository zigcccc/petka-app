import * as Sentry from '@sentry/react-native';
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

Sentry.init({
  dsn: 'https://5239823974f8936789a62d8edb9beeb6@o4506279940587520.ingest.us.sentry.io/4509553115791360',
  sendDefaultPii: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  integrations: [
    Sentry.reactNavigationIntegration({ enableTimeToInitialDisplay: true }),
    Sentry.reactNativeTracingIntegration(),
    Sentry.mobileReplayIntegration({
      maskAllText: false,
      maskAllImages: false,
      maskAllVectors: false,
    }),
  ],
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

function RootLayoutWithProviders() {
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

export default Sentry.wrap(RootLayoutWithProviders);
