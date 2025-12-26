import { DayData } from '@/data/problemData';
import { Calendar, Clock, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DayHeaderProps {
  dayData: DayData;
  progress: { completed: number; total: number; percentage: number };
  onPrevDay: () => void;
  onNextDay: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  currentDay: number;
  viewingDay: number;
}

export const DayHeader = ({ 
  dayData, 
  progress, 
  onPrevDay, 
  onNextDay, 
  canGoPrev, 
  canGoNext,
  currentDay,
  viewingDay,
}: DayHeaderProps) => {
  const isToday = currentDay === viewingDay;

  return (
    <div className="glass rounded-2xl p-6 mb-6">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={onPrevDay}
          disabled={!canGoPrev}
          className={cn(
            "p-2 rounded-lg transition-colors",
            canGoPrev ? "hover:bg-muted" : "opacity-30 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-mono text-lg font-bold">Day {dayData.day}</span>
            {isToday && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                Today
              </span>
            )}
            {dayData.isWeekend && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                Weekend
              </span>
            )}
          </div>
        </div>

        <button 
          onClick={onNextDay}
          disabled={!canGoNext}
          className={cn(
            "p-2 rounded-lg transition-colors",
            canGoNext ? "hover:bg-muted" : "opacity-30 cursor-not-allowed"
          )}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Focus Topic */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
          <Target className="w-4 h-4" />
          <span className="text-sm">Focus</span>
        </div>
        <h1 className="text-xl font-semibold">{dayData.focus}</h1>
      </div>

      {/* Meta info */}
      <div className="flex justify-center gap-6 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{dayData.duration}</span>
        </div>
        <div>
          {dayData.problems.length} problems
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-mono font-medium">
            {progress.completed}/{progress.total}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
