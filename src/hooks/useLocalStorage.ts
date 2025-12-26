import { useState, useEffect } from 'react';
import { BlackBookEntry, ProblemState } from '@/types';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // 1. Initialize state function to avoid reading localStorage on every render
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 2. Wrap setValue to write to localStorage
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

// Type for our main data store
interface TrackerData {
  startDate: string;
  problemStates: Record<string, ProblemState>;
  entries: BlackBookEntry[];
}

export function useProgress() {
  const [progress, setProgress] = useLocalStorage<TrackerData>('dsa-tracker-progress', {
    startDate: new Date().toISOString(),
    problemStates: {},
    entries: [],
  });

  const updateProblemState = (problemId: string, state: Partial<ProblemState>) => {
    setProgress(prev => ({
      ...prev,
      problemStates: {
        ...prev.problemStates,
        [problemId]: {
          ...(prev.problemStates[problemId] || { status: 'not-started', elapsedTime: 0, timerPhase: 'phase1' }),
          ...state,
          problemId // Ensure ID is preserved
        } as ProblemState,
      },
    }));
  };

  const addEntry = (entry: BlackBookEntry) => {
    setProgress(prev => ({
      ...prev,
      entries: [...prev.entries, entry],
    }));
  };

  const getDayProgress = (day: number, problems: { id: string }[]) => {
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