import { useState, useEffect } from 'react';
import { Settings, RotateCcw, Download, Upload, Info, Volume2, VolumeX, Sliders } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTimerSettings, saveTimerSettings, playSound, TimerSettings } from '@/lib/sounds';

interface SettingsViewProps {
  startDate: Date;
  onResetProgress: () => void;
  onExportData: () => void;
}

export const SettingsView = ({ startDate, onResetProgress, onExportData }: SettingsViewProps) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [settings, setSettings] = useState<TimerSettings>(() => getTimerSettings());

  // Save settings whenever they change
  useEffect(() => {
    saveTimerSettings(settings);
  }, [settings]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleTestSound = () => {
    playSound('phase1Complete');
  };

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Journey info */}
      <div className="glass rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Your Journey</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Started on {formatDate(startDate)}
        </p>
        <p className="text-sm text-muted-foreground">
          120-day CP Domination Plan
        </p>
      </div>

      {/* Timer Sounds */}
      <div className="glass rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Volume2 className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Timer Sounds</h2>
        </div>

        <div className="space-y-3">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {settings.soundsEnabled ? (
                <Volume2 className="w-5 h-5 text-success" />
              ) : (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-sm">Phase Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Sound alerts at 20min, 60min, and solve
                </p>
              </div>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, soundsEnabled: !prev.soundsEnabled }))}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                settings.soundsEnabled ? "bg-success" : "bg-muted"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                settings.soundsEnabled ? "translate-x-7" : "translate-x-1"
              )} />
            </button>
          </div>

          {/* Test Sound Button */}
          {settings.soundsEnabled && (
            <button
              onClick={handleTestSound}
              className="w-full flex items-center justify-center gap-2 p-2 text-sm rounded-lg 
                         bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              Test Sound
            </button>
          )}
        </div>
      </div>

      {/* Rating threshold settings */}
      <div className="glass rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Problem Selection</h2>
        </div>

        <div className="space-y-4">
          {/* Base Threshold */}
          <div>
            <label className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Base Rating Threshold</span>
              <span className="font-mono font-medium">{settings.baseThreshold}</span>
            </label>
            <input
              type="range"
              min="1000"
              max="2500"
              step="100"
              value={settings.baseThreshold}
              onChange={(e) => setSettings(prev => ({ ...prev, baseThreshold: parseInt(e.target.value) }))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                         [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
                         [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1000</span>
              <span>2500</span>
            </div>
          </div>

          {/* Monthly Increase */}
          <div>
            <label className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Monthly Increase</span>
              <span className="font-mono font-medium">+{settings.monthlyIncrease}</span>
            </label>
            <input
              type="range"
              min="0"
              max="200"
              step="25"
              value={settings.monthlyIncrease}
              onChange={(e) => setSettings(prev => ({ ...prev, monthlyIncrease: parseInt(e.target.value) }))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                         [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
                         [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>+0</span>
              <span>+200</span>
            </div>
          </div>

          {/* Info */}
          <div className="border-t border-border pt-3 mt-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Below threshold:</span> 2 problems (weekday), 4 problems (weekend)
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium">Above threshold:</span> 1 problem (weekday), 2 problems (weekend)
            </p>
          </div>
        </div>
      </div>

      {/* Data management */}
      <div className="glass rounded-xl p-4 mb-4">
        <h2 className="font-semibold mb-4">Data Management</h2>

        <div className="space-y-3">
          <button
            onClick={onExportData}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
          >
            <Download className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">Export Data</p>
              <p className="text-xs text-muted-foreground">Download all entries as JSON</p>
            </div>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-destructive/10 transition-colors text-left"
          >
            <RotateCcw className="w-5 h-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Reset Progress</p>
              <p className="text-xs text-muted-foreground">Clear all data and start fresh</p>
            </div>
          </button>
        </div>
      </div>

      {/* About */}
      <div className="glass rounded-xl p-4">
        <h2 className="font-semibold mb-2">About</h2>
        <p className="text-sm text-muted-foreground">
          DSA Tracker v1.1
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Built with ❤️ for competitive programmers
        </p>
      </div>

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl p-6 max-w-sm w-full animate-slide-up">
            <h3 className="text-lg font-semibold mb-2">Reset All Progress?</h3>
            <p className="text-muted-foreground text-sm mb-6">
              This will delete all your entries and progress. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetProgress();
                  setShowResetConfirm(false);
                }}
                className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 
                           transition-colors font-medium rounded-lg px-4 py-2"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

