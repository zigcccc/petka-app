import dayjs from 'dayjs';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { Switch, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { GenericStackScreen } from '@/components/navigation';
import { Button, Card, Text } from '@/components/ui';
import { useToaster } from '@/hooks/useToaster';
import { useUser } from '@/hooks/useUser';

export default function SettingsScreen() {
  const router = useRouter();
  const toaster = useToaster();
  const { user, deleteUser, isDeleting } = useUser();

  const handleCopyUserId = async () => {
    await Clipboard.setStringAsync(user?._id ?? '');
    toaster.toast('ID kopiran', { message: user?._id, intent: 'success' });
  };

  return (
    <GenericStackScreen title="Nastavitve">
      <View style={styles.container}>
        <Card title="Obvestila">
          <Card.ActionRow
            action={<Switch onValueChange={console.log} value={true} />}
            title="Dovoli pošiljanje potisnih obvestil"
          >
            Potisno obvestilo boste prejeli 1x dnevno kot opomnik za dnevni izziv.
          </Card.ActionRow>
        </Card>
        <Card title="Uporabiški profil">
          <Card.ActionRow
            action={
              <Button intent="terciary" onPress={() => router.navigate('/update-nickname')} size="xs" variant="outline">
                Spremeni
              </Button>
            }
            title="Tvoj vzdevek"
          >
            <Text color="grey70" size="lg" weight="semibold">
              {user?.nickname}
            </Text>
          </Card.ActionRow>
          <Card.ActionRow title="Profil ustvarjen">
            {user?._creationTime ? dayjs(user?._creationTime).format('DD. MMM YYYY') : null}
          </Card.ActionRow>
          <Card.ActionRow
            action={
              <Button intent="terciary" onPress={handleCopyUserId} size="xs" variant="outline">
                Kopiraj
              </Button>
            }
            title="ID profila"
          >
            <Text color="grey70" size="xs">
              {user?._id}
            </Text>
          </Card.ActionRow>
          <Button
            intent="danger"
            loading={isDeleting}
            onPress={() => deleteUser(() => router.replace('/create-account'))}
            size="sm"
            variant="outline"
          >
            Izbriši uporabniški račun
          </Button>
        </Card>
      </View>
    </GenericStackScreen>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingTop: theme.spacing[4],
    gap: theme.spacing[8],
  },
}));
