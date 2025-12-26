import { BlackBookEntry } from '@/types';
import { Trophy, Clock, Target, TrendingUp, BookOpen, Brain } from 'lucide-react';
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

  // Pattern breakdown
  const patternCounts = entries.reduce((acc, e) => {
    const pattern = e.typePattern.split(',')[0].trim();
    acc[pattern] = (acc[pattern] || 0) + 1;
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
    { icon: Trophy, label: 'Total Solved', value: totalProblems, color: 'text-primary' },
    { icon: Clock, label: 'Avg Time', value: `${avgTime}m`, color: 'text-warning' },
    { icon: Target, label: 'No Editorial', value: `${editorialPercentage}%`, color: 'text-success' },
    { icon: TrendingUp, label: 'Day', value: daysSinceStart, color: 'text-accent' },
  ];

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Statistics</h1>

      {/* Main stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4 text-center">
            <stat.icon className={cn("w-6 h-6 mx-auto mb-2", stat.color)} />
            <div className="font-mono text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pattern breakdown */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Pattern Breakdown</h2>
        </div>
        
        {topPatterns.length > 0 ? (
          <div className="space-y-3">
            {topPatterns.map(([pattern, count]) => (
              <div key={pattern}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{pattern}</span>
                  <span className="font-mono text-muted-foreground">{count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(count / totalProblems) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">
            Solve problems to see pattern breakdown
          </p>
        )}
      </div>

      {/* Weekly AI Report placeholder */}
      <div className="glass rounded-xl p-4 border-2 border-dashed border-primary/30">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Weekly AI Report</h2>
        </div>
        <p className="text-muted-foreground text-sm mb-4">
          Connect to Lovable Cloud to enable AI-powered weekly analysis of your weak areas and personalized problem suggestions.
        </p>
        <div className="text-xs text-muted-foreground">
          Coming soon with backend integration
        </div>
      </div>
    </div>
  );
};
