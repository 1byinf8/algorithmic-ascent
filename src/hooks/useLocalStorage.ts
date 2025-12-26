import { useState, useEffect } from 'react';
import { BlackBookEntry, ProblemState } from '@/types';
import { sql } from '@/lib/neon';

// Modified hook to use Neon DB instead of localStorage
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  // Start with initialValue while we fetch from DB
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from Neon DB on mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const result = await sql`SELECT value FROM app_storage WHERE key = ${key}`;
        if (result && result.length > 0 && isMounted) {
          // Neon returns the JSONB column directly as an object
          setStoredValue(result[0].value as T);
        }
      } catch (error) {
        console.error(`Error fetching key "${key}" from Neon DB:`, error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [key]);

  const setValue = async (value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // 1. Optimistic Update (Update UI immediately)
      setStoredValue(valueToStore);

      // 2. Persist to Neon DB
      // We use UPSERT (Insert or Update) logic
      await sql`
        INSERT INTO app_storage (key, value) 
        VALUES (${key}, ${valueToStore}) 
        ON CONFLICT (key) 
        DO UPDATE SET value = ${valueToStore}, updated_at = NOW()
      `;
      
    } catch (error) {
      console.error(`Error setting key "${key}" in Neon DB:`, error);
      // Optionally revert state here if DB fails
    }
  };

  return [storedValue, setValue, isLoading];
}

// Type for our main data store
interface TrackerData {
  startDate: string;
  problemStates: Record<string, ProblemState>;
  entries: BlackBookEntry[];
  version: number;
}

const CURRENT_VERSION = 1;

export function useProgress() {
  // We utilize the loading state now to prevent flashing incorrect data
  const [progress, setProgress, isLoading] = useLocalStorage<TrackerData>('dsa-tracker-progress', {
    startDate: new Date().toISOString(),
    problemStates: {},
    entries: [],
    version: CURRENT_VERSION,
  });

  // Migrate old data if needed (logic remains same)
  useEffect(() => {
    if (!isLoading && progress.version !== CURRENT_VERSION) {
      setProgress({
        ...progress,
        version: CURRENT_VERSION,
      });
    }
  }, [isLoading, progress.version]);

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
    isLoading, // Export loading state if you want to show a spinner
  };
}