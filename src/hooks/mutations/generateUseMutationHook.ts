import { useMutation } from 'convex/react';
import { type FunctionReference } from 'convex/server';
import { usePostHog } from 'posthog-react-native';
import { useState, useCallback } from 'react';

export function generateUseMutationHook<MutationFn extends FunctionReference<'mutation'>>(mutationFn: MutationFn) {
  return function useMutationHook() {
    const posthog = usePostHog();
    const [isLoading, setIsLoading] = useState(false);
    const mutation = useMutation(mutationFn);

    const mutate = useCallback(
      async (args: MutationFn['_args']) => {
        try {
          setIsLoading(true);
          const returnValue = await mutation(args);
          return returnValue;
        } catch (err) {
          posthog.captureException(err, { mutation: mutationFn._componentPath || 'unknown', args });
          throw err;
        } finally {
          setIsLoading(false);
        }
      },
      [mutation, posthog]
    );

    return { isLoading, mutate } as const;
  };
}
