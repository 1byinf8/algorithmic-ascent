import { BlackBookEntry } from '@/types';
import { Trophy, Clock, Target, TrendingUp, Brain } from 'lucide-react';
import { WeeklyAnalysis } from '@/components/WeeklyAnalysis';
import { cn } from '@/lib/utils';

interface StatsViewProps {
  entries: BlackBookEntry[];
  startDate: Date;
}

export const StatsView = ({ entries, startDate }: StatsViewProps) => {
  // Calculate stats
  const totalProblems = entries.length;
  const totalTime = entries.reduce((sum, e) => sum + e.timeSpent, 0);
  const avgTime = totalProblems > 0 ? Math.floor(totalTime / totalProblems / 60) : 0;
  const withoutEditorial = entries.filter(e => e.solvedWithoutEditorial).length;
  const editorialPercentage = totalProblems > 0
    ? Math.round((withoutEditorial / totalProblems) * 100)
    : 0;

  // Pattern breakdown - count each pattern separately (multi-tag support)
  const patternCounts = entries.reduce((acc, e) => {
    // Split patterns by comma and count each one
    const patterns = e.typePattern.split(',').map(p => p.trim()).filter(p => p);
    patterns.forEach(pattern => {
      acc[pattern] = (acc[pattern] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topPatterns = Object.entries(patternCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Days since start
  const daysSinceStart = Math.floor(
    (new Date().getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  const stats = [
    {
      icon: Trophy,
      label: 'Total Solved',
      value: totalProblems,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      icon: Clock,
      label: 'Avg Time',
      value: `${avgTime}m`,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      icon: Target,
      label: 'No Editorial',
      value: `${editorialPercentage}%`,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      icon: TrendingUp,
      label: 'Day',
      value: daysSinceStart,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">Statistics</h1>

      {/* Main stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4 text-center">
            <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-lg mx-auto mb-2 flex items-center justify-center", stat.bgColor)}>
              <stat.icon className={cn("w-5 h-5 md:w-6 md:h-6", stat.color)} />
            </div>
            <div className="font-mono text-xl md:text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* AI Weekly Analysis */}
      <WeeklyAnalysis entries={entries} startDate={startDate} />

      {/* Pattern breakdown */}
      <div className="glass rounded-xl p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">Pattern Breakdown</h2>
        </div>

        {topPatterns.length > 0 ? (
          <div className="space-y-3">
            {topPatterns.map(([pattern, count]) => (
              <div key={pattern}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{pattern}</span>
                  <span className="font-mono text-muted-foreground">{count} problems</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${(count / totalProblems) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-8">
            Solve problems to see pattern breakdown
          </p>
        )}
      </div>

      {/* Progress Timeline */}
      <div className="glass rounded-xl p-4 md:p-6">
        <h2 className="font-semibold text-lg mb-4">Progress Timeline</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Days Active</span>
            <span className="font-mono font-medium">{daysSinceStart}/124</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-success to-primary transition-all duration-500"
              style={{ width: `${(daysSinceStart / 124) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {124 - daysSinceStart} days remaining in your 124-day journey
          </p>
        </div>
      </div>
    </div>
  );
};