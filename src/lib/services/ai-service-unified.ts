import { Goal, Objective } from '@/types';
import { getAIConfig, shouldUseOllama, isOllamaAvailable } from '@/lib/config/ai-config';

interface AIMetrics {
  clientFocus: string;
  clientBio?: string;
  currentGoals?: Goal[];
  performanceMetrics?: {
    sessionsCompleted: number;
    averageRating?: number;
    lastSessionDate?: string;
  };
  coachNotes?: string[];
}

interface GeneratedGoal {
  description: string;
  day: string;
  isCompleted: boolean;
}

interface AIProvider {
  name: string;
  generateGoals(prompt: string, numberOfGoals: number): Promise<GeneratedGoal[]>;
  checkStatus(): Promise<{ available: boolean; error?: string }>;
}

// Proveedor para Ollama (local)
class OllamaProvider implements AIProvider {
  name = 'Ollama';
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  }

  async generateGoals(prompt: string, numberOfGoals: number): Promise<GeneratedGoal[]> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1:8b',
        prompt,
        stream: false,
        options: { temperature: 0.7, top_p: 0.9, max_tokens: 1000 }
      })
    });

    if (!response.ok) {
      throw new Error(`Error en Ollama: ${response.statusText}`);
    }

    const data = await response.json();
    return this.parseGeneratedGoals(data.response, numberOfGoals);
  }

  async checkStatus(): Promise<{ available: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return { available: response.ok };
    } catch (error) {
      return { available: false, error: 'Ollama no está disponible' };
    }
  }

  private parseGeneratedGoals(generatedText: string, expectedCount: number): GeneratedGoal[] {
    try {
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('JSON no válido');

      const goals = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(goals)) throw new Error('No es un array válido');

      return goals.slice(0, expectedCount).map((goal, index) => ({
        description: goal.description || `Objetivo ${index + 1}`,
        day: goal.day || 'lunes',
        isCompleted: goal.isCompleted || false
      }));
    } catch (error) {
      return this.generateDefaultGoals(expectedCount);
    }
  }

  private generateDefaultGoals(count: number): GeneratedGoal[] {
    const days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    const defaultGoals = [
      'Revisar progreso semanal y establecer prioridades',
      'Practicar técnicas de gestión del tiempo',
      'Desarrollar habilidades de comunicación',
      'Establecer metas específicas para la semana',
      'Evaluar resultados y ajustar estrategias'
    ];

    return Array.from({ length: count }, (_, index) => ({
      description: defaultGoals[index] || `Objetivo ${index + 1}`,
      day: days[index % days.length],
      isCompleted: false
    }));
  }
}

// Proveedor para Hugging Face (gratuito)
class HuggingFaceProvider implements AIProvider {
  name = 'Hugging Face';
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY || '';
    this.model = process.env.HUGGINGFACE_MODEL || 'microsoft/DialoGPT-medium';
  }

  async generateGoals(prompt: string, numberOfGoals: number): Promise<GeneratedGoal[]> {
    const response = await fetch(`https://api-inference.huggingface.co/models/${this.model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 500,
          temperature: 0.7,
          do_sample: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Error en Hugging Face: ${response.statusText}`);
    }

    const data = await response.json();
    return this.parseGeneratedGoals(data[0]?.generated_text || '', numberOfGoals);
  }

  async checkStatus(): Promise<{ available: boolean; error?: string }> {
    if (!this.apiKey) {
      return { available: false, error: 'API key no configurada' };
    }

    try {
      const response = await fetch(`https://api-inference.huggingface.co/models/${this.model}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
        body: JSON.stringify({ inputs: 'test' })
      });
      
      return { available: response.ok };
    } catch (error) {
      return { available: false, error: 'Error de conexión' };
    }
  }

  private parseGeneratedGoals(generatedText: string, expectedCount: number): GeneratedGoal[] {
    // Implementar parsing específico para Hugging Face
    return this.generateDefaultGoals(expectedCount);
  }

  private generateDefaultGoals(count: number): GeneratedGoal[] {
    const days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    return Array.from({ length: count }, (_, index) => ({
      description: `Objetivo ${index + 1} generado por Hugging Face`,
      day: days[index % days.length],
      isCompleted: false
    }));
  }
}

// Proveedor para Google AI (gratuito con límites)
class GoogleAIProvider implements AIProvider {
  name = 'Google AI';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_AI_API_KEY || '';
  }

  async generateGoals(prompt: string, numberOfGoals: number): Promise<GeneratedGoal[]> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Error en Google AI: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    return this.parseGeneratedGoals(generatedText, numberOfGoals);
  }

  async checkStatus(): Promise<{ available: boolean; error?: string }> {
    if (!this.apiKey) {
      return { available: false, error: 'API key no configurada' };
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`);
      return { available: response.ok };
    } catch (error) {
      return { available: false, error: 'Error de conexión' };
    }
  }

  private parseGeneratedGoals(generatedText: string, expectedCount: number): GeneratedGoal[] {
    try {
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('JSON no válido');

      const goals = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(goals)) throw new Error('No es un array válido');

      return goals.slice(0, expectedCount).map((goal, index) => ({
        description: goal.description || `Objetivo ${index + 1}`,
        day: goal.day || 'lunes',
        isCompleted: goal.isCompleted || false
      }));
    } catch (error) {
      return this.generateDefaultGoals(expectedCount);
    }
  }

  private generateDefaultGoals(count: number): GeneratedGoal[] {
    const days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    return Array.from({ length: count }, (_, index) => ({
      description: `Objetivo ${index + 1} generado por Google AI`,
      day: days[index % days.length],
      isCompleted: false
    }));
  }
}

