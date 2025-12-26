import { Problem } from '@/data/problemData';
import { ExternalLink, CheckCircle2, Circle, Clock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProblemCardProps {
  problem: Problem;
  status: 'not-started' | 'in-progress' | 'completed';
  isOptional?: boolean;
  onClick: () => void;
}

const platformColors = {
  CSES: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  CodeForces: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  AtCoder: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  LeetCode: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

const statusConfig = {
  'not-started': {
    icon: Circle,
    color: 'text-muted-foreground',
    label: 'Not Started',
  },
  'in-progress': {
    icon: Clock,
    color: 'text-warning',
    label: 'In Progress',
  },
  'completed': {
    icon: CheckCircle2,
    color: 'text-success',
    label: 'Completed',
  },
};

export const ProblemCard = ({ problem, status, isOptional, onClick }: ProblemCardProps) => {
  const StatusIcon = statusConfig[status].icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        "problem-card group relative",
        status === 'completed' && "opacity-70"
      )}
    >
      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        <StatusIcon className={cn("w-5 h-5", statusConfig[status].color)} />
      </div>

      {/* Optional badge */}
      {isOptional && (
        <div className="absolute top-4 left-4">
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
            <Star className="w-3 h-3" />
            Optional
          </span>
        </div>
      )}

      <div className={cn("pt-2", isOptional && "pt-8")}>
        {/* Platform badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full border",
            platformColors[problem.platform]
          )}>
            {problem.platform}
          </span>
          {problem.rating && (
            <span className="text-xs text-muted-foreground">
              Rating: {problem.rating}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-medium text-lg mb-2 group-hover:text-primary transition-colors pr-8">
          {problem.title}
        </h3>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          <span className={cn(
            "text-xs px-2 py-1 rounded-full",
            statusConfig[status].color,
            status === 'not-started' && "bg-muted",
            status === 'in-progress' && "bg-warning/10",
            status === 'completed' && "bg-success/10"
          )}>
            {statusConfig[status].label}
          </span>
          
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Open Problem
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
