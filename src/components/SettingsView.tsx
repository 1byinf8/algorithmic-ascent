import { useState } from 'react';
import { Settings, RotateCcw, Download, Upload, Moon, Sun, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsViewProps {
  startDate: Date;
  onResetProgress: () => void;
  onExportData: () => void;
}

export const SettingsView = ({ startDate, onResetProgress, onExportData }: SettingsViewProps) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
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

      {/* Rating threshold info */}
      <div className="glass rounded-xl p-4 mb-4">
        <h2 className="font-semibold mb-3">Problem Selection</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base threshold</span>
            <span className="font-mono">1500</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Increase per month</span>
            <span className="font-mono">+100</span>
          </div>
          <div className="border-t border-border pt-2 mt-2">
            <p className="text-xs text-muted-foreground">
              Below threshold: 2 problems (weekday), 4 problems (weekend)
            </p>
            <p className="text-xs text-muted-foreground">
              Above threshold: 1 problem (weekday), 2 problems (weekend)
            </p>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="glass rounded-xl p-4">
        <h2 className="font-semibold mb-2">About</h2>
        <p className="text-sm text-muted-foreground">
          DSA Tracker v1.0
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
