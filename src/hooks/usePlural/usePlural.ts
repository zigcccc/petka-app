import { useMemo } from 'react';

export type PluralTextMap = {
  zero?: string;
  one: string;
  two?: string;
  few?: string;
  many?: string;
};

export function usePlural(count: number, textsMap: PluralTextMap) {
  const normalizedCount = count % 100;

  return useMemo(() => {
    if (count === 0) {
      return textsMap.zero ?? textsMap.one;
    } else if (normalizedCount === 1) {
      return textsMap.one;
    } else if (normalizedCount === 2) {
      return textsMap.two ?? textsMap.one;
    } else if (normalizedCount === 3 || normalizedCount === 4) {
      return textsMap.few ?? textsMap.one;
    } else {
      return textsMap.many ?? textsMap.one;
    }
  }, [count, normalizedCount, textsMap]);
}
