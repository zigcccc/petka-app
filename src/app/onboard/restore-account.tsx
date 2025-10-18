import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Platform, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { z } from 'zod';

import { Button, Text, TextInput } from '@/components/ui';
import { useValidateUserAccount } from '@/hooks/mutations';
import { useToaster } from '@/hooks/useToaster';
import { useUser } from '@/hooks/useUser';
import { getOsMajorVersion } from '@/utils/platform';

const restoreAccountModel = z.object({
  id: z.string().trim().min(1, { message: 'Polje je obvezno.' }),
  nickname: z.string().trim().min(1, { message: 'Polje je obvezno.' }),
});
type RestoreAccount = z.infer<typeof restoreAccountModel>;

export default function RestoreAccountScreen() {
  const router = useRouter();
  const { setUserId } = useUser();
  const toaster = useToaster();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isSubmitted, isValid },
    setFocus,
  } = useForm({
    resolver: zodResolver(restoreAccountModel),
    defaultValues: { id: '', nickname: '' },
  });

  const { mutate: validateAccountInfo } = useValidateUserAccount();

  const onSubmit: SubmitHandler<RestoreAccount> = async (data) => {
    try {
      const validatedUserInfo = await validateAccountInfo(data);
      if (validatedUserInfo?._id) {
        setUserId(validatedUserInfo._id);
        router.navigate('/onboard/gameplay-settings');
      } else {
        throw new Error('Invalid');
      }
    } catch {
      await toaster.toast('Napačni podatki', { intent: 'error' });
    }
  };
  return (
    <View style={styles.container}>
      <Text size="2xl" weight="bold">
        Obnovi svoj profil
      </Text>
      <Text size="lg">Vnesi podatke obstoječega profila.</Text>
      <View style={styles.content}>
        <Text color="grey70" size="sm">
          ID in uporabniško ime profila lahko najdeš na obstoječi napravi, v razdelku &quot;Nastavitve&quot;.
        </Text>
        <Controller
          control={control}
          name="id"
          render={({ field, fieldState }) => (
            <TextInput
              ref={field.ref}
              autoCapitalize="none"
              autoFocus
              error={fieldState.error?.message}
              label="ID"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              onSubmitEditing={() => setFocus('nickname')}
              placeholder="ID profila"
              returnKeyType="next"
              value={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="nickname"
          render={({ field, fieldState }) => (
            <TextInput
              ref={field.ref}
              autoCapitalize="none"
              error={fieldState.error?.message}
              label="Vzdevek"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              onSubmitEditing={handleSubmit(onSubmit)}
              placeholder="Vzdevek profila"
              returnKeyType="go"
              submitBehavior="submit"
              value={field.value}
            />
          )}
        />
      </View>
      <View style={{ flex: 1 }} />
      <Button disabled={isSubmitted && !isValid} loading={isSubmitting} onPress={handleSubmit(onSubmit)} size="lg">
        Obnovi profil
      </Button>
      <View style={styles.createAccountContainer}>
        <Text size="xs">
          Bi raje ustvaril/a nov profil?{' '}
          <Link href="..">
            <Text size="xs" weight="bold">
              Klikni tukaj.
            </Text>
          </Link>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    paddingTop: Platform.select({
      ios: getOsMajorVersion() > 18 ? theme.spacing[8] : theme.spacing[2],
      android: theme.spacing[2],
    }),
    paddingHorizontal: theme.spacing[6],
    paddingBottom: {
      xs: Platform.select({
        ios: getOsMajorVersion() > 18 ? rt.insets.ime : rt.insets.bottom + rt.insets.ime,
        android: rt.insets.bottom + rt.insets.ime,
      }),
      md: rt.insets.bottom + theme.spacing[6],
    },
  },
  content: {
    paddingTop: theme.spacing[8],
    gap: theme.spacing[6],
  },
  createAccountContainer: {
    paddingVertical: theme.spacing[5],
  },
}));
