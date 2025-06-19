import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from 'convex/react';
import { useEffect, useState } from 'react';

import { api } from '@/convex/_generated/api';

const LOADING_USER_ID = Symbol('LoadingUserId');

export function useUser() {
  const [userId, setUserId] = useState<string | null | typeof LOADING_USER_ID>(LOADING_USER_ID);
  const hasUserId = userId !== LOADING_USER_ID && userId !== null;
  const shouldCreateAccount = userId !== LOADING_USER_ID && userId === null;
  const user = useQuery(api.users.queries.read, hasUserId ? { id: userId } : 'skip');

  const handleSetUserId = async (userId: string) => {
    await AsyncStorage.setItem('userId', userId);
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
    hasUserId,
    shouldCreateAccount,
    setUserId: handleSetUserId,
    user,
  } as const;
}
