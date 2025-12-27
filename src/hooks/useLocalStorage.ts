import { useState, useEffect, useCallback, useRef } from 'react';
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
  initialValue: T,
  persistToBackend: boolean = true
): [T, (value: T | ((prev: T) => T)) => Promise<void>, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState<boolean>(persistToBackend);
  
  // Use ref to track latest value to avoid stale closures
  const latestValueRef = useRef<T>(storedValue);
  
  // Keep ref in sync with state
  useEffect(() => {
    latestValueRef.current = storedValue;
  }, [storedValue]);

  // FETCH (only if persisting to backend)
  useEffect(() => {
    if (!persistToBackend) {
      setIsLoading(false);
      return;
    }
    
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
          const newValue = data.value !== null ? data.value : initialValue;
          setStoredValue(newValue);
          latestValueRef.current = newValue;
        }
      } catch (err) {
        console.error(`Error fetching key "${key}"`, err);
        if (mounted) {
          setStoredValue(initialValue);
          latestValueRef.current = initialValue;
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
  }, [key, initialValue, persistToBackend]);

  // SET - Fixed to use ref for latest value to avoid stale closures
  const setValue = useCallback(
    async (value: T | ((prev: T) => T)) => {
      // Use ref to get the absolute latest value
      const currentValue = latestValueRef.current;
      const valueToStore =
        value instanceof Function ? value(currentValue) : value;

      // Update ref immediately (synchronously)
      latestValueRef.current = valueToStore;
      
      // Update local state immediately for better UX
      setStoredValue(valueToStore);

      // If not persisting, we're done
      if (!persistToBackend) {
        return;
      }

      try {
        // Then persist to backend
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
        // Revert on error
        try {
          const response = await fetch(
            `/api/storage?key=${encodeURIComponent(key)}`
          );
          const data: StorageResponse<T> = await response.json();
          if (data.value !== null) {
            setStoredValue(data.value);
            latestValueRef.current = data.value;
          }
        } catch (revertErr) {
          console.error('Failed to revert value', revertErr);
        }
        throw err;
      }
    },
    [key, persistToBackend]
  );

  return [storedValue, setValue, isLoading];
}

// Fixed useProgress hook with better async handling
export const useProgress = () => {
  interface ExtendedUserProgress extends UserProgress {
    entries: BlackBookEntry[];
  }

  const [progress, setProgress, isLoading] = useLocalStorage<ExtendedUserProgress>('dsa-tracker-progress', {
    startDate: new Date(),
    currentDay: 1,
    problemStates: {},
    weeklyReports: [],
    entries: []
  });

  const startDate = new Date(progress.startDate);

  // Fixed to await the async operation
  const updateProblemState = async (problemId: string, updates: Partial<ProblemState>) => {
    await setProgress(prev => ({
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

  // Fixed to await the async operation
  const addEntry = async (entry: BlackBookEntry) => {
    await setProgress(prev => ({
      ...prev,
      entries: [...(prev.entries || []), entry]
    }));
  };

  // NEW: Combined function to add entry AND update problem state atomically
  // This prevents race conditions from separate async calls
  const completeWithEntry = async (entry: BlackBookEntry) => {
    await setProgress(prev => ({
      ...prev,
      entries: [...(prev.entries || []), entry],
      problemStates: {
        ...prev.problemStates,
        [entry.problemId]: {
          ...(prev.problemStates[entry.problemId] || {
            problemId: entry.problemId,
            status: 'not-started',
            timerPhase: 'phase1',
            elapsedTime: 0
          }),
          status: 'completed',
          elapsedTime: entry.timeSpent
        }
      }
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

  const resetProgress = async () => {
    await setProgress({
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
    completeWithEntry,
    getDayProgress,
    startDate,
    resetProgress,
    isLoading
  };
};