import { useState } from 'react';

export function useLocalStorage<TValue>(key: string, defaultValue: TValue) {
  const [storedValue, setStoredValue] = useState<TValue>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as TValue) : defaultValue;
    } catch (err) {
      console.error(err);
      return defaultValue;
    }
  });

  const setValue = (value: TValue) => {
    setStoredValue(value);
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(err);
    }
  };

  return [storedValue, setValue] as [TValue, (value: TValue) => void];
}
