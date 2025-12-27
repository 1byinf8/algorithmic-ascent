export { planData } from './planData';

// Type definitions
export interface Problem {
  id: string;
  title: string;
  url: string;
  platform: 'CSES' | 'CodeForces' | 'AtCoder' | 'LeetCode';
  rating?: number;
  isOptional?: boolean;
}

export interface DayData {
  day: number;
  isWeekend: boolean;
  focus: string;
  problems: Problem[];
  duration: string;
}

// Helper functions
export const getCurrentDay = (startDate: Date): number => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.min(diffDays + 1, 120);
};

// Calculate rating threshold based on days elapsed
export const getRatingThreshold = (daysElapsed: number): number => {
  const baseThreshold = 1500;
  const monthsElapsed = Math.floor(daysElapsed / 30);
  return baseThreshold + (monthsElapsed * 100);
};

// Determine required problems based on day type and threshold
export const getRequiredProblems = (isWeekend: boolean, currentRating: number, threshold: number): number => {
  if (currentRating < threshold) {
    return isWeekend ? 4 : 2;
  }
  return isWeekend ? 2 : 1;
};