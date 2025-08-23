export interface AIConfig {
  provider: 'google';
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export const getAIConfig = (): AIConfig => {
  // Configuración exclusiva para Google Gemini
  const config: AIConfig = {
    provider: 'google',
    apiKey: process.env.GOOGLE_AI_API_KEY,
    model: 'gemini-1.5-flash', // Modelo más estable para plan gratuito
    temperature: 0.7,
    maxTokens: 1000
  };

  return config;
};

export const isGeminiAvailable = async (): Promise<boolean> => {
  try {
    const config = getAIConfig();
    if (!config.apiKey) return false;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': `${config.apiKey}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Hello World!'
          }]
        }],
        generationConfig: {
          maxOutputTokens: 10
        }
      })
    });
    
    return response.ok;
  } catch {
    return false;
  }
};

export const shouldUseGemini = (): boolean => {
  return true; // Siempre usar Gemini
}; 