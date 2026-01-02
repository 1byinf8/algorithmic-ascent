// Centralized LLM Client Utility
// Handles all Gemini API interactions

export interface LLMConfig {
  temperature?: number;
  maxOutputTokens?: number;
}

export interface LLMResponse {
  text: string;
  success: boolean;
  error?: string;
}

// Default model - consistent across all LLM calls
const DEFAULT_MODEL = 'gemini-2.5-flash';

// Safety settings for all requests
const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
];

/**
 * Get the stored Gemini API key from localStorage
 */
export const getApiKey = (): string | null => {
  return localStorage.getItem('gemini_api_key');
};

/**
 * Validate API key format
 */
export const isValidApiKey = (key: string): boolean => {
  return key.trim().length > 0 && key.startsWith('AIza');
};

/**
 * Save API key to localStorage
 */
export const saveApiKey = (key: string): boolean => {
  if (!isValidApiKey(key)) {
    return false;
  }
  localStorage.setItem('gemini_api_key', key);
  return true;
};

/**
 * Clean JSON response from LLM - handles markdown code blocks and extracts JSON object
 * This is a tested and robust function from WeeklyAnalysis
 */
export const cleanJsonResponse = (text: string): string => {
  let jsonText = text.trim();

  // Remove markdown code blocks (handle various formats)
  if (jsonText.includes('```')) {
    // Remove ```json or ``` at start
    jsonText = jsonText.replace(/^```(?:json)?\s*\n?/i, '');
    // Remove ``` at end
    jsonText = jsonText.replace(/\n?```\s*$/i, '');
  }

  jsonText = jsonText.trim();

  // If still not valid JSON, try to extract the JSON object
  if (!jsonText.startsWith('{')) {
    const match = jsonText.match(/\{[\s\S]*\}/);
    if (match) {
      jsonText = match[0];
    }
  }

  return jsonText;
};

/**
 * Parse JSON response with cleaning
 */
export const parseJsonResponse = <T>(text: string): T => {
  const cleanedJson = cleanJsonResponse(text);
  return JSON.parse(cleanedJson);
};

/**
 * Call Gemini API with a prompt
 */
export const callGemini = async (
  prompt: string,
  apiKey: string,
  config: LLMConfig = {}
): Promise<LLMResponse> => {
  const { temperature = 0.7, maxOutputTokens = 2048 } = config;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature,
            maxOutputTokens,
          },
          safetySettings: SAFETY_SETTINGS
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || errorData?.error?.status || '';
      const detailedError = errorMessage ? ` - ${errorMessage}` : '';

      if (response.status === 400) {
        throw new Error(`Invalid request${detailedError}`);
      } else if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid API key. Please check your Gemini API key.');
      } else if (response.status === 429) {
        throw new Error(`Rate limit exceeded. Please wait a minute before trying again.${detailedError}`);
      } else if (response.status === 404) {
        throw new Error(`Model not found${detailedError}. Ensure '${DEFAULT_MODEL}' is available.`);
      } else {
        throw new Error(`API error (${response.status})${detailedError}`);
      }
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      const finishReason = data.candidates?.[0]?.finishReason;
      if (finishReason === 'SAFETY') {
        throw new Error('Response blocked by safety filters. Please try again.');
      }
      throw new Error('No response from Gemini. Please try again.');
    }

    return {
      text,
      success: true
    };
  } catch (err) {
    return {
      text: '',
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
};
