import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {

  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // FETCH
  useEffect(() => {
    let mounted = true;

    fetch(`/api/storage?key=${encodeURIComponent(key)}`)
      .then(res => res.json())
      .then((data: T | null) => {
        if (mounted && data !== null) {
          setStoredValue(data);
        }
      })
      .catch(err => {
        console.error(`Error fetching key "${key}"`, err);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [key]);

  // SET
  const setValue = async (value: T | ((prev: T) => T)) => {
    const valueToStore =
      value instanceof Function ? value(storedValue) : value;

    // optimistic UI
    setStoredValue(valueToStore);

    await fetch('/api/storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: valueToStore }),
    });
  };

  return [storedValue, setValue, isLoading];
}
