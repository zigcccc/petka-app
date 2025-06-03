import { SafeAreaView, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export default function HomeScreen() {
  return (
    <SafeAreaView>
      <View>
        <Text style={styles.heading}>Welcome to Routable!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  heading: {
    fontFamily: theme.fonts.sans.bold,
  },
}));
