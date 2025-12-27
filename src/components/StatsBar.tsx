import { Flame, Trophy, Target, Zap } from 'lucide-react';
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
      gradient: 'from-violet-500 to-purple-600',
      iconBg: 'bg-violet-500/20',
      iconColor: 'text-violet-400',
    },
    {
      icon: Flame,
      label: 'Streak',
      value: `${streak}d`,
      gradient: 'from-orange-500 to-red-500',
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-400',
      pulse: streak > 0,
    },
    {
      icon: Target,
      label: 'Weekly',
      value: `${weeklySolved}/${weeklyTarget}`,
      gradient: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            "stat-card text-center animate-slide-up",
            `stagger-${index + 1}`
          )}
          style={{ animationFillMode: 'backwards' }}
        >
          <div className={cn(
            "w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center",
            stat.iconBg
          )}>
            <stat.icon className={cn(
              "w-6 h-6",
              stat.iconColor,
              stat.pulse && "animate-pulse"
            )} />
          </div>
          <div className={cn(
            "font-mono font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r",
            stat.gradient
          )}>
            {stat.value}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wide">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};
