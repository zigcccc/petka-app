import { Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, View } from 'react-native';
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
              <Octicons color="white" name="mortar-board" size={22} />
              <Button.Text>Trening</Button.Text>
            </Button>
          </View>
          <View style={styles.action}>
            <Button intent="secondary" onPress={() => router.navigate('/leaderboards/weekly-leaderboard')} size="lg">
              <Octicons color="white" name="graph" size={22} />
              <Button.Text>Lestvica</Button.Text>
            </Button>
          </View>
        </View>
        <View style={styles.buttonRow}>
          <View style={styles.action}>
            <Button intent="terciary" onPress={() => router.navigate('/app-info')} size="lg">
              <Octicons color="white" name="info" size={22} />
            </Button>
          </View>
          <View style={styles.action}>
            <Button intent="terciary" onPress={() => router.navigate('/history/daily-challenges')} size="lg">
              <Octicons color="white" name="history" size={22} />
            </Button>
          </View>
          <View style={styles.action}>
            <Button intent="terciary" onPress={() => router.navigate('/settings')} size="lg">
              <Octicons color="white" name="gear" size={22} />
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing[7],
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
  heading: {
    fontFamily: theme.fonts.sans.bold,
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
