// Centralized Prompts for LLM Calls
// Keep all prompts in one place for easy maintenance

import { BlackBookEntry } from '@/types';

/**
 * Generate prompt for weekly analysis
 */
export const weeklyAnalysisPrompt = (entriesData: Array<{
  problem: string;
  pattern: string;
  timeSpent: string;
  solvedWithoutEditorial: boolean;
  keyObservation: string;
  mistake: string;
}>): string => {
  return `You are an expert competitive programming coach analyzing a student's weekly performance.

**This Week's Problems Solved:**
${JSON.stringify(entriesData, null, 2)}

**Analysis Required:**
1. Identify 2-3 weak areas/patterns where the student struggled or needed editorials
2. Highlight 2-3 strengths (patterns solved independently, good time management)
3. Provide 3-4 actionable suggestions for improvement
4. Give overall insights on their learning trajectory

**CRITICAL: Response Format**
Respond with ONLY a valid JSON object. Do NOT include any markdown formatting, code blocks, or backticks. Just the raw JSON:
{
  "weakAreas": ["area1", "area2"],
  "strengths": ["strength1", "strength2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "insights": "2-3 sentence summary of overall performance"
}

Be specific, constructive, and encouraging. Focus on DSA concepts and problem-solving strategies.`;
};

/**
 * Generate prompt for progressive hints
 */
export const hintsPrompt = (problemTitle: string, problemUrl: string): string => {
  return `You are a competitive programming coach. A student is working on a problem and may need hints.

**Problem:** ${problemTitle}
**URL:** ${problemUrl}

Generate 3 progressive hints for this problem. The hints should help the student without giving away the solution too quickly.

**IMPORTANT:** 
- Hint 1: A gentle nudge - point them in the right direction without revealing the approach
- Hint 2: A stronger hint - suggest the technique/pattern but don't explain the full solution
- Hint 3: Almost the solution - explain the approach clearly but let them implement it

**CRITICAL: Response Format**
Respond with ONLY a valid JSON object. No markdown, no code blocks, just raw JSON:
{
  "hint1": "First hint here...",
  "hint2": "Second hint here...",
  "hint3": "Third hint here..."
}

Keep each hint concise (2-3 sentences max). Be helpful and encouraging.`;
};

/**
 * Expected response type for weekly analysis
 */
export interface WeeklyAnalysisResponse {
  weakAreas: string[];
  strengths: string[];
  suggestions: string[];
  insights: string;
}

/**
 * Expected response type for hints
 */
export interface HintsResponse {
  hint1: string;
  hint2: string;
  hint3: string;
}

/**
 * Validate weekly analysis response
 */
export const isValidWeeklyAnalysisResponse = (data: any): data is WeeklyAnalysisResponse => {
  return (
    data &&
    Array.isArray(data.weakAreas) &&
    Array.isArray(data.strengths) &&
    Array.isArray(data.suggestions) &&
    typeof data.insights === 'string'
  );
};

/**
 * Validate hints response
 */
export const isValidHintsResponse = (data: any): data is HintsResponse => {
  return (
    data &&
    typeof data.hint1 === 'string' &&
    typeof data.hint2 === 'string' &&
    typeof data.hint3 === 'string'
  );
};
