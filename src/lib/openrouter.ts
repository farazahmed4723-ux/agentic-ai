import { db } from './db';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse<T = any> {
  success: boolean;
  content: string;
  data?: T;
  model: string;
  tokensUsed?: number;
  costUsd?: number;
  error?: string;
}

export async function callOpenRouter(
  messages: OpenRouterMessage[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: 'json_object' | 'text';
  }
): Promise<AIResponse> {
  const settings = db.getSettings();
  const apiKey = settings.openRouterApiKey || process.env.OPENROUTER_API_KEY;
  const model = options?.model || settings.openRouterModel || 'anthropic/claude-3.5-sonnet';

  if (!apiKey) {
    return {
      success: false,
      content: '',
      model,
      error: 'OpenRouter API Key is not configured. Please add it in Integrations / Settings.',
    };
  }

  try {
    const payload: any = {
      model,
      messages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 2500,
    };

    if (options?.responseFormat === 'json_object') {
      payload.response_format = { type: 'json_object' };
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://aibyfaraz.com',
        'X-Title': 'AI by Faraz - Agentic Lead Engine',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`OpenRouter request failed with ${response.status}: ${errText}. Attempting fallback...`);

      // Fallback model attempt if primary model has rate limit or issues
      if (model !== 'google/gemini-2.5-flash') {
        return await callOpenRouter(messages, {
          ...options,
          model: 'google/gemini-2.5-flash',
        });
      }

      return {
        success: false,
        content: '',
        model,
        error: `API error ${response.status}: ${errText}`,
      };
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '';
    const promptTokens = result.usage?.prompt_tokens || 0;
    const completionTokens = result.usage?.completion_tokens || 0;
    const totalTokens = promptTokens + completionTokens;

    // Approximate cost estimation (blended ~$3/1M input, $15/1M output for top tier)
    const costUsd = Number(((promptTokens * 0.000003) + (completionTokens * 0.000015)).toFixed(5));

    let parsedData: any = undefined;
    if (options?.responseFormat === 'json_object' || content.trim().startsWith('{') || content.trim().startsWith('[')) {
      try {
        // Strip markdown code fences if model enclosed in ```json ... ```
        const cleanJson = content
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();
        parsedData = JSON.parse(cleanJson);
      } catch (jsonErr) {
        // JSON parsing fallback
        parsedData = undefined;
      }
    }

    return {
      success: true,
      content,
      data: parsedData,
      model: result.model || model,
      tokensUsed: totalTokens,
      costUsd,
    };
  } catch (error: any) {
    console.error('OpenRouter client exception:', error);
    return {
      success: false,
      content: '',
      model,
      error: error.message || 'Unknown network error',
    };
  }
}
