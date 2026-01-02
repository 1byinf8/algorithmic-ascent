import { useState } from 'react';
import { BlackBookEntry } from '@/types';
import { Check, X, BookOpen, Lightbulb, AlertTriangle, Target, Wrench, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Predefined patterns for consistency in stats
const PATTERN_TAGS = [
  'Game Theory',
  'Greedy',
  'DP',
  'Binary Search',
  'Two Pointers',
  'Sliding Window',
  'Graph - BFS',
  'Graph - DFS',
  'Graph - Dijkstra',
  'Graph - MST',
  'Graph - Topological Sort',
  'Segment Tree',
  'Fenwick Tree',
  'Union Find',
  'Math',
  'Number Theory',
  'Combinatorics',
  'String - Hashing',
  'String - KMP',
  'String - Z-function',
  'Trie',
  'Stack',
  'Queue',
  'Heap',
  'Sorting',
  'Prefix Sum',
  'Difference Array',
  'Bit Manipulation',
  'Divide & Conquer',
  'Meet in the Middle',
  'Constructive',
  'Implementation',
  'Simulation',
  'Ad Hoc',
] as const;

interface BlackBookFormProps {
  problemId: string;
  problemTitle: string;
  timeSpent: number;
  onSubmit: (entry: BlackBookEntry) => void;
  onCancel: () => void;
}

export const BlackBookForm = ({
  problemId,
  problemTitle,
  timeSpent,
  onSubmit,
  onCancel
}: BlackBookFormProps) => {
  const [formData, setFormData] = useState({
    typePattern: '',
    keyObservation: '',
    invariant: '',
    whyBruteFails: '',
    finalApproach: '',
    mistakeIMade: '',
    solvedWithoutEditorial: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.typePattern) {
      return; // Require at least one pattern
    }

    const entry: BlackBookEntry = {
      problemId,
      problem: problemTitle,
      ...formData,
      timeSpent,
      completedAt: new Date(),
    };

    onSubmit(entry);
  };

  const togglePattern = (pattern: string) => {
    setFormData(prev => {
      const currentPatterns = prev.typePattern ? prev.typePattern.split(', ') : [];
      const isSelected = currentPatterns.includes(pattern);

      if (isSelected) {
        // Remove pattern
        const newPatterns = currentPatterns.filter(p => p !== pattern);
        return { ...prev, typePattern: newPatterns.join(', ') };
      } else {
        // Add pattern
        const newPatterns = [...currentPatterns, pattern];
        return { ...prev, typePattern: newPatterns.join(', ') };
      }
    });
  };

  const selectedPatterns = formData.typePattern ? formData.typePattern.split(', ') : [];

  const fields = [
    {
      key: 'keyObservation',
      label: 'Key Observation',
      icon: Lightbulb,
      placeholder: 'What insight unlocked the solution?',
    },
    {
      key: 'invariant',
      label: 'Invariant',
      icon: Target,
      placeholder: 'What property remains constant?',
    },
    {
      key: 'whyBruteFails',
      label: 'Why Brute Force Fails',
      icon: AlertTriangle,
      placeholder: 'Time/space complexity issues...',
    },
    {
      key: 'finalApproach',
      label: 'Final Approach',
      icon: Wrench,
      placeholder: 'Describe your solution strategy...',
    },
    {
      key: 'mistakeIMade',
      label: 'Mistake I Made',
      icon: XCircle,
      placeholder: 'What went wrong initially?',
    },
  ];

  return (
    <div className="glass rounded-2xl p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Black Book Entry
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4 p-3 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">Problem</p>
        <p className="font-medium">{problemTitle}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Time spent: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pattern Selection */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <BookOpen className="w-4 h-4" />
            Type/Pattern <span className="text-destructive">*</span>
          </label>
          <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border border-border max-h-[180px] overflow-y-auto">
            {PATTERN_TAGS.map(pattern => {
              const isSelected = selectedPatterns.includes(pattern);
              return (
                <button
                  key={pattern}
                  type="button"
                  onClick={() => togglePattern(pattern)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-full border transition-all",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary/50 hover:bg-muted"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                  {pattern}
                </button>
              );
            })}
          </div>
          {selectedPatterns.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Selected: {selectedPatterns.join(', ')}
            </p>
          )}
          {selectedPatterns.length === 0 && (
            <p className="text-xs text-destructive">
              Please select at least one pattern
            </p>
          )}
        </div>

        {/* Other Fields */}
        {fields.map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key} className="space-y-1">
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Icon className="w-4 h-4" />
              {label}
            </label>
            <textarea
              value={formData[key as keyof typeof formData] as string}
              onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
              placeholder={placeholder}
              className="input-field w-full min-h-[80px] resize-none font-mono text-sm"
              required
            />
          </div>
        ))}

        {/* Editorial Checkbox */}
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <button
            type="button"
            onClick={() => setFormData(prev => ({
              ...prev,
              solvedWithoutEditorial: !prev.solvedWithoutEditorial
            }))}
            className={cn(
              "w-6 h-6 rounded-md flex items-center justify-center transition-colors",
              formData.solvedWithoutEditorial
                ? "bg-success text-success-foreground"
                : "bg-muted border-2 border-border"
            )}
          >
            {formData.solvedWithoutEditorial && <Check className="w-4 h-4" />}
          </button>
          <span className="text-sm font-medium">
            Solved without using editorial
          </span>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={selectedPatterns.length === 0}
            className={cn(
              "flex-1 btn-primary",
              selectedPatterns.length === 0 && "opacity-50 cursor-not-allowed"
            )}
          >
            Save Entry
          </button>
        </div>
      </form>
    </div>
  );
};
