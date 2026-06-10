import { useEffect, useState } from 'react';

const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  deserialize?: (parsed: unknown) => T
) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return initialValue;
      const parsed: unknown = JSON.parse(item);
      return deserialize ? deserialize(parsed) : (parsed as T);
    } catch (err: unknown) {
      console.warn(`Error loading state from localStorage for key ${key}:`, err);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err: unknown) {
      console.warn(`Error saving state to localStorage for key ${key}:`, err);
    }
  }, [key, value]);

  return [value, setValue] as const;
};

export default useLocalStorage;
