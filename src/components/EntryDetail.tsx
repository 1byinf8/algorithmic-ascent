import { BlackBookEntry } from '@/types';
import { ArrowLeft, BookOpen, Lightbulb, Target, AlertTriangle, Wrench, XCircle, Check, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EntryDetailProps {
  entry: BlackBookEntry;
  onBack: () => void;
}

export const EntryDetail = ({ entry, onBack }: EntryDetailProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const fields = [
    { icon: BookOpen, label: 'Type/Pattern', value: entry.typePattern },
    { icon: Lightbulb, label: 'Key Observation', value: entry.keyObservation },
    { icon: Target, label: 'Invariant', value: entry.invariant },
    { icon: AlertTriangle, label: 'Why Brute Fails', value: entry.whyBruteFails },
    { icon: Wrench, label: 'Final Approach', value: entry.finalApproach },
    { icon: XCircle, label: 'Mistake I Made', value: entry.mistakeIMade },
  ];

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-lg">{entry.problem}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(entry.completedAt)}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{formatTime(entry.timeSpent)}</span>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg",
          entry.solvedWithoutEditorial ? "bg-success/10" : "bg-destructive/10"
        )}>
          {entry.solvedWithoutEditorial ? (
            <>
              <Check className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-success">No Editorial</span>
            </>
          ) : (
            <>
              <X className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Used Editorial</span>
            </>
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        {fields.map(({ icon: Icon, label, value }) => (
          <div key={label} className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Icon className="w-4 h-4" />
              {label}
            </div>
            <p className="font-mono text-sm whitespace-pre-wrap">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
