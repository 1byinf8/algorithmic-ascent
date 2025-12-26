import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export function useProgress() {
  const [progress, setProgress] = useLocalStorage<{
    startDate: string;
    problemStates: Record<string, any>;
    entries: any[];
  }>('dsa-tracker-progress', {
    startDate: new Date().toISOString(),
    problemStates: {},
    entries: [],
  });

  const updateProblemState = (problemId: string, state: any) => {
    setProgress(prev => ({
      ...prev,
      problemStates: {
        ...prev.problemStates,
        [problemId]: state,
      },
    }));
  };

  const addEntry = (entry: any) => {
    setProgress(prev => ({
      ...prev,
      entries: [...prev.entries, entry],
    }));
  };

  const getDayProgress = (day: number, problems: any[]) => {
    const completed = problems.filter(p => 
      progress.problemStates[p.id]?.status === 'completed'
    ).length;
    return {
      completed,
      total: problems.length,
      percentage: problems.length > 0 ? (completed / problems.length) * 100 : 0,
    };
  };

  return {
    progress,
    updateProblemState,
    addEntry,
    getDayProgress,
    startDate: new Date(progress.startDate),
  };
}
