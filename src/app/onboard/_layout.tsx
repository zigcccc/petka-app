import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native-unistyles';

export default function OnboardLayout() {
  return (
    <Stack screenOptions={{ contentStyle: styles.content, headerShown: false }}>
      <Stack.Screen name="create-account" />
      <Stack.Screen name="gameplay-settings" />
    </Stack>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    backgroundColor: theme.colors.white,
  },
}));
