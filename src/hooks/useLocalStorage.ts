import { useState, useEffect } from 'react';
import { BlackBookEntry, ProblemState } from '@/types';

// Enhanced localStorage hook with better persistence
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state with localStorage value or initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        // Parse and validate the stored data
        const parsed = JSON.parse(item);
        return parsed;
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage whenever storedValue changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Sync across tabs
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          setStoredValue(newValue);
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
    } catch (error) {
      console.error(`Error updating state for key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

// Type for our main data store
interface TrackerData {
  startDate: string;
  problemStates: Record<string, ProblemState>;
  entries: BlackBookEntry[];
  version: number; // For future migrations
}

const CURRENT_VERSION = 1;

export function useProgress() {
  const [progress, setProgress] = useLocalStorage<TrackerData>('dsa-tracker-progress', {
    startDate: new Date().toISOString(),
    problemStates: {},
    entries: [],
    version: CURRENT_VERSION,
  });

  // Migrate old data if needed
  useEffect(() => {
    if (progress.version !== CURRENT_VERSION) {
      // Add migration logic here if needed in future
      setProgress({
        ...progress,
        version: CURRENT_VERSION,
      });
    }
  }, []);

  const updateProblemState = (problemId: string, state: Partial<ProblemState>) => {
    setProgress(prev => {
      const currentState = prev.problemStates[problemId] || {
        problemId,
        status: 'not-started' as const,
        elapsedTime: 0,
        timerPhase: 'phase1' as const,
      };

      return {
        ...prev,
        problemStates: {
          ...prev.problemStates,
          [problemId]: {
            ...currentState,
            ...state,
          } as ProblemState,
        },
      };
    });
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

  const resetProgress = () => {
    setProgress({
      startDate: new Date().toISOString(),
      problemStates: {},
      entries: [],
      version: CURRENT_VERSION,
    });
  };

  return {
    progress,
    updateProblemState,
    addEntry,
    getDayProgress,
    resetProgress,
    startDate: new Date(progress.startDate),
  };
}