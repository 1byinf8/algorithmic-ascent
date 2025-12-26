import { BlackBookEntry } from '@/types';
import { BookOpen, Clock, Check, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EntriesListProps {
  entries: BlackBookEntry[];
  onEntryClick: (entry: BlackBookEntry) => void;
}

export const EntriesList = ({ entries, onEntryClick }: EntriesListProps) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="font-medium text-lg mb-2">No entries yet</h3>
        <p className="text-muted-foreground text-sm">
          Complete problems to build your Black Book
        </p>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => (
        <div
          key={`${entry.problemId}-${index}`}
          onClick={() => onEntryClick(entry)}
          className="problem-card flex items-center justify-between"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium">{entry.problem}</h3>
              {entry.solvedWithoutEditorial ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <X className="w-4 h-4 text-destructive" />
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(entry.timeSpent)}
              </span>
              <span>{entry.typePattern}</span>
              <span>{formatDate(entry.completedAt)}</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      ))}
    </div>
  );
};
