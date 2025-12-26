import { Flame, Trophy, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsBarProps {
  totalSolved: number;
  streak: number;
  weeklyTarget: number;
  weeklySolved: number;
}

export const StatsBar = ({ totalSolved, streak, weeklyTarget, weeklySolved }: StatsBarProps) => {
  const stats = [
    {
      icon: Trophy,
      label: 'Solved',
      value: totalSolved,
      color: 'text-primary',
    },
    {
      icon: Flame,
      label: 'Streak',
      value: `${streak}d`,
      color: 'text-warning',
    },
    {
      icon: Target,
      label: 'Weekly',
      value: `${weeklySolved}/${weeklyTarget}`,
      color: 'text-success',
    },
  ];

  return (
    <div className="glass rounded-xl p-4 mb-6">
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <stat.icon className={cn("w-5 h-5 mx-auto mb-1", stat.color)} />
            <div className="font-mono font-bold text-lg">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
