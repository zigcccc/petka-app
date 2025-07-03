import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { Linking, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { GenericStackScreen } from '@/components/navigation';
import { Button, Card, Text } from '@/components/ui';
import { useToaster } from '@/hooks/useToaster';

export default function AppInfoScreen() {
  const toaster = useToaster();

  const handleCopyAppVersions = async () => {
    await Clipboard.setStringAsync(
      `App version: ${Constants.expoConfig?.version}\nSDK version: ${Constants.expoConfig?.sdkVersion}`
    );
    toaster.toast('Kopirano', { intent: 'success' });
  };

  return (
    <GenericStackScreen title="Informacije">
      <View style={styles.container}>
        <Card title="O aplikaciji">
          <Text size="sm">
            Aplikacija Petka je slovenska različica popularne miselne igre{' '}
            <Text onPress={() => Linking.openURL('https://en.wikipedia.org/wiki/Wordle')} size="sm">
              &quot;Wordle&quot;
            </Text>
            . Je besedna igra, kjer moraš v šestih poskusih uganiti petčrkovno besedo. Po vsakem poskusu dobiš namige o
            tem, katere črke so prave in na pravem mestu.
          </Text>
        </Card>
        <Card title="O razvijalcu">
          <Text size="sm">
            Hej hej, sem Žiga Krašovec, razvijalec spletnih in mobilnih aplikacij in avtor te aplikacije. V kolikor imaš
            kakršnokoli vprašanje ali predlog za izboljšavo, me kontaktiraj!
          </Text>
          <View style={styles.cardActions}>
            <Button
              intent="terciary"
              onPress={() =>
                Linking.openURL('mailto:zkrasovec@gmail.com').catch(() =>
                  toaster.toast('Nekaj je šlo narobe.', { intent: 'error' })
                )
              }
              size="sm"
              variant="outline"
            >
              Pošlji mi e-pošto
            </Button>
            <Button
              intent="terciary"
              onPress={() => Linking.openURL('https://github.com/zigcccc/')}
              size="sm"
              variant="outline"
            >
              Najdi me ne GitHub-u
            </Button>
            <Button
              intent="terciary"
              onPress={() => Linking.openURL('https://www.linkedin.com/in/zigakrasovec/')}
              size="sm"
              variant="outline"
            >
              Poveživa se na LinkedIn-u
            </Button>
          </View>
        </Card>
        <Card title="Tehnične podrobnosti">
          <Card.ActionRow title="Verzija aplikacije">{Constants.expoConfig?.version}</Card.ActionRow>
          <Card.ActionRow title="Verzija SDK">{Constants.expoConfig?.sdkVersion}</Card.ActionRow>
          <Button intent="terciary" onPress={handleCopyAppVersions} size="sm" variant="outline">
            Kopiraj vrednosti
          </Button>
        </Card>
      </View>
    </GenericStackScreen>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing[8],
  },
  cardActions: {
    gap: theme.spacing[3],
  },
}));
