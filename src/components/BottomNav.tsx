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
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-4 max-w-lg mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
              activeTab === tab.id 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