// Proveedor para OpenAI (de pago, pero fácil de cambiar)
class OpenAIProvider implements AIProvider {
  name = 'OpenAI';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
  }

  async generateGoals(prompt: string, numberOfGoals: number): Promise<GeneratedGoal[]> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Eres un coach profesional. Responde SOLO con JSON válido.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Error en OpenAI: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;
    return this.parseGeneratedGoals(generatedText, numberOfGoals);
  }

  async checkStatus(): Promise<{ available: boolean; error?: string }> {
    if (!this.apiKey) {
      return { available: false, error: 'API key no configurada' };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      return { available: response.ok };
    } catch (error) {
      return { available: false, error: 'Error de conexión' };
    }
  }

  private parseGeneratedGoals(generatedText: string, expectedCount: number): GeneratedGoal[] {
    try {
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('JSON no válido');

      const goals = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(goals)) throw new Error('No es un array válido');

      return goals.slice(0, expectedCount).map((goal, index) => ({
        description: goal.description || `Objetivo ${index + 1}`,
        day: goal.day || 'lunes',
        isCompleted: goal.isCompleted || false
      }));
    } catch (error) {
      return this.generateDefaultGoals(expectedCount);
    }
  }

  private generateDefaultGoals(count: number): GeneratedGoal[] {
    const days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    return Array.from({ length: count }, (_, index) => ({
      description: `Objetivo ${index + 1} generado por OpenAI`,
      day: days[index % days.length],
      isCompleted: false
    }));
  }
}

// Servicio unificado principal
export class AIServiceUnified {
  private providers: AIProvider[];
  private currentProvider: AIProvider | null = null;

  constructor() {
    this.providers = [
      new OllamaProvider(),
      new HuggingFaceProvider(),
      new GoogleAIProvider(),
      new OpenAIProvider()
    ];
  }

  async initialize(): Promise<void> {
    // En desarrollo, intentar usar Ollama primero
    if (shouldUseOllama()) {
      const ollamaAvailable = await isOllamaAvailable();
      if (ollamaAvailable) {
        this.currentProvider = this.providers.find(p => p.name === 'Ollama') || null;
        console.log('✅ Usando Ollama (desarrollo local)');
        return;
      }
    }

    // En producción o si Ollama no está disponible, usar el proveedor configurado
    const config = getAIConfig();
    const providerName = this.getProviderNameFromConfig(config.provider);
    
    this.currentProvider = this.providers.find(p => p.name === providerName) || null;
    
    if (this.currentProvider) {
      const status = await this.currentProvider.checkStatus();
      if (!status.available) {
        console.warn(`⚠️ ${providerName} no disponible: ${status.error}`);
        // Intentar con el siguiente proveedor disponible
        await this.fallbackToAvailableProvider();
      } else {
        console.log(`✅ Usando ${providerName}`);
      }
    }
  }

