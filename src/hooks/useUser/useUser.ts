import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePostHog } from 'posthog-react-native';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { type CreateUser, type PatchUser } from '@/convex/users/models';

import { useCreateUserMutation, useDeleteUserMutation, usePatchUserMutation } from '../mutations';
import { useUserQuery } from '../queries';
import { useToaster } from '../useToaster';

export const LOADING_USER_ID = Symbol('LoadingUserId');

export function useUser() {
  const posthog = usePostHog();
  const toaster = useToaster();
  const [userId, setUserId] = useState<string | null | typeof LOADING_USER_ID>(LOADING_USER_ID);
  const hasUserId = userId !== LOADING_USER_ID && userId !== null;
  const shouldCreateAccount = userId !== LOADING_USER_ID && userId === null;

  const { mutate: createUser } = useCreateUserMutation();
  const { mutate: patchUser } = usePatchUserMutation();
  const { mutate: deleteUser, isLoading: isDeleting } = useDeleteUserMutation();
  const { data: user, isNotFound } = useUserQuery(hasUserId ? { id: userId } : 'skip');

  const handleDeleteUserAccount = (onDeleteCb?: () => void) => {
    Alert.alert(
      'Si prepričan/a?',
      'Ko je uporabniški profil enkrat izbrisan se izgubijo vsi podatki o že odigranih izzivih.',
      [
        { isPreferred: true, style: 'cancel', text: 'Prekliči' },
        {
          style: 'destructive',
          text: 'Potrdi',
          onPress: async () => {
            const id = user?._id;

            if (!id) {
              return;
            }

            try {
              await deleteUser({ id });
              posthog.capture('users:delete', { userId: id });
              await handleSetUserId(null);
              onDeleteCb?.();
            } catch {
              await toaster.toast('Nekaj je šlo narobe.', { intent: 'error' });
            }
          },
        },
      ]
    );
  };

  const handleCreateUser = async (data: CreateUser) => {
    const createdUserId = await createUser({ data });
    handleSetUserId(createdUserId);
    posthog.capture('users:created', { userId: createdUserId });
  };

  const handleUpdateUser = async (data: PatchUser) => {
    if (!user?._id) {
      return;
    }

    await patchUser({ id: user._id, data });
    posthog.capture('users:update', { userId: user._id, properties: Object.keys(data) });
  };

  const handleSetUserId = async (userId: string | null) => {
    if (userId) {
      await AsyncStorage.setItem('userId', userId);
    } else {
      await AsyncStorage.removeItem('userId');
    }
    setUserId(userId);
  };

  useEffect(() => {
    AsyncStorage.getItem('userId')
      .then((savedUserId) => setUserId(savedUserId))
      .catch(() => setUserId(null));
  }, []);

  return {
    deleteUser: handleDeleteUserAccount,
    hasUserId,
    isDeleting,
    isNotFound,
    isUnitialized: userId === LOADING_USER_ID,
    setUserId: handleSetUserId,
    shouldCreateAccount,
    createUser: handleCreateUser,
    updateUser: handleUpdateUser,
    user,
    userId,
  } as const;
}
