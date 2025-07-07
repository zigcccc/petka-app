import { zodResolver } from '@hookform/resolvers/zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useConvex } from 'convex/react';
import { ConvexError } from 'convex/values';
import { router } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useForm, type SubmitHandler, type SubmitErrorHandler, Controller } from 'react-hook-form';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text, TextInput, Button } from '@/components/ui';
import { api } from '@/convex/_generated/api';
import { createUserModel, type CreateUser } from '@/convex/users/models';
import { useToaster } from '@/hooks/useToaster';
import { useUser } from '@/hooks/useUser';

export default function UpdateNicknameScreen() {
  const toaster = useToaster();
  const convex = useConvex();
  const posthog = usePostHog();
  const { updateUser } = useUser();
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting, isDirty },
    setError,
  } = useForm({
    resolver: zodResolver(createUserModel),
    async defaultValues() {
      const userId = await AsyncStorage.getItem('userId');
      const user = userId ? await convex.query(api.users.queries.read, { id: userId }) : null;
      return { nickname: user ? user.nickname : '' };
    },
  });

  const onSubmit: SubmitHandler<CreateUser> = async (data) => {
    try {
      await updateUser(data);
      router.back();
    } catch (err) {
      const isConflictError = err instanceof ConvexError && err.data.code === 409;
      const errMsg = isConflictError ? 'Ta vzdevek je zaseden' : 'Nekaj je šlo narobe';

      await toaster.toast(errMsg, { intent: 'error' });

      if (isConflictError) {
        setError('nickname', { message: `Vzdevek "${data.nickname}" je zaseden.`, type: 'value' });
      } else {
        posthog.captureException(err, { mutation: 'patchUser', data });
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
        Posodobi vzdevek
      </Text>
      <View style={styles.content}>
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
        disabled={!isValid || !isDirty}
        loading={isSubmitting}
        onPress={handleSubmit(onSubmit, onValidationError)}
        size="lg"
      >
        Posodobi vzdevek
      </Button>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    paddingTop: theme.spacing[2],
    paddingHorizontal: theme.spacing[6],
    paddingBottom: rt.insets.bottom + rt.insets.ime,
  },
  content: {
    paddingTop: theme.spacing[8],
    gap: theme.spacing[6],
  },
}));
