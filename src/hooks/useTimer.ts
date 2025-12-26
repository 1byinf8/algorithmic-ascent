import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerPhase, TimerState } from '@/types';

const PHASE_1_DURATION = 20 * 60; // 20 minutes in seconds
const PHASE_2_DURATION = 40 * 60; // 40 minutes (cumulative: 60 min)
const PHASE_3_START = 60 * 60;    // 60 minutes

export const getPhaseInfo = (phase: TimerPhase) => {
  switch (phase) {
    case 'phase1':
      return {
        label: 'No Keyboard',
        description: 'Think through the problem on paper',
        color: 'timer-phase1',
        maxTime: PHASE_1_DURATION,
      };
    case 'phase2':
      return {
        label: 'Keyboard Allowed',
        description: 'Start coding your solution',
        color: 'timer-phase2',
        maxTime: PHASE_2_DURATION,
      };
    case 'phase3':
      return {
        label: 'Editorial OK',
        description: 'You can check the editorial now',
        color: 'timer-phase3',
        maxTime: null,
      };
  }
};

export const useTimer = (problemId: string) => {
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    startTime: null,
    elapsedSeconds: 0,
    phase: 'phase1',
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getPhase = useCallback((seconds: number): TimerPhase => {
    if (seconds < PHASE_1_DURATION) return 'phase1';
    if (seconds < PHASE_3_START) return 'phase2';
    return 'phase3';
  }, []);

  const start = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: true,
      startTime: new Date(),
    }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isRunning: false,
      startTime: null,
      elapsedSeconds: 0,
      phase: 'phase1',
    });
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return state.elapsedSeconds;
  }, [state.elapsedSeconds]);

  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          const newElapsed = prev.elapsedSeconds + 1;
          return {
            ...prev,
            elapsedSeconds: newElapsed,
            phase: getPhase(newElapsed),
          };
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, getPhase]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    ...state,
    start,
    pause,
    reset,
    stop,
    formatTime,
    phaseInfo: getPhaseInfo(state.phase),
  };
};
