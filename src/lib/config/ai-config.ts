export interface AIConfig {
  provider: 'google' | 'openai' | 'anthropic';
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export const getAIConfig = (): AIConfig => {
  const provider = process.env.AI_PROVIDER as AIConfig['provider'] || 'google';

  // Configuración por defecto para Gemini
  const defaultConfig: AIConfig = {
    provider: 'google',
    apiKey: process.env.GOOGLE_AI_API_KEY,
    model: 'gemini-1.5-pro',
    temperature: 0.7,
    maxTokens: 1000
  };

  // Configuración para otros proveedores
  const providerConfigs: Record<string, AIConfig> = {
    openai: {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000
    },
    anthropic: {
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: 'claude-3-sonnet-20240229',
      temperature: 0.7,
      maxTokens: 1000
    },
    google: {
      provider: 'google',
      apiKey: process.env.GOOGLE_AI_API_KEY,
      model: 'gemini-1.5-pro',
      temperature: 0.7,
      maxTokens: 1000
    }
  };

  // Usar el proveedor configurado o fallback a Google
  const config = providerConfigs[provider];
  if (config && config.apiKey) {
    return config;
  }
  
  // Fallback a Google si no hay configuración válida
  console.warn(`Proveedor ${provider} no configurado, usando Google Gemini como fallback`);
  return defaultConfig;
};

export const isGeminiAvailable = async (): Promise<boolean> => {
  try {
    const config = getAIConfig();
    if (config.provider !== 'google' || !config.apiKey) return false;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent`, {
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
  const forceProvider = process.env.AI_PROVIDER;
  
  // Usar Gemini por defecto
  if (!forceProvider || forceProvider === 'google') {
    return true;
  }
  
  return false;
}; 