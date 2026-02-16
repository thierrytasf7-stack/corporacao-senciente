/**
 * OpenRouter API Client
 * Uses Arcee Trinity model for AI-powered insights
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'arcee-ai/trinity-large-preview:free';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  const res = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://diana.aios.local',
      'X-Title': 'AIOS Dashboard',
    },
    body: JSON.stringify({
      model: options?.model || DEFAULT_MODEL,
      messages,
      max_tokens: options?.maxTokens || 1024,
      temperature: options?.temperature ?? 0.3,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenRouter API error: ${res.status} ${res.statusText}`);
  }

  const data: OpenRouterResponse = await res.json();
  return data.choices[0]?.message?.content || '';
}

export function isOpenRouterConfigured(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}
