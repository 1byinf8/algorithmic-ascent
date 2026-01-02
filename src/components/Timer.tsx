import { useEffect, useRef, useState } from 'react';
import { useTimer } from '@/hooks/useTimer';
import { Play, Pause, RotateCcw, AlertCircle, Volume2, VolumeX, Lightbulb, Lock, Unlock, Loader2, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playSound, getTimerSettings } from '@/lib/sounds';
import { isDevModeAvailable, isDevModeEnabled, setDevModeEnabled } from '@/lib/devMode';
import {
  HintData,
  generateHints,
  getCachedHints,
  getUnlockedHints,
  HINT_FETCH_TIME,
  HINT1_UNLOCK_TIME,
  HINT2_UNLOCK_TIME,
  HINT3_UNLOCK_TIME
} from '@/lib/hints';

interface TimerProps {
  problemId: string;
  problemTitle: string;
  problemUrl: string;
  onComplete: (elapsedTime: number) => void;
  className?: string;
}

export const Timer = ({ problemId, problemTitle, problemUrl, onComplete, className }: TimerProps) => {
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
    setElapsedManually,
  } = useTimer(problemId);

  // Dev mode state
  const [devMode, setDevMode] = useState(() => isDevModeEnabled());
  const [sliderValue, setSliderValue] = useState(elapsedSeconds);
  const showDevMode = isDevModeAvailable();

  // Sync slider with elapsed when not dragging
  useEffect(() => {
    if (!devMode) {
      setSliderValue(elapsedSeconds);
    }
  }, [elapsedSeconds, devMode]);

  // Handle dev mode toggle
  const handleDevModeToggle = () => {
    const newState = !devMode;
    setDevMode(newState);
    setDevModeEnabled(newState);
  };

  // Handle slider change (dev mode)
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setSliderValue(value);
  };

  // Apply slider value to timer
  const applySliderValue = () => {
    setElapsedManually(sliderValue);
  };

  // Track previous phase to detect transitions
  const prevPhaseRef = useRef(phase);
  const hasPlayedPhase1Sound = useRef(false);
  const hasPlayedPhase2Sound = useRef(false);

  // Hints state
  const [hints, setHints] = useState<HintData | null>(() => getCachedHints(problemId));
  const [hintsLoading, setHintsLoading] = useState(false);
  const [hintsError, setHintsError] = useState<string | null>(null);
  const hasFetchedHints = useRef(hints !== null);
  const [expandedHint, setExpandedHint] = useState<number | null>(null);

  // Fetch hints at 15 min mark
  useEffect(() => {
    if (!isRunning) return;
    if (hasFetchedHints.current) return;
    if (elapsedSeconds < HINT_FETCH_TIME) return;

    // Time to fetch hints
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      setHintsError('API key not configured');
      hasFetchedHints.current = true;
      return;
    }

    setHintsLoading(true);
    setHintsError(null);
    hasFetchedHints.current = true;

    generateHints(problemId, problemTitle, problemUrl, apiKey)
      .then(generatedHints => {
        setHints(generatedHints);
        setHintsLoading(false);
      })
      .catch(err => {
        console.error('Failed to generate hints:', err);
        setHintsError(err.message || 'Failed to load hints');
        setHintsLoading(false);
      });
  }, [elapsedSeconds, isRunning, problemId, problemTitle, problemUrl]);

  // Get unlock status based on current time
  const unlockedHints = getUnlockedHints(elapsedSeconds, hints);

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
      {/* Background glow effect - pointer-events-none so it doesn't block clicks */}
      <div className={cn(
        "absolute inset-0 opacity-20 blur-3xl transition-colors duration-1000 pointer-events-none",
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

      {/* Dev Mode Panel - Only on localhost */}
      {showDevMode && (
        <div className="mt-6 border-t border-border pt-4">
          <button
            type="button"
            onClick={handleDevModeToggle}
            className={cn(
              "flex items-center gap-2 text-xs px-3 py-1.5 rounded-full transition-all cursor-pointer",
              devMode
                ? "bg-orange-500/20 text-orange-500 border border-orange-500/30"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <Wrench className="w-3 h-3" />
            Dev Mode {devMode ? 'ON' : 'OFF'}
          </button>

          {devMode && (
            <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-orange-500">Timer Control</span>
                <span className="font-mono text-xs">{formatTime(sliderValue)}</span>
              </div>

              <input
                type="range"
                min={0}
                max={70 * 60} // 70 minutes max
                value={sliderValue}
                onChange={handleSliderChange}
                className="w-full h-2 bg-orange-500/20 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0m</span>
                <span className={cn(sliderValue >= 15 * 60 && "text-primary")}>15m (hints)</span>
                <span className={cn(sliderValue >= 20 * 60 && "text-warning")}>20m (H1)</span>
                <span className={cn(sliderValue >= 40 * 60 && "text-orange-500")}>40m (H2)</span>
                <span className={cn(sliderValue >= 60 * 60 && "text-destructive")}>60m (H3)</span>
              </div>

              <button
                onClick={applySliderValue}
                className="w-full py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Apply Time: {formatTime(sliderValue)}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                ⚠️ Dev mode only visible on localhost
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hints Section */}
      {elapsedSeconds >= HINT_FETCH_TIME && (
        <div className="mt-6 border-t border-border pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-warning" />
            <h3 className="font-semibold text-sm">Progressive Hints</h3>
            {hintsLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>

          {hintsError && (
            <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-lg mb-3">
              {hintsError}
            </div>
          )}

          <div className="space-y-2">
            {/* Hint 1 - 20 min */}
            <div className={cn(
              "p-3 rounded-lg border transition-all",
              unlockedHints.hint1Unlocked
                ? "border-warning/50 bg-warning/5"
                : "border-border bg-muted/30 opacity-60"
            )}>
              <button
                onClick={() => unlockedHints.hint1Unlocked && setExpandedHint(expandedHint === 1 ? null : 1)}
                disabled={!unlockedHints.hint1Unlocked}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  {unlockedHints.hint1Unlocked ? (
                    <Unlock className="w-4 h-4 text-warning" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">
                    Hint 1 {!unlockedHints.hint1Unlocked && `(unlocks at 20min)`}
                  </span>
                </div>
                {unlockedHints.hint1Unlocked && (
                  <span className="text-xs text-muted-foreground">{expandedHint === 1 ? '▲' : '▼'}</span>
                )}
              </button>
              {expandedHint === 1 && hints && (
                <p className="mt-2 text-sm text-foreground leading-relaxed">{hints.hint1}</p>
              )}
            </div>

            {/* Hint 2 - 40 min */}
            <div className={cn(
              "p-3 rounded-lg border transition-all",
              unlockedHints.hint2Unlocked
                ? "border-orange-500/50 bg-orange-500/5"
                : "border-border bg-muted/30 opacity-60"
            )}>
              <button
                onClick={() => unlockedHints.hint2Unlocked && setExpandedHint(expandedHint === 2 ? null : 2)}
                disabled={!unlockedHints.hint2Unlocked}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  {unlockedHints.hint2Unlocked ? (
                    <Unlock className="w-4 h-4 text-orange-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">
                    Hint 2 {!unlockedHints.hint2Unlocked && `(unlocks at 40min)`}
                  </span>
                </div>
                {unlockedHints.hint2Unlocked && (
                  <span className="text-xs text-muted-foreground">{expandedHint === 2 ? '▲' : '▼'}</span>
                )}
              </button>
              {expandedHint === 2 && hints && (
                <p className="mt-2 text-sm text-foreground leading-relaxed">{hints.hint2}</p>
              )}
            </div>

            {/* Hint 3 - 60 min */}
            <div className={cn(
              "p-3 rounded-lg border transition-all",
              unlockedHints.hint3Unlocked
                ? "border-destructive/50 bg-destructive/5"
                : "border-border bg-muted/30 opacity-60"
            )}>
              <button
                onClick={() => unlockedHints.hint3Unlocked && setExpandedHint(expandedHint === 3 ? null : 3)}
                disabled={!unlockedHints.hint3Unlocked}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  {unlockedHints.hint3Unlocked ? (
                    <Unlock className="w-4 h-4 text-destructive" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">
                    Hint 3 {!unlockedHints.hint3Unlocked && `(unlocks at 60min)`}
                  </span>
                </div>
                {unlockedHints.hint3Unlocked && (
                  <span className="text-xs text-muted-foreground">{expandedHint === 3 ? '▲' : '▼'}</span>
                )}
              </button>
              {expandedHint === 3 && hints && (
                <p className="mt-2 text-sm text-foreground leading-relaxed">{hints.hint3}</p>
              )}
            </div>
          </div>
        </div>
      )}

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

