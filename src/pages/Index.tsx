import { useState, useMemo, useEffect } from 'react';
import { planData, Problem } from '@/data/problemData';
import { BlackBookEntry } from '@/types';
import { useProgress, useLocalStorage } from '@/hooks/useLocalStorage';
import { DayHeader } from '@/components/DayHeader';
import { ProblemCard } from '@/components/ProblemCard';
import { ProblemSolver } from '@/components/ProblemSolver';
import { StatsBar } from '@/components/StatsBar';
import { BottomNav } from '@/components/BottomNav';
import { EntriesList } from '@/components/EntriesList';
import { EntryDetail } from '@/components/EntryDetail';
import { StatsView } from '@/components/StatsView';
import { SettingsView } from '@/components/SettingsView';
import { InstallPrompt } from '@/components/InstallPrompt';
import { toast } from 'sonner';
import { Code2 } from 'lucide-react';

type ActiveTab = 'home' | 'entries' | 'stats' | 'settings';

type ViewState = 
  | { type: 'list' }
  | { type: 'solving'; problem: Problem }
  | { type: 'entry-detail'; entry: BlackBookEntry };

const Index = () => {
  const { progress, updateProblemState, addEntry, getDayProgress, startDate } = useProgress();
  
  // Persist View State
  const [viewState, setViewState] = useLocalStorage<ViewState>('dsa-view-state', { type: 'list' });
  const [activeTab, setActiveTab] = useLocalStorage<ActiveTab>('dsa-active-tab', 'home');
  const [viewingDay, setViewingDay] = useLocalStorage<number>('dsa-viewing-day', 1);

  const currentDayData = useMemo(() => {
    return planData.find(d => d.day === viewingDay) || planData[0];
  }, [viewingDay]);

  const dayProgress = useMemo(() => {
    return getDayProgress(viewingDay, currentDayData.problems);
  }, [viewingDay, currentDayData, progress.problemStates]);

  const allEntries = useMemo(() => {
    return [...progress.entries].sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  }, [progress.entries]);

  const totalSolved = allEntries.length;
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weeklySolved = allEntries.filter(e => 
    new Date(e.completedAt) >= weekStart
  ).length;

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
      else if (i === 0 && count === 0) continue; 
      else break;
    }
    return count;
  }, [allEntries]);

  // --- Handlers ---
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
    toast.success('Problem solved!');
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
    if (confirm("Are you sure? This will delete all progress.")) {
      localStorage.removeItem('dsa-tracker-progress');
      localStorage.removeItem('dsa-view-state');
      localStorage.removeItem('dsa-active-tab');
      window.location.reload();
    }
  };

  // --- Render Views ---

  if (viewState.type === 'solving') {
    return (
      <div className="min-h-screen bg-background dark flex justify-center p-4">
        <div className="w-full max-w-4xl">
          <ProblemSolver
            problem={viewState.problem}
            onComplete={handleProblemComplete}
            onBack={() => setViewState({ type: 'list' })}
          />
        </div>
      </div>
    );
  }

  if (viewState.type === 'entry-detail') {
    return (
      <div className="min-h-screen bg-background dark flex justify-center p-4">
        <div className="w-full max-w-4xl">
          <EntryDetail
            entry={viewState.entry}
            onBack={() => setViewState({ type: 'list' })}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark text-foreground flex flex-col items-center">
      {/* Header */}
      <header className="w-full glass sticky top-0 z-10 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2">
          <Code2 className="w-6 h-6 text-primary animate-pulse" />
          <h1 className="font-bold text-lg tracking-tight">DSA Tracker</h1>
        </div>
      </header>

      {/* Main Content - FIXED WIDTH HERE */}
      <main className="w-full max-w-5xl px-4 pb-24 mt-6">
        {activeTab === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <StatsBar
              totalSolved={totalSolved}
              streak={streak}
              weeklyTarget={10}
              weeklySolved={weeklySolved}
            />

            <div className="grid gap-6 md:grid-cols-[1fr,300px]">
              {/* Left Column: Problems */}
              <div className="space-y-4">
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
                
                <div className="grid gap-3">
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
              </div>

              {/* Right Column: Mini Stats / Info (Hidden on mobile) */}
              <div className="hidden md:block space-y-4">
                <div className="glass p-4 rounded-xl border border-white/5">
                  <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Quick Stats</h3>
                  <div className="text-2xl font-bold">{totalSolved} <span className="text-sm font-normal text-muted-foreground">problems solved</span></div>
                </div>
                <div className="glass p-4 rounded-xl border border-white/5">
                  <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Current Streak</h3>
                  <div className="text-2xl font-bold text-orange-400">{streak} <span className="text-sm font-normal text-muted-foreground">days</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'entries' && (
          <div className="max-w-3xl mx-auto">
            <EntriesList
              entries={allEntries}
              onEntryClick={handleEntryClick}
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <StatsView entries={allEntries} startDate={startDate} />
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <SettingsView
              startDate={startDate}
              onResetProgress={handleResetProgress}
              onExportData={handleExportData}
            />
          </div>
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <InstallPrompt />
    </div>
  );
};

export default Index;