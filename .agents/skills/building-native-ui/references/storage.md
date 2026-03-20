# Storage

## Key-Value Storage

Use MMKV (`react-native-mmkv`) for all key-value storage needs. It is synchronous, fast, and already set up in this project. **Do not use AsyncStorage or the localStorage polyfill.**

The shared MMKV instance is exported from `@/utils/storage`:

```tsx
import { storage } from '@/utils/storage';

// Strings
storage.set('key', 'value');
storage.getString('key');

// Booleans / numbers
storage.set('flag', true);
storage.getBoolean('flag');

// Objects — serialize to JSON manually
storage.set('user', JSON.stringify({ name: 'John' }));
const user = JSON.parse(storage.getString('user') ?? '{}');

// Delete
storage.delete('key');
```

## When to Use What

| Use Case                                         | Solution              |
| ------------------------------------------------ | --------------------- |
| Simple key-value (settings, preferences, flags)  | MMKV (`@/utils/storage`) |
| Sensitive data (tokens, passwords)               | `expo-secure-store`   |
| Large datasets, complex queries, relational data | `expo-sqlite`         |

**Exception — existing identity persistence:** the Convex user ID is stored in AsyncStorage on first account creation. This flow is owned by `useUser()` (`src/hooks/useUser/`) — do not touch or migrate it.

## MMKV with React State

MMKV supports listener-based subscriptions via `addOnValueChangedListener`, which pairs well with `useSyncExternalStore`:

```tsx
import { useSyncExternalStore } from 'react';
import { storage } from '@/utils/storage';

export function useStorage<T>(
  key: string,
  defaultValue: T,
  deserialize: (raw: string) => T = JSON.parse,
  serialize: (value: T) => string = JSON.stringify,
): [T, (value: T) => void] {
  const value = useSyncExternalStore(
    (cb) => {
      const sub = storage.addOnValueChangedListener((changedKey) => {
        if (changedKey === key) cb();
      });
      return () => sub.remove();
    },
    () => {
      const raw = storage.getString(key);
      return raw !== undefined ? deserialize(raw) : defaultValue;
    },
  );

  return [value, (newValue: T) => storage.set(key, serialize(newValue))];
}
```

Usage:

```tsx
function Settings() {
  const [theme, setTheme] = useStorage('theme', 'light');

  return (
    <Switch
      value={theme === 'dark'}
      onValueChange={(dark) => setTheme(dark ? 'dark' : 'light')}
    />
  );
}
```
