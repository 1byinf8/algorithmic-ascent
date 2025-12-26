import { useState, useEffect, useCallback } from 'react';
import { UserProgress, ProblemState, BlackBookEntry } from '../types';
import { Problem } from '../data/problemData';

interface StorageResponse<T> {
  value: T | null;
  success: boolean;
  error?: string;
}

// Existing useLocalStorage hook
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => Promise<void>, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // FETCH
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/storage?key=${encodeURIComponent(key)}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: StorageResponse<T> = await response.json();

        if (mounted) {
          setStoredValue(data.value !== null ? data.value : initialValue);
        }
      } catch (err) {
        console.error(`Error fetching key "${key}"`, err);
        if (mounted) {
          setStoredValue(initialValue);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [key, initialValue]);

  // SET
  const setValue = useCallback(
    async (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        const response = await fetch('/api/storage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key,
            value: valueToStore,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save: ${response.statusText}`);
        }

        const result: StorageResponse<T> = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (err) {
        console.error(`Error setting key "${key}"`, err);
        // Attempt to revert on error
        try {
          const response = await fetch(
            `/api/storage?key=${encodeURIComponent(key)}`
          );
          const data: StorageResponse<T> = await response.json();
          if (data.value !== null) {
            setStoredValue(data.value);
          }
        } catch (revertErr) {
          console.error('Failed to revert value', revertErr);
        }
        throw err;
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue, isLoading];
}

// Missing useProgress hook implementation
export const useProgress = () => {
  // Extended interface to include entries which is used in Index.tsx
  // but might be missing from the base UserProgress type
  interface ExtendedUserProgress extends UserProgress {
    entries: BlackBookEntry[];
  }

  const [progress, setProgress] = useLocalStorage<ExtendedUserProgress>('dsa-tracker-progress', {
    startDate: new Date(),
    currentDay: 1,
    problemStates: {},
    weeklyReports: [],
    entries: []
  });

  const startDate = new Date(progress.startDate);

  const updateProblemState = (problemId: string, updates: Partial<ProblemState>) => {
    setProgress(prev => ({
      ...prev,
      problemStates: {
        ...prev.problemStates,
        [problemId]: {
          ...(prev.problemStates[problemId] || {
            problemId,
            status: 'not-started',
            timerPhase: 'phase1',
            elapsedTime: 0
          }),
          ...updates
        }
      }
    }));
  };

  const addEntry = (entry: BlackBookEntry) => {
    setProgress(prev => ({
      ...prev,
      entries: [...(prev.entries || []), entry]
    }));
  };

  const getDayProgress = (day: number, problems: Problem[]) => {
    const completed = problems.filter(p => 
      progress.problemStates[p.id]?.status === 'completed'
    ).length;
    
    return {
      completed,
      total: problems.length,
      percentage: problems.length > 0 ? (completed / problems.length) * 100 : 0
    };
  };

  const resetProgress = () => {
    setProgress({
      startDate: new Date(),
      currentDay: 1,
      problemStates: {},
      weeklyReports: [],
      entries: []
    });
  };

  return {
    progress,
    updateProblemState,
    addEntry,
    getDayProgress,
    startDate,
    resetProgress
  };
};