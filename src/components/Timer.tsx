import { useEffect, useRef } from 'react';
import { useTimer } from '@/hooks/useTimer';
import { Play, Pause, RotateCcw, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playSound, getTimerSettings } from '@/lib/sounds';

interface TimerProps {
  problemId: string;
  onComplete: (elapsedTime: number) => void;
  className?: string;
}

export const Timer = ({ problemId, onComplete, className }: TimerProps) => {
  const {
    isRunning,
    elapsedSeconds,
    phase,
    start,
    pause,
    reset,
    stop,
    formatTime,
    phaseInfo,
  } = useTimer(problemId);

  // Track previous phase to detect transitions
  const prevPhaseRef = useRef(phase);
  const hasPlayedPhase1Sound = useRef(false);
  const hasPlayedPhase2Sound = useRef(false);

  // Play sounds on phase transitions
  useEffect(() => {
    const settings = getTimerSettings();
    if (!settings.soundsEnabled || !isRunning) return;

    const PHASE1_END = 20 * 60; // 20 minutes
    const PHASE2_END = 60 * 60; // 60 minutes

    // Phase 1 complete (20 min reached)
    if (elapsedSeconds >= PHASE1_END && !hasPlayedPhase1Sound.current) {
      playSound('phase1Complete');
      hasPlayedPhase1Sound.current = true;
    }

    // Phase 2 complete (60 min reached)
    if (elapsedSeconds >= PHASE2_END && !hasPlayedPhase2Sound.current) {
      playSound('phase2Complete');
      hasPlayedPhase2Sound.current = true;
    }

    prevPhaseRef.current = phase;
  }, [elapsedSeconds, phase, isRunning]);

  // Reset sound flags when timer resets
  useEffect(() => {
    if (elapsedSeconds === 0) {
      hasPlayedPhase1Sound.current = false;
      hasPlayedPhase2Sound.current = false;
    }
  }, [elapsedSeconds]);

  // Handle start with sound
  const handleStart = () => {
    const settings = getTimerSettings();
    if (settings.soundsEnabled && elapsedSeconds === 0) {
      playSound('timerStart');
    }
    start();
  };

  const handleComplete = () => {
    const elapsed = stop();
    const settings = getTimerSettings();
    if (settings.soundsEnabled) {
      playSound('problemSolved');
    }
    onComplete(elapsed);
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'phase1': return 'text-primary';
      case 'phase2': return 'text-warning';
      case 'phase3': return 'text-destructive';
    }
  };

  const getProgressColor = () => {
    switch (phase) {
      case 'phase1': return 'bg-primary';
      case 'phase2': return 'bg-warning';
      case 'phase3': return 'bg-destructive';
    }
  };

  const getPhaseProgress = () => {
    const phase1End = 20 * 60;
    const phase2End = 60 * 60;

    if (elapsedSeconds <= phase1End) {
      return (elapsedSeconds / phase1End) * 100;
    } else if (elapsedSeconds <= phase2End) {
      return ((elapsedSeconds - phase1End) / (phase2End - phase1End)) * 100;
    }
    return 100;
  };

  return (
    <div className={cn("glass rounded-3xl p-8 text-center relative overflow-hidden", className)}>
      {/* Background glow effect */}
      <div className={cn(
        "absolute inset-0 opacity-20 blur-3xl transition-colors duration-1000",
        phase === 'phase1' && "bg-primary",
        phase === 'phase2' && "bg-warning",
        phase === 'phase3' && "bg-destructive"
      )} />

      {/* Timer Display */}
      <div className="mb-6 relative">
        <div className={cn(
          "timer-display transition-all duration-500",
          getPhaseColor(),
          isRunning && "neon-text"
        )}>
          {formatTime(elapsedSeconds)}
        </div>
      </div>

      {/* Phase Indicator */}
      <div className="mb-8 relative">
        <div className={cn(
          "phase-pill animate-scale-in",
          phase === 'phase1' && "bg-primary/20 text-primary border border-primary/30",
          phase === 'phase2' && "bg-warning/20 text-warning border border-warning/30",
          phase === 'phase3' && "bg-destructive/20 text-destructive border border-destructive/30"
        )}>
          <span className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            phase === 'phase1' && "bg-primary",
            phase === 'phase2' && "bg-warning",
            phase === 'phase3' && "bg-destructive"
          )} />
          {phaseInfo.label}
        </div>
        <p className="text-muted-foreground text-sm mt-3 font-medium">{phaseInfo.description}</p>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-muted/50 rounded-full overflow-hidden mb-6 relative backdrop-blur-sm">
        <div
          className={cn(
            "h-full transition-all duration-500 rounded-full progress-animate",
            phase === 'phase1' && "bg-gradient-to-r from-primary to-primary/70",
            phase === 'phase2' && "bg-gradient-to-r from-warning to-warning/70",
            phase === 'phase3' && "bg-gradient-to-r from-destructive to-destructive/70"
          )}
          style={{ width: `${getPhaseProgress()}%` }}
        />
      </div>

      {/* Phase Timeline */}
      <div className="flex justify-between text-xs text-muted-foreground mb-8 font-mono font-semibold">
        <span className={cn(
          "transition-colors duration-300",
          elapsedSeconds >= 0 && 'text-primary'
        )}>0m</span>
        <span className={cn(
          "transition-colors duration-300",
          elapsedSeconds >= 20 * 60 && 'text-warning'
        )}>20m</span>
        <span className={cn(
          "transition-colors duration-300",
          elapsedSeconds >= 60 * 60 && 'text-destructive'
        )}>60m</span>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 relative">
        {!isRunning ? (
          <button
            onClick={handleStart}
            onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
            className="flex items-center gap-3 btn-primary text-lg"
          >
            <Play className="w-5 h-5" />
            {elapsedSeconds === 0 ? 'Start' : 'Resume'}
          </button>
        ) : (
          <button
            onClick={pause}
            onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
            className="flex items-center gap-3 btn-secondary text-lg"
          >
            <Pause className="w-5 h-5" />
            Pause
          </button>
        )}

        <button
          onClick={reset}
          className="flex items-center gap-3 btn-secondary text-lg disabled:opacity-40"
          disabled={elapsedSeconds === 0}
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
      </div>

      {/* Complete Button */}
      {elapsedSeconds > 0 && (
        <button
          onClick={handleComplete}
          className="mt-6 w-full py-4 rounded-2xl font-bold text-lg
                     bg-gradient-to-r from-success to-emerald-400 text-success-foreground
                     hover:shadow-lg hover:shadow-success/30 transition-all duration-300
                     active:scale-98 relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            ✓ Mark as Solved
          </span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      )}
    </div>
  );
};

