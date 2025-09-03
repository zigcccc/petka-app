import { Octicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { type ComponentRef, useCallback, useRef } from 'react';
import { Image, InteractionManager, Platform, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { DailyPuzzleUsersPresence } from '@/components/elements';
import { Button, Text } from '@/components/ui';
import { useDailyPuzzlePresenceList } from '@/hooks/presence';
import { useGameplaySettings } from '@/hooks/useGameplaySettings';
import { useUser } from '@/hooks/useUser';

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
      const task = InteractionManager.runAfterInteractions(() => {
        if (isUninitialised) {
          sheetRef.current?.present();
        }
      });

      return () => task.cancel();
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
                  <Octicons name="mortar-board" />
                </Button.Icon>
                <Button.Text>Trening</Button.Text>
              </Button>
            </View>
            <View style={styles.action}>
              <Button intent="secondary" onPress={() => router.navigate('/leaderboards/weekly-leaderboard')} size="lg">
                <Button.Icon>
                  <Octicons name="graph" />
                </Button.Icon>
                <Button.Text>Lestvica</Button.Text>
              </Button>
            </View>
          </View>
          <View style={styles.buttonRow}>
            <View style={styles.action}>
              <Button intent="terciary" onPress={() => router.navigate('/app-info')} size="lg">
                <Button.Icon>
                  <Octicons name="info" />
                </Button.Icon>
              </Button>
            </View>
            <View style={styles.action}>
              <Button intent="terciary" onPress={() => router.navigate('/history/daily-challenges')} size="lg">
                <Button.Icon>
                  <Octicons name="history" />
                </Button.Icon>
              </Button>
            </View>
            <View style={styles.action}>
              <Button intent="terciary" onPress={() => router.navigate('/settings')} size="lg">
                <Button.Icon>
                  <Octicons name="gear" />
                </Button.Icon>
              </Button>
            </View>
          </View>
        </View>
      </View>
      <BottomSheetModal
        ref={sheetRef}
        accessibilityLabel="Settings not configured alert"
        accessibilityRole="alert"
        backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />}
        onDismiss={setDefaultSettings}
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
    paddingHorizontal: theme.spacing[7],
    paddingBottom: Platform.select({ android: rt.insets.bottom, ios: 0 }),
    justifyContent: 'center',
  },
  spacer: {
    flex: 1,
  },
  image: {
    aspectRatio: '1168/224',
    resizeMode: 'contain',
    width: {
      xs: '100%',
      md: 400,
    },
    height: 'auto',
    marginTop: 128,
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
  sheetContainer: {
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[4] + rt.insets.bottom,
    paddingHorizontal: theme.spacing[5],
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
