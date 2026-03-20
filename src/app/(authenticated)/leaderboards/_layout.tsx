import { Tabs } from 'expo-router';
import { CalendarIcon, GraduationCapIcon } from 'lucide-react-native';
import { withUnistyles } from 'react-native-unistyles';

const StyledTabs = withUnistyles(Tabs, (theme) => ({
  screenOptions: {
    tabBarActiveTintColor: theme.colors.petka.green,
    sceneStyle: { flex: 1, backgroundColor: theme.colors.background },
    tabBarStyle: { backgroundColor: theme.colors.background },
  },
}));

export default function LeaderboardsTabsLayout() {
  return (
    <StyledTabs initialRouteName="weekly-leaderboard">
      <Tabs.Screen
        name="weekly-leaderboard"
        options={{
          title: 'Tedenska lestvica',
          tabBarIcon: ({ color }) => <CalendarIcon color={color} size={24} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="all-time-leaderboard"
        options={{
          title: 'Lestvica vseh časov',
          tabBarIcon: ({ color }) => <GraduationCapIcon color={color} size={24} />,
          headerShown: false,
        }}
      />
    </StyledTabs>
  );
}
