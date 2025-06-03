import { Stack } from 'expo-router';
import { SafeAreaView, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <SafeAreaView>
        <Text>This screen does not exist.</Text>
      </SafeAreaView>
    </>
  );
}
