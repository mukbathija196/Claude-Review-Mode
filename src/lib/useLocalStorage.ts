import { useState } from 'react';

/**
 * useState backed by localStorage. Serialises Set<string> to/from JSON array.
 * Falls back gracefully if localStorage is unavailable.
 */
export function useLocalStorageSet(
  key: string,
  initial: Set<string>
): [Set<string>, (v: Set<string>) => void] {
  const [value, setValue] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) return new Set(JSON.parse(stored) as string[]);
    } catch {
      // ignore parse errors
    }
    return initial;
  });

  const setAndPersist = (next: Set<string>) => {
    setValue(next);
    try {
      localStorage.setItem(key, JSON.stringify([...next]));
    } catch {
      // ignore quota errors
    }
  };

  return [value, setAndPersist];
}
