// Hints Service - Generates progressive hints using centralized LLM utilities

import { callGemini, parseJsonResponse, getApiKey } from './llm';
import { hintsPrompt, isValidHintsResponse, HintsResponse } from './prompts';

export interface HintData {
  hint1: string; // Gentle nudge (20 min)
  hint2: string; // Stronger hint (40 min)
  hint3: string; // Almost solution (60 min)
  generatedAt: number;
}

const CACHE_PREFIX = 'problem_hints_';

// Get cache key for a specific problem
export const getHintCacheKey = (problemId: string): string => {
  return `${CACHE_PREFIX}${problemId}`;
};

// Get cached hints from localStorage
export const getCachedHints = (problemId: string): HintData | null => {
  try {
    const cached = localStorage.getItem(getHintCacheKey(problemId));
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error('Failed to parse cached hints:', e);
  }
  return null;
};

// Cache hints to localStorage
export const cacheHints = (problemId: string, hints: HintData): void => {
  try {
    localStorage.setItem(getHintCacheKey(problemId), JSON.stringify(hints));
  } catch (e) {
    console.error('Failed to cache hints:', e);
  }
};

// Generate hints using centralized LLM client
export const generateHints = async (
  problemId: string,
  problemTitle: string,
  problemUrl: string,
  apiKey: string
): Promise<HintData> => {
  // Check cache first
  const cached = getCachedHints(problemId);
  if (cached) {
    return cached;
  }

  // Generate prompt using centralized prompts
  const prompt = hintsPrompt(problemTitle, problemUrl);
  
  // Call Gemini using centralized client
  const response = await callGemini(prompt, apiKey, {
    temperature: 0.7,
    maxOutputTokens: 1024
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to generate hints');
  }

  // Parse and validate response
  const parsed = parseJsonResponse<HintsResponse>(response.text);
  
  if (!isValidHintsResponse(parsed)) {
    throw new Error('Invalid hint format from LLM');
  }

  const hints: HintData = {
    hint1: parsed.hint1,
    hint2: parsed.hint2,
    hint3: parsed.hint3,
    generatedAt: Date.now()
  };

  // Cache the hints
  cacheHints(problemId, hints);

  return hints;
};

// Check which hints are unlocked based on elapsed time
export const getUnlockedHints = (elapsedSeconds: number, hints: HintData | null): {
  hint1Unlocked: boolean;
  hint2Unlocked: boolean;
  hint3Unlocked: boolean;
} => {
  return {
    hint1Unlocked: hints !== null && elapsedSeconds >= HINT1_UNLOCK_TIME,
    hint2Unlocked: hints !== null && elapsedSeconds >= HINT2_UNLOCK_TIME,
    hint3Unlocked: hints !== null && elapsedSeconds >= HINT3_UNLOCK_TIME,
  };
};

// Time thresholds
export const HINT_FETCH_TIME = 15 * 60; // 15 minutes - fetch hints
export const HINT1_UNLOCK_TIME = 20 * 60; // 20 minutes
export const HINT2_UNLOCK_TIME = 40 * 60; // 40 minutes
export const HINT3_UNLOCK_TIME = 60 * 60; // 60 minutes
