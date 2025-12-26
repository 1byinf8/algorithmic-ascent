import { useState, useMemo } from 'react';
import { planData, DayData, Problem } from '@/data/problemData';
import { BlackBookEntry } from '@/types';
import { useProgress } from '@/hooks/useLocalStorage';
import { DayHeader } from '@/components/DayHeader';
import { ProblemCard } from '@/components/ProblemCard';
import { ProblemSolver } from '@/components/ProblemSolver';
import { StatsBar } from '@/components/StatsBar';
import { BottomNav } from '@/components/BottomNav';
import { EntriesList } from '@/components/EntriesList';
import { EntryDetail } from '@/components/EntryDetail';
import { StatsView } from '@/components/StatsView';
import { SettingsView } from '@/components/SettingsView';
import { toast } from 'sonner';
import { Code2 } from 'lucide-react';

type ActiveTab = 'home' | 'entries' | 'stats' | 'settings';
type ViewState = 
  | { type: 'list' }
  | { type: 'solving'; problem: Problem }
  | { type: 'entry-detail'; entry: BlackBookEntry };

const Index = () => {
  const { progress, updateProblemState, addEntry, getDayProgress, startDate } = useProgress();
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [viewState, setViewState] = useState<ViewState>({ type: 'list' });
  const [viewingDay, setViewingDay] = useState(1);

  // Get current day data
  const currentDayData = useMemo(() => {
    return planData.find(d => d.day === viewingDay) || planData[0];
  }, [viewingDay]);

  // Calculate progress for current day
  const dayProgress = useMemo(() => {
    return getDayProgress(viewingDay, currentDayData.problems);
  }, [viewingDay, currentDayData, progress.problemStates]);

  // Get all entries sorted by date
  const allEntries = useMemo(() => {
    return [...progress.entries].sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  }, [progress.entries]);

  // Stats calculations
  const totalSolved = allEntries.length;
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weeklySolved = allEntries.filter(e => 
    new Date(e.completedAt) >= weekStart
  ).length;

  // Calculate streak (simplified)
  const streak = useMemo(() => {
    if (allEntries.length === 0) return 0;
    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 120; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const hasEntry = allEntries.some(e => {
        const entryDate = new Date(e.completedAt);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === checkDate.getTime();
      });
      if (hasEntry) count++;
      else if (i > 0) break;
    }
    return count;
  }, [allEntries]);

  const handleProblemClick = (problem: Problem) => {
    setViewState({ type: 'solving', problem });
  };

  const handleProblemComplete = (entry: BlackBookEntry) => {
    addEntry(entry);
    updateProblemState(entry.problemId, {
      status: 'completed',
      elapsedTime: entry.timeSpent,
    });
    setViewState({ type: 'list' });
    toast.success('Problem solved! Entry added to Black Book.');
  };

  const handleEntryClick = (entry: BlackBookEntry) => {
    setViewState({ type: 'entry-detail', entry });
  };

  const handleExportData = () => {
    const data = JSON.stringify(progress, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dsa-tracker-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Data exported successfully!');
  };

  const handleResetProgress = () => {
    localStorage.removeItem('dsa-tracker-progress');
    window.location.reload();
  };

  // Render solving view
  if (viewState.type === 'solving') {
    return (
      <ProblemSolver
        problem={viewState.problem}
        onComplete={handleProblemComplete}
        onBack={() => setViewState({ type: 'list' })}
      />
    );
  }

  // Render entry detail view
  if (viewState.type === 'entry-detail') {
    return (
      <EntryDetail
        entry={viewState.entry}
        onBack={() => setViewState({ type: 'list' })}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <header className="glass sticky top-0 z-10 px-4 py-3 mb-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-6 h-6 text-primary" />
          <h1 className="font-bold text-lg">DSA Tracker</h1>
        </div>
      </header>

      <main className="px-4 pb-24">
        {activeTab === 'home' && (
          <>
            <StatsBar
              totalSolved={totalSolved}
              streak={streak}
              weeklyTarget={10}
              weeklySolved={weeklySolved}
            />

            <DayHeader
              dayData={currentDayData}
              progress={dayProgress}
              currentDay={1}
              viewingDay={viewingDay}
              onPrevDay={() => setViewingDay(d => Math.max(1, d - 1))}
              onNextDay={() => setViewingDay(d => Math.min(planData.length, d + 1))}
              canGoPrev={viewingDay > 1}
              canGoNext={viewingDay < planData.length}
            />

            <div className="space-y-3">
              {currentDayData.problems.map(problem => (
                <ProblemCard
                  key={problem.id}
                  problem={problem}
                  status={progress.problemStates[problem.id]?.status || 'not-started'}
                  isOptional={problem.isOptional}
                  onClick={() => handleProblemClick(problem)}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === 'entries' && (
          <EntriesList
            entries={allEntries}
            onEntryClick={handleEntryClick}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView entries={allEntries} startDate={startDate} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            startDate={startDate}
            onResetProgress={handleResetProgress}
            onExportData={handleExportData}
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
