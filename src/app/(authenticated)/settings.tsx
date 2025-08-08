import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import * as Clipboard from 'expo-clipboard';
import * as Device from 'expo-device';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { Switch, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { GenericStackScreen } from '@/components/navigation';
import { Button, Card, RadioInput, Text } from '@/components/ui';
import { gameplayKeyboardType, useGameplaySettings } from '@/hooks/useGameplaySettings';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToaster } from '@/hooks/useToaster';
import { useUser } from '@/hooks/useUser';
import { defaultTheme } from '@/styles/themes';

export default function SettingsScreen() {
  const router = useRouter();
  const toaster = useToaster();
  const { user, deleteUser, isDeleting } = useUser();
  const { status, toggle, systemNotificationsEnabled } = usePushNotifications(user?._id);
  const { autosubmitPuzzleAttempt, keyboardType, updateSettings, setDefaultSettings } = useGameplaySettings();

  const handleCopyUserId = async () => {
    await Clipboard.setStringAsync(user?._id ?? '');
    toaster.toast('ID kopiran', { message: user?._id, intent: 'success' });
  };

  const handleOpenAppSettings = async () => {
    await Linking.openSettings();
  };

  return (
    <GenericStackScreen title="Nastavitve">
      <View style={styles.container}>
        <Card title="Nastavitve igranja">
          <Card.ActionRow
            action={
              <Switch
                accessibilityLabel="Avtomatsko preveri besedo"
                accessibilityValue={{ text: autosubmitPuzzleAttempt ? 'On' : 'Off' }}
                onValueChange={(newValue) => updateSettings({ autosubmitPuzzleAttempt: newValue })}
                value={autosubmitPuzzleAttempt}
              />
            }
            title="Avtomatsko preveri besedo"
          >
            Beseda se preveri samodejno po vnosu 5. črke, sicer ob pritisku na &quot;Enter&quot;.
          </Card.ActionRow>
          <Card.ActionRow
            extra={
              <RadioInput
                onChange={(newKeyboardType) => updateSettings({ keyboardType: newKeyboardType })}
                style={styles.radioContainer}
                value={keyboardType}
              >
                <RadioInput.Item label="QWERTY tipkovnica" value={gameplayKeyboardType.Enum.qwerty} />
                <RadioInput.Item label="ABCDE tipkovnica" value={gameplayKeyboardType.Enum.abcde} />
              </RadioInput>
            }
            title="Razporeditev tipk"
          >
            Določa razporeditev črk na tipkovnici (QWERTY ali ABCDE). Ne vpliva na preverjanje besed.
          </Card.ActionRow>
          <Button intent="terciary" onPress={setDefaultSettings} size="sm" variant="outline">
            Ponastavi
          </Button>
        </Card>
        <Card title="Obvestila">
          <Card.ActionRow
            action={
              <Switch
                accessibilityLabel="Dovoli pošiljanje potisnih obvestil"
                accessibilityState={{ disabled: !Device.isDevice }}
                accessibilityValue={{ text: status?.hasToken && systemNotificationsEnabled ? 'On' : 'Off' }}
                disabled={!Device.isDevice || !systemNotificationsEnabled}
                onValueChange={toggle}
                value={status?.hasToken && systemNotificationsEnabled}
              />
            }
            title="Dovoli pošiljanje potisnih obvestil"
          >
            Potisno obvestilo boste prejeli 1x dnevno kot opomnik za dnevni izziv.
          </Card.ActionRow>
          {!systemNotificationsEnabled && (
            <View style={styles.hint}>
              <View style={styles.hintHeader}>
                <Ionicons color={defaultTheme.colors.gold[40]} name="information-circle" size={16} />
                <Text color="gold40" size="sm" weight="bold">
                  Preprečil/a si pošiljanje potisnih obvestil
                </Text>
              </View>
              <View style={styles.hintBody}>
                <Text color="grey70" size="xs">
                  Ta naprava nima dovoljenja za pošiljanje potisnih obvestil. Preden lahko vklopiš pošiljanje obvestil v
                  aplikaciji, moraš to omogočiti v nastavitvah naprave.
                </Text>
              </View>
              <Button intent="warning" onPress={handleOpenAppSettings} size="sm" variant="outline">
                Odpri nastavitve
              </Button>
            </View>
          )}
        </Card>
        <Card title="Uporabniški profil">
          <Card.ActionRow
            action={
              <Button intent="terciary" onPress={() => router.navigate('/update-nickname')} size="xs" variant="outline">
                Spremeni
              </Button>
            }
            title="Tvoj vzdevek"
          >
            <Text color="grey70" size="lg" weight="semibold">
              {user?.nickname}
            </Text>
          </Card.ActionRow>
          <Card.ActionRow title="Profil ustvarjen">
            {user?._creationTime ? dayjs(user?._creationTime).format('DD. MMM YYYY') : null}
          </Card.ActionRow>
          <Card.ActionRow
            action={
              <Button intent="terciary" onPress={handleCopyUserId} size="xs" variant="outline">
                Kopiraj
              </Button>
            }
            title="ID profila"
          >
            <Text color="grey70" size="xs">
              {user?._id}
            </Text>
          </Card.ActionRow>
          <Button
            intent="danger"
            loading={isDeleting}
            onPress={() => deleteUser(() => router.replace('/create-account'))}
            size="sm"
            variant="outline"
          >
            Izbriši uporabniški račun
          </Button>
        </Card>
      </View>
    </GenericStackScreen>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingTop: theme.spacing[4],
    gap: theme.spacing[8],
  },
  radioContainer: {
    paddingTop: theme.spacing[5],
  },
  hint: {
    backgroundColor: theme.colors.gold[5],
    padding: theme.spacing[3],
    borderRadius: 8,
  },
  hintHeader: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    alignItems: 'center',
  },
  hintBody: {
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[3],
  },
}));
