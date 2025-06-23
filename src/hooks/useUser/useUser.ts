import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery } from 'convex/react';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { api } from '@/convex/_generated/api';

import { useToaster } from '../useToaster';

export const LOADING_USER_ID = Symbol('LoadingUserId');

export function useUser() {
  const toaster = useToaster();
  const [userId, setUserId] = useState<string | null | typeof LOADING_USER_ID>(LOADING_USER_ID);
  const [isDeleting, setIsDeleting] = useState(false);
  const hasUserId = userId !== LOADING_USER_ID && userId !== null;
  const shouldCreateAccount = userId !== LOADING_USER_ID && userId === null;

  const patchUser = useMutation(api.users.queries.patch);
  const deleteUser = useMutation(api.users.queries.destroy);
  const user = useQuery(api.users.queries.read, hasUserId ? { id: userId } : 'skip');

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
            setIsDeleting(true);
            try {
              await deleteUser({ id: user?._id! });
              await handleSetUserId(null);
              onDeleteCb?.();
            } catch {
              await toaster.toast('Nekaj je šlo narobe', { intent: 'error' });
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
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
    async function getUserIdFromStorage() {
      const savedUserId = await AsyncStorage.getItem('userId').catch(() => null);
      setUserId(savedUserId);
    }
    getUserIdFromStorage();
  }, [setUserId]);

  return {
    userId,
    isUnitialized: userId === LOADING_USER_ID,
    isDeleting,
    hasUserId,
    shouldCreateAccount,
    setUserId: handleSetUserId,
    deleteUser: handleDeleteUserAccount,
    updateUser: patchUser,
    user,
  } as const;
}
