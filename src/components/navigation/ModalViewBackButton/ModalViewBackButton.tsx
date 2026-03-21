import { useRouter } from 'expo-router';
import { ChevronLeftIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/components/ui';

export function ModalViewBackButton({ canGoBack, tintColor }: { canGoBack?: boolean; tintColor?: string }) {
  const router = useRouter();

  if (!canGoBack) {
    return null;
  }

  return (
    <Pressable onPress={router.back} style={styles.container}>
      <ChevronLeftIcon color={tintColor} size={28} strokeWidth={2} />
      <Text weight="medium">Nazaj</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    paddingLeft: theme.spacing[2],
    paddingRight: theme.spacing[4],
    alignItems: 'center',
  },
}));
