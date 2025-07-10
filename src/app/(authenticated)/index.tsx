import { Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Platform, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '@/components/ui';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/petka-app-wordmark.png')} style={styles.image} />
      <View style={styles.spacer} />
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
    width: '100%',
    height: 'auto',
    marginTop: 128,
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
}));
