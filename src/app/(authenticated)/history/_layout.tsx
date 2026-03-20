import { Tabs } from 'expo-router';
import { CalendarIcon, GraduationCapIcon } from 'lucide-react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export default function TabLayout() {
  const { theme } = useUnistyles();

  return (
    <Tabs
      initialRouteName="daily-challenges"
      screenOptions={{
        tabBarActiveTintColor: theme.colors.petka.green,
        sceneStyle: styles.content,
        tabBarStyle: styles.tabbar,
      }}
    >
      <Tabs.Screen
        name="daily-challenges"
        options={{
          title: 'Dnevni izzivi',
          tabBarIcon: ({ color }) => <CalendarIcon color={color} size={24} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="training-challenges"
        options={{
          title: 'Trening izzivi',
          tabBarIcon: ({ color }) => <GraduationCapIcon color={color} size={24} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    backgroundColor: theme.colors.background,
  },
  tabbar: {
    backgroundColor: theme.colors.background,
  },
}));
