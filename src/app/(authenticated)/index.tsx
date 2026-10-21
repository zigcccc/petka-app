import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { ChartLineIcon, GraduationCapIcon, HistoryIcon, InfoIcon, SettingsIcon } from 'lucide-react-native';
import { type ComponentRef, useCallback, useRef } from 'react';
import { Image, Platform, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { DailyPuzzleUsersPresence } from '@/components/elements';
import { Button, Text } from '@/components/ui';
import { useDailyPuzzlePresenceList } from '@/hooks/presence';
import { useGameplaySettings } from '@/hooks/useGameplaySettings';
import { useUser } from '@/hooks/useUser';
import { horizontalSafePadding } from '@/styles/insets';
import { getOsMajorVersion } from '@/utils/platform';

const WORDMARK_ASPECT_RATIO = 1168 / 224;
const WORDMARK_MAX_WIDTH = 400;

export default function HomeScreen() {
  const router = useRouter();
  const { isUninitialised, setDefaultSettings } = useGameplaySettings();
  const sheetRef = useRef<ComponentRef<typeof BottomSheetModal>>(null);
  const { user } = useUser();
  const presence = useDailyPuzzlePresenceList();

  const handleBottomSheetLinkPress = (href: Href) => {
    sheetRef.current?.dismiss();
    router.navigate(href);
  };

  useFocusEffect(
    useCallback(() => {
      const id = setImmediate(() => {
        if (isUninitialised) {
          sheetRef.current?.present();
        }
      });

      return () => clearImmediate(id);
    }, [isUninitialised])
  );

  return (
    <>
      <View style={styles.container}>
        <Image source={require('@/assets/images/petka-app-wordmark.png')} style={styles.image} />
        <View style={styles.spacer} />
        {presence && user?._id && <DailyPuzzleUsersPresence currentUserNickname={user.nickname} presence={presence} />}
        <View style={styles.actions}>
          <Button onPress={() => router.navigate('/play/daily-puzzle')} size="lg">
            Igraj
          </Button>
          <View style={styles.buttonRow}>
            <View style={styles.action}>
              <Button intent="secondary" onPress={() => router.navigate('/play/training-puzzle')} size="lg">
                <Button.Icon>
                  <GraduationCapIcon />
                </Button.Icon>
                <Button.Text>Trening</Button.Text>
              </Button>
            </View>
            <View style={styles.action}>
              <Button intent="secondary" onPress={() => router.navigate('/leaderboards/weekly-leaderboard')} size="lg">
                <Button.Icon>
                  <ChartLineIcon />
                </Button.Icon>
                <Button.Text>Lestvica</Button.Text>
              </Button>
            </View>
          </View>
          <View style={styles.buttonRow}>
            <View style={styles.action}>
              <Button intent="black" onPress={() => router.navigate('/app-info')} size="lg">
                <Button.Icon>
                  <InfoIcon />
                </Button.Icon>
              </Button>
            </View>
            <View style={styles.action}>
              <Button intent="black" onPress={() => router.navigate('/history/daily-challenges')} size="lg">
                <Button.Icon>
                  <HistoryIcon />
                </Button.Icon>
              </Button>
            </View>
            <View style={styles.action}>
              <Button intent="black" onPress={() => router.navigate('/settings')} size="lg">
                <Button.Icon>
                  <SettingsIcon />
                </Button.Icon>
              </Button>
            </View>
          </View>
        </View>
      </View>
      <BottomSheetModal
        accessibilityLabel="Settings not configured alert"
        accessibilityRole="alert"
        backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandleIndicator}
        onDismiss={setDefaultSettings}
        ref={sheetRef}
      >
        <BottomSheetView style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <Text size="lg" weight="bold">
              🛠️ Prilagodi nastavitve reševanja
            </Text>
            <Text color="grey70" size="base">
              Na tej napravi še nisi nastavil/a svojih preferenc glede reševanja ugank.
            </Text>
          </View>
          <View style={styles.sheetContent}>
            <Text color="grey70" size="sm">
              Za bolj prilagojeno in lažje reševanje lahko izbirate med naslednjimi nastavitvami:
            </Text>
            <View>
              <Text color="grey70" size="sm">
                - razporeditev tipkovnice (qwerty ali abcde)
              </Text>
              <Text color="grey70" size="sm">
                - avtomatsko preverjanje besed ob vnosu zadnje črke
              </Text>
            </View>
            <Text color="grey70" size="sm">
              Privzete nastavitve so avtomatsko preverjanje in razporeditev tipkovnice v qwerty slogu.
            </Text>
          </View>
          <View style={styles.sheetActions}>
            <Button onPress={() => handleBottomSheetLinkPress('/settings')}>Prilagodi nastavitve</Button>
            <Button onPress={() => sheetRef.current?.dismiss()} variant="outline">
              Uporabi privzete nastavitve
            </Button>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    ...horizontalSafePadding(rt.insets, theme.spacing[7]),
    paddingBottom: Platform.select({ android: rt.insets.bottom, ios: getOsMajorVersion() > 18 ? rt.insets.bottom : 0 }),
    justifyContent: 'center',
  },
  spacer: {
    flex: 1,
  },
  // Explicit size instead of breakpoints + `aspectRatio`, which isn't reapplied reliably when the window resizes
  image: {
    resizeMode: 'contain',
    width: Math.min(rt.screen.width - rt.insets.left - rt.insets.right - 2 * theme.spacing[7], WORDMARK_MAX_WIDTH),
    height:
      Math.min(rt.screen.width - rt.insets.left - rt.insets.right - 2 * theme.spacing[7], WORDMARK_MAX_WIDTH) /
      WORDMARK_ASPECT_RATIO,
    marginTop: Platform.select({
      ios: getOsMajorVersion() > 18 ? rt.insets.top + 128 : 128,
      android: 128 + rt.insets.top,
    }),
    alignSelf: 'center',
  },
  actions: {
    flexDirection: 'column',
    gap: theme.spacing[4],
  },
  action: {
    flexGrow: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing[4],
  },
  sheetBackground: {
    backgroundColor: theme.colors.background,
  },
  sheetHandleIndicator: {
    backgroundColor: theme.colors.grey[30],
  },
  sheetContainer: {
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[4] + rt.insets.bottom,
    ...horizontalSafePadding(rt.insets, theme.spacing[5]),
  },
  sheetHeader: {
    gap: theme.spacing[1],
  },
  sheetContent: {
    marginVertical: theme.spacing[5],
    gap: theme.spacing[2],
  },
  sheetActions: {
    marginTop: theme.spacing[4],
    gap: theme.spacing[3],
  },
}));
