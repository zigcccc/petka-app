import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as Sentry from '@sentry/react-native';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import dayjs from 'dayjs';
import { Asset } from 'expo-asset';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { type Href, Stack, useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Tracking from 'expo-tracking-transparency';
import { PostHogProvider, usePostHog } from 'posthog-react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native-unistyles';

import { ActionSheetProvider } from '@/context/ActionSheet';
import { PromptProvider } from '@/context/Prompt';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useUser } from '@/hooks/useUser';
import { registerForPushNotificationsAsync } from '@/utils/notifications';

import 'dayjs/locale/sl';
import 'react-native-reanimated';
import '@/styles/unistyles';

dayjs.locale('sl');

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

Sentry.init({
  enabled: !Constants.debugMode,
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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function RootLayout() {
  const posthog = usePostHog();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const notifications = usePushNotifications(user?._id);
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
    async function requestPushNotificationsPermissionsAsync() {
      try {
        await registerForPushNotificationsAsync();
      } catch {
        // pass
      }
    }
    async function requestAppTrackingPermissionsAsync() {
      try {
        const { granted } = await Tracking.requestTrackingPermissionsAsync();

        if (granted) {
          posthog.optIn();
        }
      } catch {
        posthog.optOut();
      }
    }
    requestAppTrackingPermissionsAsync();
    requestPushNotificationsPermissionsAsync();
  }, [posthog]);

  useEffect(() => {
    async function loadLocalImageAssets() {
      await Asset.loadAsync([
        require('@/assets/images/petka-app-icon.png'),
        require('@/assets/images/petka-app-wordmark.png'),
        require('@/assets/images/no-leaderboards.png'),
        require('@/assets/images/error.png'),
      ]);
      setImagesLoaded(true);
    }

    if (!imagesLoaded) {
      loadLocalImageAssets();
    }
  }, [imagesLoaded]);

  useEffect(() => {
    posthog.screen(pathname, params);
  }, [pathname, params, posthog]);

  useEffect(() => {
    if (user) {
      posthog.identify(user._id, user);
      notifications.register(user._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url;

      if (typeof url === 'string') {
        posthog.capture('notifications:opened', { url });
        router.push(url as Href);
      }
    });

    return () => subscription.remove();
  }, [posthog, router]);

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ contentStyle: styles.content }}>
        <Stack.Screen name="(authenticated)" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboard"
          options={{
            presentation: 'modal',
            title: '',
            headerShadowVisible: false,
            gestureEnabled: false,
            headerBackVisible: false,
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

function RootLayoutWithProviders() {
  return (
    <PostHogProvider
      apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY}
      autocapture={false}
      options={{ host: 'https://eu.i.posthog.com', disabled: __DEV__, defaultOptIn: false }}
    >
      <ConvexProvider client={convex}>
        <GestureHandlerRootView>
          <BottomSheetModalProvider>
            <ActionSheetProvider>
              <PromptProvider>
                <RootLayout />
              </PromptProvider>
            </ActionSheetProvider>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </ConvexProvider>
    </PostHogProvider>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    backgroundColor: theme.colors.white,
  },
}));

export default Sentry.wrap(RootLayoutWithProviders);
