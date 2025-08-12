import { useRouter } from 'expo-router';
import { Switch, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button, Card, Hint, RadioInput, Text } from '@/components/ui';
import { gameplayKeyboardType, useGameplaySettings } from '@/hooks/useGameplaySettings';

export default function GameplaySettingsScreen() {
  const router = useRouter();
  const { autosubmitPuzzleAttempt, keyboardType, updateSettings, isUninitialised, setDefaultSettings } =
    useGameplaySettings();

  const handleConfirmSettings = async () => {
    if (isUninitialised) {
      await setDefaultSettings();
    }
    router.replace('/(authenticated)');
  };

  return (
    <View style={styles.container}>
      <Text size="2xl" weight="bold">
        Preden začneš...
      </Text>
      <Text size="lg">Izberi svoje preference glede načina igranja.</Text>
      <View style={styles.content}>
        <View style={styles.textContainer}>
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
        </View>
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
        </Card>
        <Hint intent="info" title="Nastavitve lahko spremeniš kadarkoli">
          <Text color="grey70" size="xs">
            V nastavitvah aplikacije lahko kadarkoli posodobiš svoje preference, tudi ko jih boš enkrat potrdil/a na tem
            zaslonu.
          </Text>
        </Hint>
      </View>
      <View style={{ flex: 1 }} />
      <Button onPress={handleConfirmSettings} size="lg">
        Potrdi preference
      </Button>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    paddingTop: theme.spacing[2],
    paddingHorizontal: theme.spacing[6],
    paddingBottom: {
      xs: rt.insets.bottom + rt.insets.ime,
      md: rt.insets.bottom + theme.spacing[6],
    },
  },
  content: {
    paddingTop: theme.spacing[8],
    gap: theme.spacing[6],
  },
  textContainer: {
    marginBottom: theme.spacing[5],
    gap: theme.spacing[2],
  },
  radioContainer: {
    paddingTop: theme.spacing[5],
  },
}));
