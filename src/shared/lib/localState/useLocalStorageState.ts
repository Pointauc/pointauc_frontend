import { useCallback, useEffect, useState } from 'react';

const getStorageValue = <T>(key: string) => {
  const item = localStorage.getItem(key);
  if (item) {
    return JSON.parse(item);
  }
  return null;
};

/**
 * Hook to manage state in localStorage
 * @param key - The key to store the state in localStorage
 * @returns A tuple containing the current value and a function to update the value (similar to useState)
 */
export const useLocalStorageState = <T>(key: string, defaultValue: T): [T, (value: T) => void] => {
  const [value, setValue] = useState<T>(() => getStorageValue<T>(key) || defaultValue);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  const setValueWithStorage = useCallback(
    (value: T) => {
      setValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    },
    [key],
  );

  return [value, setValueWithStorage];
};
