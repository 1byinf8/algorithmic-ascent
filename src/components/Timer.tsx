import { useTimer } from '@/hooks/useTimer';
import { Play, Pause, RotateCcw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const handleComplete = () => {
    const elapsed = stop();
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
    <div className={cn("glass rounded-2xl p-6 text-center", className)}>
      {/* Timer Display */}
      <div className="mb-4">
        <div className={cn(
          "font-mono text-5xl font-bold tracking-wider transition-colors duration-500",
          getPhaseColor()
        )}>
          {formatTime(elapsedSeconds)}
        </div>
      </div>

      {/* Phase Indicator */}
      <div className="mb-6">
        <div className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
          phase === 'phase1' && "bg-primary/10 text-primary",
          phase === 'phase2' && "bg-warning/10 text-warning",
          phase === 'phase3' && "bg-destructive/10 text-destructive"
        )}>
          <AlertCircle className="w-4 h-4" />
          {phaseInfo.label}
        </div>
        <p className="text-muted-foreground text-sm mt-2">{phaseInfo.description}</p>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-6">
        <div 
          className={cn("h-full transition-all duration-500", getProgressColor())}
          style={{ width: `${getPhaseProgress()}%` }}
        />
      </div>

      {/* Phase Timeline */}
      <div className="flex justify-between text-xs text-muted-foreground mb-6">
        <span className={elapsedSeconds >= 0 ? 'text-primary' : ''}>0m</span>
        <span className={elapsedSeconds >= 20*60 ? 'text-warning' : ''}>20m</span>
        <span className={elapsedSeconds >= 60*60 ? 'text-destructive' : ''}>60m</span>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {!isRunning ? (
          <button
            onClick={start}
            className="flex items-center gap-2 btn-primary"
          >
            <Play className="w-4 h-4" />
            {elapsedSeconds === 0 ? 'Start' : 'Resume'}
          </button>
        ) : (
          <button
            onClick={pause}
            className="flex items-center gap-2 btn-secondary"
          >
            <Pause className="w-4 h-4" />
            Pause
          </button>
        )}
        
        <button
          onClick={reset}
          className="flex items-center gap-2 btn-secondary"
          disabled={elapsedSeconds === 0}
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Complete Button */}
      {elapsedSeconds > 0 && (
        <button
          onClick={handleComplete}
          className="mt-4 w-full py-3 bg-success text-success-foreground rounded-lg font-medium 
                     hover:bg-success/90 transition-colors"
        >
          Mark as Solved
        </button>
      )}
    </div>
  );
};
