export interface BlackBookEntry {
  problemId: string;
  problem: string;
  typePattern: string;
  keyObservation: string;
  invariant: string;
  whyBruteFails: string;
  finalApproach: string;
  mistakeIMade: string;
  solvedWithoutEditorial: boolean;
  timeSpent: number; // in seconds
  completedAt: Date;
}

export interface ProblemState {
  problemId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  timerStarted?: Date;
  timerPhase: 'phase1' | 'phase2' | 'phase3';
  elapsedTime: number;
  blackBookEntry?: BlackBookEntry;
}

export interface UserProgress {
  startDate: Date;
  currentDay: number;
  problemStates: Record<string, ProblemState>;
  weeklyReports: WeeklyReport[];
}

export interface WeeklyReport {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  problemsSolved: number;
  averageTime: number;
  weakAreas: string[];
  strongAreas: string[];
  suggestions: string[];
}

export type TimerPhase = 'phase1' | 'phase2' | 'phase3';

export interface TimerState {
  isRunning: boolean;
  startTime: Date | null;
  elapsedSeconds: number;
  phase: TimerPhase;
}
