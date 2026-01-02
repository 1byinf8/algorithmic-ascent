# Algorithmic Ascent

A 124-day competitive programming training tracker with AI-powered insights, progressive hints, and detailed progress analytics.

## Features

### For Users

#### Study Plan & Progress Tracking
- **124-day structured curriculum** covering Game Theory, DP, Greedy, Graphs, and more
- **Daily problem sets** with curated problems from Codeforces, CSES, and AtCoder
- **Progress tracking** - mark problems as completed, track streaks
- **Dynamic weekly targets** based on your current week's plan

#### Smart Timer System
- **3-phase timer** for focused problem-solving:
  - 🟣 **Phase 1 (0-20min)**: NO KEYBOARD - Read & Think only
  - 🟡 **Phase 2 (20-60min)**: CODE MODE - Write your solution
  - 🔴 **Phase 3 (60min+)**: EDITORIAL - Consult resources if needed
- **Sound notifications** on phase transitions
- **Persistent timer state** - continues even after page refresh

#### Progressive Hints (AI-Powered)
- **LLM-generated hints** for each problem
- Hints unlock progressively:
  - **20 min**: Hint 1 (gentle nudge)
  - **40 min**: Hint 2 (stronger hint)
  - **60 min**: Hint 3 (near solution)
- Hints are **cached** - won't re-fetch on restart

#### Black Book
- **Record your learnings** after each problem
- Select from **predefined pattern tags** (DP, Greedy, Graph, etc.)
- Track key observations, mistakes, and time spent
- Multi-tag support for problems using multiple patterns

#### Stats & Analytics
- **Pattern breakdown** - see which patterns you've practiced most
- **Weekly progress tracking**
- **AI Weekly Analysis** - get personalized insights using Gemini API
- Analysis history with **localStorage caching** for fast loads

#### Settings
- **Hide problem ratings** to avoid bias
- **Sound toggle** for timer notifications
- **Export/Import data** for backup

---

### For Developers

#### Dev Mode (Localhost Only)
- **Timer slider control** - test hints without waiting 60 minutes!
- Drag slider to any time (0-70 min)
- Quick-test hint unlock thresholds
- **Hidden in production** - only visible on localhost

#### Code Architecture

```
src/
├── components/       # React components
│   ├── Timer.tsx           # Main timer with hints UI
│   ├── ProblemSolver.tsx   # Problem solving flow
│   ├── BlackBookForm.tsx   # Learning entry form
│   ├── WeeklyAnalysis.tsx  # AI analysis component
│   └── StatsView.tsx       # Statistics dashboard
├── hooks/
│   ├── useTimer.ts         # Timer logic with persistence
│   └── useLocalStorage.ts  # LocalStorage + DB sync
├── lib/
│   ├── llm.ts              # Centralized Gemini API client
│   ├── prompts.ts          # All LLM prompts in one place
│   ├── hints.ts            # Hint generation & caching
│   ├── devMode.ts          # Dev mode utilities
│   └── sounds.ts           # Timer settings & sounds
├── data/
│   ├── planData.ts         # 124-day study plan
│   └── problemData.ts      # Problem definitions
└── pages/
    └── Index.tsx           # Main app page
```

#### Key Utilities

| File | Purpose |
|------|---------|
| `lib/llm.ts` | Centralized Gemini API client with error handling |
| `lib/prompts.ts` | All LLM prompts for easy maintenance |
| `lib/hints.ts` | Hint generation with localStorage caching |
| `lib/devMode.ts` | Localhost detection & dev mode state |
| `hooks/useTimer.ts` | Timer with `setElapsedManually` for dev testing |

#### Running Locally

```bash
# Install dependencies
npm install

# Start dev server
vercel dev

# Build for production
npm run build
```

#### Environment Setup
- Add your **Gemini API key** in Settings to enable:
  - Weekly AI Analysis
  - Progressive Hints

---

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **Database**: Neon PostgreSQL (via API)
- **AI**: Google Gemini API
- **PWA**: Offline support with service worker

---

## License

MIT
