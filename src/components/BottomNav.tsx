import { Home, BookOpen, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: 'home' | 'entries' | 'stats' | 'settings';
  onTabChange: (tab: 'home' | 'entries' | 'stats' | 'settings') => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    { id: 'home' as const, icon: Home, label: 'Today' },
    { id: 'entries' as const, icon: BookOpen, label: 'Entries' },
    { id: 'stats' as const, icon: BarChart3, label: 'Stats' },
    { id: 'settings' as const, icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="bottom-nav">
      <div className="flex justify-around items-center h-16 px-2 max-w-lg mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "nav-item flex flex-col items-center gap-1 px-4 py-2 min-w-[64px] transition-all duration-300",
              activeTab === tab.id && "active"
            )}
          >
            <div className={cn(
              "transition-transform duration-300",
              activeTab === tab.id && "scale-110"
            )}>
              <tab.icon className={cn(
                "w-5 h-5 transition-colors duration-300",
                activeTab === tab.id ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <span className={cn(
              "text-xs font-semibold transition-colors duration-300",
              activeTab === tab.id ? "text-primary" : "text-muted-foreground"
            )}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};
