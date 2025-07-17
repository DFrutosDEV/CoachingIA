export interface AIConfig {
  provider: 'ollama' | 'openai' | 'anthropic' | 'google';
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export const getAIConfig = (): AIConfig => {
  const environment = process.env.NODE_ENV;
  const provider = process.env.AI_PROVIDER as AIConfig['provider'] || 'ollama';

  // Configuración por defecto para desarrollo (Ollama)
  const defaultConfig: AIConfig = {
    provider: 'ollama',
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: 'llama3.1:8b',
    temperature: 0.7,
    maxTokens: 1000
  };

  // Configuración para producción (APIs en la nube)
  const productionConfigs: Record<string, AIConfig> = {
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
      model: 'gemini-pro',
      temperature: 0.7,
      maxTokens: 1000
    }
  };

  // En desarrollo, usar Ollama por defecto
  if (environment === 'development') {
    return defaultConfig;
  }

  // En producción, usar el proveedor configurado o fallback a OpenAI
  if (environment === 'production') {
    const config = productionConfigs[provider];
    if (config && config.apiKey) {
      return config;
    }
    
    // Fallback a OpenAI si no hay configuración válida
    console.warn(`Proveedor ${provider} no configurado, usando OpenAI como fallback`);
    return productionConfigs.openai;
  }

  return defaultConfig;
};

export const isOllamaAvailable = async (): Promise<boolean> => {
  try {
    const config = getAIConfig();
    if (config.provider !== 'ollama') return false;

    const response = await fetch(`${config.baseUrl}/api/tags`);
    return response.ok;
  } catch {
    return false;
  }
};

export const shouldUseOllama = (): boolean => {
  const environment = process.env.NODE_ENV;
  const forceProvider = process.env.AI_PROVIDER;
  
  // En desarrollo, usar Ollama si está disponible
  if (environment === 'development' && !forceProvider) {
    return true;
  }
  
  // Si se fuerza un proveedor específico, respetarlo
  if (forceProvider && forceProvider !== 'ollama') {
    return false;
  }
  
  return false;
}; 