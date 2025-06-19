import AsyncStorage from '@react-native-async-storage/async-storage';

import { GenericStackScreen } from '@/components/navigation';
import { Button, Text } from '@/components/ui';

export default function SettingsScreen() {
  return (
    <GenericStackScreen title="Nastavitve">
      <Text>Hello from Settings!</Text>
      <Button onPress={async () => await AsyncStorage.clear()} variant="terciary">
        Clear local storage
      </Button>
    </GenericStackScreen>
  );
}
