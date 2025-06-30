import { Octicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export default function TabLayout() {
  const { theme } = useUnistyles();

  return (
    <Tabs
      initialRouteName="weekly-leaderboard"
      screenOptions={{ tabBarActiveTintColor: theme.colors.petka.green, sceneStyle: styles.content }}
    >
      <Tabs.Screen
        name="weekly-leaderboard"
        options={{
          title: 'Tedenska lestvica',
          tabBarIcon: ({ color }) => <Octicons color={color} name="calendar" size={24} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="all-time-leaderboard"
        options={{
          title: 'Lestvica vseh časov',
          tabBarIcon: ({ color }) => <Octicons color={color} name="mortar-board" size={24} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    backgroundColor: theme.colors.white,
  },
}));
