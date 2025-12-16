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
  // Modelos disponibles: gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash, gemini-2.5-flash
  // Nota: gemini-1.5-flash fue descontinuado, usar gemini-2.0-flash o gemini-2.5-flash para mejor rendimiento
  // maxTokens: Para 30 objetivos con múltiples campos, necesitamos al menos 8000 tokens
  return {
    provider: 'google',
    apiKey: process.env.GOOGLE_AI_API_KEY,
    model: process.env.GOOGLE_AI_MODEL || 'gemini-1.5-pro',
    temperature: 0.7,
    maxTokens: 10240, // Aumentado para manejar 30 objetivos completos
  };
};

export const shouldUseAI = (): boolean => {
  const provider = process.env.AI_PROVIDER || 'google';
  return provider === 'google' || provider === 'deepseek';
};

export const getCurrentProvider = (): string => {
  return process.env.AI_PROVIDER || 'google';
};
