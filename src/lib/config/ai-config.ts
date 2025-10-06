export interface AIConfig {
  provider: 'google' | 'deepseek';
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export const getAIConfig = (): AIConfig => {
  const provider = process.env.AI_PROVIDER || 'google';

  if (provider === 'deepseek') {
    return {
      provider: 'deepseek',
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      temperature: 0.7,
      maxTokens: 1000,
    };
  }

  // Configuración por defecto para Google Gemini
  return {
    provider: 'google',
    apiKey: process.env.GOOGLE_AI_API_KEY,
    model: 'gemini-1.5-flash',
    temperature: 0.7,
    maxTokens: 1000,
  };
};

export const isAIAvailable = async (): Promise<boolean> => {
  try {
    const config = getAIConfig();
    if (!config.apiKey) return false;

    if (config.provider === 'deepseek') {
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            {
              role: 'user',
              content: 'Hello World!',
            },
          ],
          max_tokens: 10,
        }),
      });

      return response.ok;
    } else {
      // Google Gemini
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': `${config.apiKey}`,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: 'Hello World!',
                  },
                ],
              },
            ],
            generationConfig: {
              maxOutputTokens: 10,
            },
          }),
        }
      );

      return response.ok;
    }
  } catch {
    return false;
  }
};

export const shouldUseAI = (): boolean => {
  const provider = process.env.AI_PROVIDER || 'google';
  return provider === 'google' || provider === 'deepseek';
};

export const getCurrentProvider = (): string => {
  return process.env.AI_PROVIDER || 'google';
};