  private getProviderNameFromConfig(provider: string): string {
    const mapping: Record<string, string> = {
      'ollama': 'Ollama',
      'huggingface': 'Hugging Face',
      'google': 'Google AI',
      'openai': 'OpenAI'
    };
    return mapping[provider] || 'OpenAI';
  }

  private async fallbackToAvailableProvider(): Promise<void> {
    for (const provider of this.providers) {
      if (provider.name === 'Ollama') continue; // Saltar Ollama en producción
      
      const status = await provider.checkStatus();
      if (status.available) {
        this.currentProvider = provider;
        console.log(`✅ Fallback a ${provider.name}`);
        return;
      }
    }
    
    throw new Error('No hay proveedores de IA disponibles');
  }

  async generateGoalsForObjective(
    objective: Objective,
    metrics: AIMetrics,
    numberOfGoals: number = 5
  ): Promise<GeneratedGoal[]> {
    if (!this.currentProvider) {
      await this.initialize();
    }

    if (!this.currentProvider) {
      throw new Error('No hay proveedores de IA disponibles');
    }

    const prompt = this.buildPrompt(objective, metrics, numberOfGoals);
    
    try {
      return await this.currentProvider.generateGoals(prompt, numberOfGoals);
    } catch (error) {
      console.error(`Error con ${this.currentProvider.name}:`, error);
      
      // Intentar con otro proveedor como fallback
      await this.fallbackToAvailableProvider();
      if (this.currentProvider) {
        return await this.currentProvider.generateGoals(prompt, numberOfGoals);
      }
      
      throw new Error('No se pudieron generar objetivos automáticamente');
    }
  }

  private buildPrompt(objective: Objective, metrics: AIMetrics, numberOfGoals: number): string {
    return `Eres un coach profesional experto en desarrollo personal y profesional. 
    
    Necesito que generes ${numberOfGoals} objetivos específicos y medibles para un cliente basándote en la siguiente información:

    OBJETIVO PRINCIPAL: ${objective.title}
    
    ENFOQUE DEL CLIENTE: ${metrics.clientFocus}
    
    BIOGRAFÍA: ${metrics.clientBio || 'No disponible'}
    
    MÉTRICAS ACTUALES:
    - Sesiones completadas: ${metrics.performanceMetrics?.sessionsCompleted || 0}
    - Calificación promedio: ${metrics.performanceMetrics?.averageRating || 'No disponible'}
    - Última sesión: ${metrics.performanceMetrics?.lastSessionDate || 'No disponible'}
    
    OBJETIVOS ANTERIORES: ${metrics.currentGoals?.map(g => g.description).join(', ') || 'Ninguno'}
    
    NOTAS DEL COACH: ${metrics.coachNotes?.join(', ') || 'No hay notas'}
    
    INSTRUCCIONES:
    1. Genera ${numberOfGoals} objetivos específicos, medibles y alcanzables
    2. Cada objetivo debe estar relacionado con el objetivo principal
    3. Considera el progreso actual del cliente
    4. Los objetivos deben ser realistas y motivadores
    5. Incluye un día sugerido para cada objetivo
    
    FORMATO DE RESPUESTA (JSON):
    [
      {
        "description": "Descripción del objetivo específico y medible",
        "day": "lunes",
        "isCompleted": false
      }
    ]
    
    Responde SOLO con el JSON, sin texto adicional.`;
  }

  async getCurrentProvider(): Promise<{ name: string; available: boolean; error?: string }> {
    if (!this.currentProvider) {
      await this.initialize();
    }

    if (!this.currentProvider) {
      return { name: 'Ninguno', available: false, error: 'No hay proveedores disponibles' };
    }

    const status = await this.currentProvider.checkStatus();
    return {
      name: this.currentProvider.name,
      available: status.available,
      error: status.error
    };
  }

  async getAvailableProviders(): Promise<Array<{ name: string; available: boolean; error?: string }>> {
    const results = [];
    
    for (const provider of this.providers) {
      const status = await provider.checkStatus();
      results.push({
        name: provider.name,
        available: status.available,
        error: status.error
      });
    }
    
    return results;
  }
}

export const aiService = new AIServiceUnified(); 