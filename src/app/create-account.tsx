import { zodResolver } from '@hookform/resolvers/zod';
import { ConvexError } from 'convex/values';
import { useRouter } from 'expo-router';
import { useForm, Controller, type SubmitHandler, type SubmitErrorHandler } from 'react-hook-form';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button, Text, TextInput } from '@/components/ui';
import { type CreateUser, createUserModel } from '@/convex/users/models';
import { useToaster } from '@/hooks/useToaster';
import { useUser } from '@/hooks/useUser';

export default function CreateAccountScreen() {
  const router = useRouter();
  const { createUser } = useUser();
  const toaster = useToaster();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isSubmitted, isValid },
    setError,
  } = useForm({
    resolver: zodResolver(createUserModel),
    defaultValues: { nickname: '' },
  });

  const onSubmit: SubmitHandler<CreateUser> = async (data) => {
    try {
      await createUser(data);
      router.replace('/(authenticated)');
    } catch (err) {
      const isConflictError = err instanceof ConvexError && err.data.code === 409;
      const errMsg = isConflictError ? 'Ta vzdevek je zaseden' : 'Nekaj je šlo narobe';

      await toaster.toast(errMsg, { intent: 'error' });

      if (isConflictError) {
        setError('nickname', { message: `Vzdevek "${data.nickname}" je zaseden.`, type: 'value' });
      }
    }
  };

  const onValidationError: SubmitErrorHandler<CreateUser> = async (errors) => {
    const errMessage = errors.nickname?.message || errors.root?.message ? 'Popravite napake' : 'Nekaj je šlo narobe';
    await toaster.toast(errMessage, { intent: 'error' });
  };

  return (
    <View style={styles.container}>
      <Text size="2xl" weight="bold">
        Hej 👋
      </Text>
      <Text size="lg">Dobrodošel/a v Petki!</Text>
      <View style={styles.content}>
        <Text color="grey70" size="sm">
          Želim ti obilico uspeha in zabave pri reševanju izzivov! Vnesi svoj vzdevek, da se boš s svojimi izjemnimi
          rezultati lahko povalil/a na različnih lestvicah.
        </Text>
        <Controller
          control={control}
          name="nickname"
          render={({ field, fieldState }) => (
            <TextInput
              ref={field.ref}
              autoCapitalize="none"
              autoFocus
              error={fieldState.error?.message}
              label="Vzdevek"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              onSubmitEditing={handleSubmit(onSubmit, onValidationError)}
              placeholder="Tvoj vzdevek"
              returnKeyType="go"
              submitBehavior="submit"
              value={field.value}
            />
          )}
        />
      </View>
      <View style={{ flex: 1 }} />
      <Button
        disabled={isSubmitted && !isValid}
        loading={isSubmitting}
        onPress={handleSubmit(onSubmit, onValidationError)}
        size="lg"
      >
        Ustvari profil
      </Button>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    paddingTop: theme.spacing[2],
    paddingHorizontal: theme.spacing[6],
    paddingBottom: {
      xs: rt.insets.bottom + rt.insets.ime,
      md: rt.insets.bottom + theme.spacing[6],
    },
  },
  content: {
    paddingTop: theme.spacing[8],
    gap: theme.spacing[6],
  },
}));
