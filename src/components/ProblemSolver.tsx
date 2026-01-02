import { useState } from 'react';
import { Problem } from '@/data/problemData';
import { Timer } from './Timer';
import { BlackBookForm } from './BlackBookForm';
import { BlackBookEntry } from '@/types';
import { ArrowLeft, ExternalLink, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProblemSolverProps {
  problem: Problem;
  hideRatings?: boolean;
  onComplete: (entry: BlackBookEntry) => void;
  onBack: () => void;
}

type SolverState = 'ready' | 'timing' | 'form';

export const ProblemSolver = ({ problem, hideRatings, onComplete, onBack }: ProblemSolverProps) => {
  const [state, setState] = useState<SolverState>('ready');
  const [timeSpent, setTimeSpent] = useState(0);

  const handleTimerComplete = (elapsed: number) => {
    setTimeSpent(elapsed);
    setState('form');
  };

  const handleFormSubmit = (entry: BlackBookEntry) => {
    onComplete(entry);
  };

  const handleFormCancel = () => {
    setState('timing');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-lg">{problem.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{problem.platform}</span>
            {problem.rating && !hideRatings && (
              <>
                <span>•</span>
                <span>Rating: {problem.rating}</span>
              </>
            )}
          </div>
        </div>
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>

      {/* Ready State */}
      {state === 'ready' && (
        <div className="glass rounded-2xl p-8 text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Play className="w-10 h-10 text-primary" />
          </div>

          <h2 className="text-2xl font-semibold mb-2">Ready to Solve?</h2>
          <p className="text-muted-foreground mb-6">
            Timer will guide you through the solving phases
          </p>

          <div className="space-y-3 text-left mb-8 max-w-sm mx-auto">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-sm">0-20 min: No Keyboard</p>
                <p className="text-xs text-muted-foreground">Think on paper first</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/5">
              <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center text-warning text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-sm">20-60 min: Keyboard OK</p>
                <p className="text-xs text-muted-foreground">Start coding</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5">
              <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-sm">60+ min: Editorial OK</p>
                <p className="text-xs text-muted-foreground">Check solution if stuck</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setState('timing')}
            className="btn-primary px-8 py-3 text-lg"
          >
            Start Timer
          </button>
        </div>
      )}

      {/* Timer State */}
      {state === 'timing' && (
        <Timer
          problemId={problem.id}
          onComplete={handleTimerComplete}
          className="animate-fade-in"
        />
      )}

      {/* Form State */}
      {state === 'form' && (
        <BlackBookForm
          problemId={problem.id}
          problemTitle={problem.title}
          timeSpent={timeSpent}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};
