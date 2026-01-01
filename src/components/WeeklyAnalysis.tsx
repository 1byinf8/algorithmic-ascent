import { useState, useEffect } from 'react';
import { BlackBookEntry } from '@/types';
import { BookOpen, Sparkles, AlertCircle, Loader2, Key, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeeklyAnalysisProps {
  entries: BlackBookEntry[];
  startDate: Date;
}

interface AnalysisResult {
  weakAreas: string[];
  strengths: string[];
  suggestions: string[];
  insights: string;
}

export const WeeklyAnalysis = ({ entries, startDate }: WeeklyAnalysisProps) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<'empty' | 'saved' | 'validating'>('empty');

  // Load saved API key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setApiKeyStatus('saved');
    }
  }, []);

  // Get this week's entries
  const getThisWeekEntries = () => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    return entries.filter(e => new Date(e.completedAt) >= weekStart);
  };

  const generatePrompt = (weekEntries: BlackBookEntry[]) => {
    const entriesData = weekEntries.map(e => ({
      problem: e.problem,
      pattern: e.typePattern,
      timeSpent: `${Math.floor(e.timeSpent / 60)}m`,
      solvedWithoutEditorial: e.solvedWithoutEditorial,
      keyObservation: e.keyObservation,
      mistake: e.mistakeIMade,
    }));

    return `You are an expert competitive programming coach analyzing a student's weekly performance.

**This Week's Problems Solved:**
${JSON.stringify(entriesData, null, 2)}

**Analysis Required:**
1. Identify 2-3 weak areas/patterns where the student struggled or needed editorials
2. Highlight 2-3 strengths (patterns solved independently, good time management)
3. Provide 3-4 actionable suggestions for improvement
4. Give overall insights on their learning trajectory

**Response Format (JSON only):**
{
  "weakAreas": ["area1", "area2"],
  "strengths": ["strength1", "strength2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "insights": "2-3 sentence summary of overall performance"
}

Be specific, constructive, and encouraging. Focus on DSA concepts and problem-solving strategies.`;
  };

  const validateAndSaveApiKey = (key: string) => {
    if (!key.trim()) {
      setApiKeyStatus('empty');
      return false;
    }

    // Basic validation - Gemini API keys start with "AIza"
    if (!key.startsWith('AIza')) {
      setError('Invalid API key format. Gemini API keys should start with "AIza"');
      return false;
    }

    localStorage.setItem('gemini_api_key', key);
    setApiKeyStatus('saved');
    setError(null);
    return true;
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    if (newKey.trim()) {
      setApiKeyStatus('validating');
      // Debounce validation
      setTimeout(() => validateAndSaveApiKey(newKey), 500);
    } else {
      setApiKeyStatus('empty');
    }
  };

  const analyzeWithGemini = async () => {
    if (!validateAndSaveApiKey(apiKey)) {
      setError('Please enter a valid Gemini API key');
      setShowApiKeyInput(true);
      return;
    }

    const weekEntries = getThisWeekEntries();
    if (weekEntries.length === 0) {
      setError('No problems solved this week. Complete some problems first!');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: generatePrompt(weekEntries) }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.error?.message || '';

        if (response.status === 400) {
          throw new Error('Invalid request. Please check your API key or try again.');
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid API key. Please check your Gemini API key and try again.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        } else {
          throw new Error(`API error (${response.status}): ${errorMessage || 'Unknown error'}`);
        }
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        // Check for safety/block reasons
        const finishReason = data.candidates?.[0]?.finishReason;
        if (finishReason === 'SAFETY') {
          throw new Error('Response blocked by safety filters. Please try again.');
        }
        throw new Error('No response from Gemini. Please try again.');
      }

      // Improved JSON extraction - handle markdown code blocks
      let jsonText = text;

      // Remove markdown code block wrapper if present
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      }

      // Extract JSON object
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Failed to parse response:', text);
        throw new Error('Invalid response format from Gemini. Please try again.');
      }

      try {
        const result = JSON.parse(jsonMatch[0]);

        // Validate required fields
        if (!result.weakAreas || !result.strengths || !result.suggestions || !result.insights) {
          throw new Error('Incomplete analysis response');
        }

        setAnalysis(result);
      } catch (parseErr) {
        console.error('JSON parse error:', parseErr, 'Text:', jsonMatch[0]);
        throw new Error('Failed to parse analysis. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      console.error('Gemini API error:', err);
      if (err instanceof Error && err.message.includes('API key')) {
        setShowApiKeyInput(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setApiKeyStatus('empty');
    setAnalysis(null);
  };

  const weekEntries = getThisWeekEntries();

  return (
    <div className="glass rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">AI Weekly Analysis</h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {weekEntries.length} problems this week
        </span>
      </div>

      {/* API Key Management */}
      {!analysis && (
        <div className="space-y-4 mb-4">
          {/* API Key Status Indicator */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">API Key Status:</span>
            </div>
            <div className="flex items-center gap-2">
              {apiKeyStatus === 'empty' && (
                <>
                  <X className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">Not configured</span>
                </>
              )}
              {apiKeyStatus === 'validating' && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-warning" />
                  <span className="text-sm text-warning">Validating...</span>
                </>
              )}
              {apiKeyStatus === 'saved' && (
                <>
                  <Check className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">Ready</span>
                </>
              )}
            </div>
          </div>

          {/* Toggle API Key Input */}
          <button
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Key className="w-4 h-4" />
            {showApiKeyInput ? 'Hide' : 'Configure'} API Key
          </button>

          {/* API Key Input */}
          {showApiKeyInput && (
            <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center justify-between">
                  Google Gemini API Key
                  {apiKey && (
                    <button
                      onClick={clearApiKey}
                      className="text-xs text-destructive hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  placeholder="AIza..."
                  className="input-field w-full"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Get your free API key from{' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
                <p className="text-xs text-muted-foreground">
                  Your API key is stored locally and never sent to our servers.
                </p>
              </div>

              {apiKeyStatus === 'saved' && (
                <div className="flex items-start gap-2 p-2 bg-success/10 border border-success/20 rounded text-xs text-success">
                  <Check className="w-3 h-3 mt-0.5" />
                  <span>API key saved successfully!</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Generate Button */}
      {!analysis && weekEntries.length > 0 && (
        <button
          onClick={analyzeWithGemini}
          disabled={isLoading || apiKeyStatus !== 'saved'}
          className={cn(
            "w-full btn-primary flex items-center justify-center gap-2",
            (isLoading || apiKeyStatus !== 'saved') && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {apiKeyStatus === 'saved' ? 'Generate Weekly Analysis' : 'Configure API Key First'}
            </>
          )}
        </button>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
          <span className="text-destructive">{error}</span>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Insights */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h3 className="font-semibold text-sm mb-2 text-primary">Overall Insights</h3>
            <p className="text-sm leading-relaxed">{analysis.insights}</p>
          </div>

          {/* Strengths */}
          <div>
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <span className="text-success">✓</span> Strengths
            </h3>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, i) => (
                <li key={i} className="text-sm flex items-start gap-2 p-2 rounded-lg bg-success/5">
                  <span className="text-success mt-0.5">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weak Areas */}
          <div>
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <span className="text-warning">⚠</span> Areas to Improve
            </h3>
            <ul className="space-y-2">
              {analysis.weakAreas.map((area, i) => (
                <li key={i} className="text-sm flex items-start gap-2 p-2 rounded-lg bg-warning/5">
                  <span className="text-warning mt-0.5">•</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Suggestions */}
          <div>
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Action Items
            </h3>
            <ul className="space-y-2">
              {analysis.suggestions.map((suggestion, i) => (
                <li key={i} className="text-sm flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                  <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Regenerate Button */}
          <button
            onClick={() => {
              setAnalysis(null);
              analyzeWithGemini();
            }}
            className="w-full btn-secondary text-sm"
          >
            Regenerate Analysis
          </button>
        </div>
      )}

      {/* No Entries Message */}
      {weekEntries.length === 0 && !analysis && (
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No problems solved this week yet.</p>
          <p className="text-xs mt-1">Complete some problems to get your AI analysis!</p>
        </div>
      )}
    </div>
  );
};