import { useState, useMemo, useEffect } from 'react';
import { planData, Problem, getCurrentDay } from '@/data/problemData';
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
import { Code2, Loader2 } from 'lucide-react';

type ActiveTab = 'home' | 'entries' | 'stats' | 'settings';

type ViewState = 
  | { type: 'list' }
  | { type: 'solving'; problem: Problem }
  | { type: 'entry-detail'; entry: BlackBookEntry };

const Index = () => {
  const { progress, updateProblemState, addEntry, getDayProgress, startDate, resetProgress, isLoading } = useProgress();
  
  const [viewState, setViewState] = useLocalStorage<ViewState>('dsa-view-state', { type: 'list' });
  const [activeTab, setActiveTab] = useLocalStorage<ActiveTab>('dsa-active-tab', 'home');
  
  // Calculate the current day based on start date
  const calculatedCurrentDay = useMemo(() => getCurrentDay(startDate), [startDate]);
  
  // Initialize viewing day to current day, but allow user to navigate
  const [viewingDay, setViewingDay] = useLocalStorage<number>('dsa-viewing-day', calculatedCurrentDay);
  
  // Update viewing day if it's still on day 1 and current day has progressed
  useEffect(() => {
    if (viewingDay === 1 && calculatedCurrentDay > 1) {
      setViewingDay(calculatedCurrentDay);
    }
  }, [calculatedCurrentDay, viewingDay, setViewingDay]);
  
  const [isSaving, setIsSaving] = useState(false);

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

  const handleProblemClick = (problem: Problem) => {
    setViewState({ type: 'solving', problem });
  };

  const handleProblemComplete = async (entry: BlackBookEntry) => {
    setIsSaving(true);
    try {
      await addEntry(entry);
      await updateProblemState(entry.problemId, {
        status: 'completed',
        elapsedTime: entry.timeSpent,
      });
      await setViewState({ type: 'list' });
      toast.success('Problem solved! 🎉');
    } catch (error) {
      console.error('Error saving progress:', error);
      toast.error('Failed to save progress. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const handleResetProgress = async () => {
    try {
      await resetProgress();
      await setViewState({ type: 'list' });
      await setActiveTab('home');
      const newCurrentDay = getCurrentDay(new Date());
      await setViewingDay(newCurrentDay);
      toast.success('Progress reset successfully!');
    } catch (error) {
      console.error('Error resetting progress:', error);
      toast.error('Failed to reset progress. Please try again.');
    }
  };

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  // Solving view - Full screen on mobile
  if (viewState.type === 'solving') {
    return (
      <div className="min-h-screen bg-background">
        <ProblemSolver
          problem={viewState.problem}
          onComplete={handleProblemComplete}
          onBack={() => setViewState({ type: 'list' })}
        />
        {isSaving && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass rounded-2xl p-6 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="font-medium">Saving your progress...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Entry detail view - Full screen on mobile
  if (viewState.type === 'entry-detail') {
    return (
      <div className="min-h-screen bg-background">
        <EntryDetail
          entry={viewState.entry}
          onBack={() => setViewState({ type: 'list' })}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header - Responsive */}
      <header className="w-full glass sticky top-0 z-10 border-b border-border/50 safe-area-top">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 md:w-6 md:h-6 text-primary animate-pulse" />
            <h1 className="font-bold text-base md:text-lg tracking-tight">DSA Tracker</h1>
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">
            Day {viewingDay}/120
          </div>
        </div>
      </header>

      {/* Main Content - Responsive container */}
      <main className="flex-1 container mx-auto px-4 pb-24 pt-4 md:pt-6 max-w-7xl">
        {activeTab === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4 md:space-y-6">
            {/* Stats Bar */}
            <StatsBar
              totalSolved={totalSolved}
              streak={streak}
              weeklyTarget={10}
              weeklySolved={weeklySolved}
            />

            {/* Two column layout on desktop */}
            <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr,320px]">
              {/* Left Column: Problems */}
              <div className="space-y-4">
                <DayHeader
                  dayData={currentDayData}
                  progress={dayProgress}
                  currentDay={calculatedCurrentDay}
                  viewingDay={viewingDay}
                  onPrevDay={() => setViewingDay(d => Math.max(1, d - 1))}
                  onNextDay={() => setViewingDay(d => Math.min(120, d + 1))}
                  canGoPrev={viewingDay > 1}
                  canGoNext={viewingDay < 120}
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

              {/* Right Column: Mini Stats (Hidden on mobile) */}
              <div className="hidden lg:block space-y-4">
                <div className="glass p-4 rounded-xl">
                  <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Total Progress</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-3xl font-bold text-primary">{totalSolved}</div>
                      <div className="text-xs text-muted-foreground">problems solved</div>
                    </div>
                    <div className="h-px bg-border"></div>
                    <div>
                      <div className="text-2xl font-bold text-warning">{streak}</div>
                      <div className="text-xs text-muted-foreground">day streak 🔥</div>
                    </div>
                  </div>
                </div>

                <div className="glass p-4 rounded-xl">
                  <h3 className="font-semibold mb-2 text-sm text-muted-foreground">This Week</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completed</span>
                      <span className="font-mono font-medium">{weeklySolved}/10</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success transition-all duration-500"
                        style={{ width: `${Math.min((weeklySolved / 10) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="glass p-4 rounded-xl">
                  <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Quick Jump</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingDay(calculatedCurrentDay)}
                      className="flex-1 text-xs py-2 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                    >
                      Today (Day {calculatedCurrentDay})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'entries' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Black Book Entries</h2>
            <EntriesList
              entries={allEntries}
              onEntryClick={handleEntryClick}
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="max-w-4xl mx-auto">
            <StatsView entries={allEntries} startDate={startDate} />
          </div>
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