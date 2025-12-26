import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface TimerPhaseInfo {
  label: string;
  description: string;
}

export const useTimer = (problemId: string) => {
  // Persist the start time and accumulated paused time
  const [timerState, setTimerState] = useLocalStorage<{
    isRunning: boolean;
    startTime: number | null; // Timestamp when timer started/resumed
    accumulatedTime: number;  // Time stored before last pause
  }>(`timer_state_${problemId}`, {
    isRunning: false,
    startTime: null,
    accumulatedTime: 0,
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  // Calculate distinct elapsed time whenever state changes or on mount
  useEffect(() => {
    const calculateElapsed = () => {
      if (timerState.isRunning && timerState.startTime) {
        const now = Date.now();
        const currentSessionDuration = Math.floor((now - timerState.startTime) / 1000);
        return timerState.accumulatedTime + currentSessionDuration;
      }
      return timerState.accumulatedTime;
    };

    setElapsedSeconds(calculateElapsed());

    if (timerState.isRunning) {
      intervalRef.current = window.setInterval(() => {
        setElapsedSeconds(calculateElapsed());
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState.isRunning, timerState.startTime, timerState.accumulatedTime]);

  const start = () => {
    if (!timerState.isRunning) {
      setTimerState(prev => ({
        ...prev,
        isRunning: true,
        startTime: Date.now(),
      }));
    }
  };

  const pause = () => {
    if (timerState.isRunning && timerState.startTime) {
      const now = Date.now();
      const sessionSeconds = Math.floor((now - timerState.startTime) / 1000);
      
      setTimerState(prev => ({
        ...prev,
        isRunning: false,
        startTime: null,
        accumulatedTime: prev.accumulatedTime + sessionSeconds,
      }));
    }
  };

  const reset = () => {
    setTimerState({
      isRunning: false,
      startTime: null,
      accumulatedTime: 0,
    });
    setElapsedSeconds(0);
  };

  const stop = () => {
    pause(); // Ensure final time is captured
    return elapsedSeconds;
  };

  // Helper logic for phases (Pure UI logic)
  const getPhaseInfo = (seconds: number): { phase: 'phase1' | 'phase2' | 'phase3', info: TimerPhaseInfo } => {
    if (seconds < 20 * 60) {
      return { 
        phase: 'phase1', 
        info: { label: 'NO KEYBOARD', description: 'Read & Think. Do not touch the keyboard.' } 
      };
    } else if (seconds < 60 * 60) {
      return { 
        phase: 'phase2', 
        info: { label: 'CODE MODE', description: 'Write your solution.' } 
      };
    } else {
      return { 
        phase: 'phase3', 
        info: { label: 'EDITORIAL', description: 'You may consult the editorial now.' } 
      };
    }
  };

  const { phase, info } = getPhaseInfo(elapsedSeconds);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return {
    isRunning: timerState.isRunning,
    elapsedSeconds,
    phase,
    phaseInfo: info,
    start,
    pause,
    reset,
    stop,
    formatTime,
  };
};