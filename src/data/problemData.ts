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

// 120-day plan extracted from PDF
export const planData: DayData[] = [
  {
    day: 1,
    isWeekend: false,
    focus: "Game Theory Basics - Nim Game",
    duration: "2-3 hrs",
    problems: [
      { id: "d1p1", title: "Stick Game", url: "https://cses.fi/problemset/task/1729", platform: "CSES" },
      { id: "d1p2", title: "String Equality", url: "https://codeforces.com/problemset/problem/1451/C", platform: "CodeForces", rating: 1400 },
    ]
  },
  {
    day: 2,
    isWeekend: false,
    focus: "Game Theory - Grundy Numbers",
    duration: "2-3 hrs",
    problems: [
      { id: "d2p1", title: "Nim Game I", url: "https://cses.fi/problemset/task/1730", platform: "CSES" },
      { id: "d2p2", title: "Code For 1", url: "https://codeforces.com/problemset/problem/768/B", platform: "CodeForces", rating: 1500 },
    ]
  },
  {
    day: 3,
    isWeekend: false,
    focus: "Game Theory - Misère Nim",
    duration: "2-3 hrs",
    problems: [
      { id: "d3p1", title: "Nim Game II", url: "https://cses.fi/problemset/task/1098", platform: "CSES" },
      { id: "d3p2", title: "Permutation Game", url: "https://codeforces.com/problemset/problem/1033/C", platform: "CodeForces", rating: 1600 },
    ]
  },
  {
    day: 4,
    isWeekend: false,
    focus: "Greedy - Activity Selection Pattern",
    duration: "2-3 hrs",
    problems: [
      { id: "d4p1", title: "Movie Festival", url: "https://cses.fi/problemset/task/1629", platform: "CSES" },
      { id: "d4p2", title: "The Delivery Dilemma", url: "https://codeforces.com/problemset/problem/1443/C", platform: "CodeForces", rating: 1400 },
      { id: "d4p3", title: "Bank", url: "https://atcoder.jp/contests/abc294/tasks/abc294_d", platform: "AtCoder", isOptional: true },
    ]
  },
  {
    day: 5,
    isWeekend: false,
    focus: "Greedy - Sorting + Exchange Arguments",
    duration: "2-3 hrs",
    problems: [
      { id: "d5p1", title: "Tasks and Deadlines", url: "https://cses.fi/problemset/task/1630", platform: "CSES" },
      { id: "d5p2", title: "Slay the Dragon", url: "https://codeforces.com/problemset/problem/1574/C", platform: "CodeForces", rating: 1300 },
      { id: "d5p3", title: "Number of Pairs", url: "https://codeforces.com/problemset/problem/1538/C", platform: "CodeForces", rating: 1300, isOptional: true },
    ]
  },
  {
    day: 6,
    isWeekend: true,
    focus: "Greedy - Minimizing Maximum/Maximizing Minimum",
    duration: "5-6 hrs",
    problems: [
      { id: "d6p1", title: "Sum of Three Values", url: "https://cses.fi/problemset/task/1641", platform: "CSES" },
      { id: "d6p2", title: "Maximum Median", url: "https://codeforces.com/problemset/problem/1201/C", platform: "CodeForces", rating: 1400 },
      { id: "d6p3", title: "Good Key, Bad Key", url: "https://codeforces.com/problemset/problem/1519/D", platform: "CodeForces", rating: 1600 },
      { id: "d6p4", title: "Distinct Split", url: "https://codeforces.com/problemset/problem/1791/D", platform: "CodeForces", rating: 1100 },
    ]
  },
  {
    day: 7,
    isWeekend: true,
    focus: "Combinatorics - Counting Basics",
    duration: "5-6 hrs",
    problems: [
      { id: "d7p1", title: "Counting Towers", url: "https://cses.fi/problemset/task/2413", platform: "CSES" },
      { id: "d7p2", title: "Yet Another Counting Problem", url: "https://codeforces.com/problemset/problem/1342/C", platform: "CodeForces", rating: 1600 },
      { id: "d7p3", title: "Yet Another Recursive Function", url: "https://atcoder.jp/contests/abc275/tasks/abc275_d", platform: "AtCoder" },
      { id: "d7p4", title: "Madoka and Childish Pranks", url: "https://codeforces.com/problemset/problem/1647/C", platform: "CodeForces", rating: 1300 },
      { id: "d7p5", title: "Creating Strings II", url: "https://cses.fi/problemset/task/1715", platform: "CSES", isOptional: true },
    ]
  },
  {
    day: 8,
    isWeekend: false,
    focus: "Combinatorics - Stars and Bars",
    duration: "2-3 hrs",
    problems: [
      { id: "d8p1", title: "Distributing Apples", url: "https://cses.fi/problemset/task/1716", platform: "CSES" },
      { id: "d8p2", title: "Close Tuples (easy)", url: "https://codeforces.com/problemset/problem/1462/E1", platform: "CodeForces", rating: 1700 },
    ]
  },
  {
    day: 9,
    isWeekend: false,
    focus: "Combinatorics - Inclusion-Exclusion",
    duration: "2-3 hrs",
    problems: [
      { id: "d9p1", title: "Counting Coprime Pairs", url: "https://cses.fi/problemset/task/2417", platform: "CSES" },
      { id: "d9p2", title: "Willem, Chtholly and Seniorious", url: "https://codeforces.com/problemset/problem/896/C", platform: "CodeForces", rating: 2100, isOptional: true },
    ]
  },
  {
    day: 10,
    isWeekend: false,
    focus: "Shortest Path - Dijkstra's Algorithm",
    duration: "2-3 hrs",
    problems: [
      { id: "d10p1", title: "Shortest Routes I", url: "https://cses.fi/problemset/task/1671", platform: "CSES" },
      { id: "d10p2", title: "Greetings", url: "https://codeforces.com/problemset/problem/1915/F", platform: "CodeForces", rating: 1500 },
    ]
  },
];

// Helper to get current day based on start date
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
