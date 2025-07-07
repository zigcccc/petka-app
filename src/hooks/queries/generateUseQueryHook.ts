import { useQuery } from 'convex/react';
import { type FunctionReference } from 'convex/server';
import { useRef } from 'react';

export function generateUseQueryHook<QueryFn extends FunctionReference<'query'>>(queryFn: QueryFn) {
  return function useQueryHook(args: QueryFn['_args'] | 'skip') {
    const data = useQuery(queryFn, args);

    if (typeof data === 'undefined') {
      return { isLoading: true, isNotFound: false, data: undefined } as const;
    }

    if (data === null) {
      return {
        isLoading: false as const,
        // If the return type of a query function is an array, the data can never be null (i.e. not found).
        // Adding this typecast in order to support this case in an otherwise generic function. Note that
        // this case will never be hit when dealing with arrays as responses (i.e. lists).
        isNotFound: true as QueryFn['_returnType'] extends unknown[] ? false : true,
        data: null as QueryFn['_returnType'] extends unknown[] ? QueryFn['_returnType'] : null,
      };
    }

    return { isLoading: false, isNotFound: false, data } as const;
  };
}

export function generateUseQueryHookWithTimestampArg<QueryFn extends FunctionReference<'query'>>(queryFn: QueryFn) {
  return function useQueryHook(args: Omit<QueryFn['_args'], 'timestamp'> | 'skip') {
    const timestampRef = useRef(Date.now());
    // @ts-expect-error Arg types mismatch - end usage is fine
    const data = useQuery(queryFn, args === 'skip' ? args : { ...args, timestamp: timestampRef.current });

    if (typeof data === 'undefined') {
      return { isLoading: true, isNotFound: false, data: null } as const;
    }

    if (data === null) {
      return {
        isLoading: false as const,
        // If the return type of a query function is an array, the data can never be null (i.e. not found).
        // Adding this typecast in order to support this case in an otherwise generic function. Note that
        // this case will never be hit when dealing with arrays as responses (i.e. lists).
        isNotFound: true as QueryFn['_returnType'] extends unknown[] ? false : true,
        data: null as QueryFn['_returnType'] extends unknown[] ? QueryFn['_returnType'] : null,
      };
    }

    return { isLoading: false, isNotFound: false, data } as const;
  };
}
