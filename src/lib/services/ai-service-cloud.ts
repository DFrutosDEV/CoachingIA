import { Goal, Objective } from '@/types';

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

export class AIServiceCloud {
  private apiKey: string;
  private provider: 'openai' | 'anthropic' | 'google' | 'ollama';

  constructor() {
    this.apiKey = process.env.AI_API_KEY || '';
    this.provider = (process.env.AI_PROVIDER as any) || 'openai';
  }

  async generateGoalsForObjective(
    objective: Objective,
    metrics: AIMetrics,
    numberOfGoals: number = 5
  ): Promise<GeneratedGoal[]> {
    try {
      const prompt = this.buildPrompt(objective, metrics, numberOfGoals);
      
      switch (this.provider) {
        case 'openai':
          return await this.generateWithOpenAI(prompt, numberOfGoals);
        case 'anthropic':
          return await this.generateWithAnthropic(prompt, numberOfGoals);
        case 'google':
          return await this.generateWithGoogle(prompt, numberOfGoals);
        case 'ollama':
          return await this.generateWithOllama(prompt, numberOfGoals);
        default:
          throw new Error('Proveedor de IA no soportado');
      }
    } catch (error) {
      console.error('Error generando objetivos con IA:', error);
      throw new Error('No se pudieron generar objetivos automáticamente');
    }
  }

  private async generateWithOpenAI(prompt: string, numberOfGoals: number): Promise<GeneratedGoal[]> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Eres un coach profesional experto en desarrollo personal. Responde SOLO con JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Error en OpenAI API: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;
    
    return this.parseGeneratedGoals(generatedText, numberOfGoals);
  }

  private async generateWithAnthropic(prompt: string, numberOfGoals: number): Promise<GeneratedGoal[]> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Error en Anthropic API: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.content[0].text;
    
    return this.parseGeneratedGoals(generatedText, numberOfGoals);
  }

  private async generateWithGoogle(prompt: string, numberOfGoals: number): Promise<GeneratedGoal[]> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Error en Google AI API: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    return this.parseGeneratedGoals(generatedText, numberOfGoals);
  }

  private async generateWithOllama(prompt: string, numberOfGoals: number): Promise<GeneratedGoal[]> {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.1:8b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Error en Ollama API: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.response;
    
    return this.parseGeneratedGoals(generatedText, numberOfGoals);
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

  private parseGeneratedGoals(generatedText: string, expectedCount: number): GeneratedGoal[] {
    try {
      // Limpiar el texto para extraer solo el JSON
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No se encontró JSON válido en la respuesta');
      }

      const goals = JSON.parse(jsonMatch[0]);
      
      // Validar que sea un array y tenga la estructura correcta
      if (!Array.isArray(goals)) {
        throw new Error('La respuesta no es un array válido');
      }

      // Validar y limpiar cada objetivo
      const validGoals = goals.slice(0, expectedCount).map((goal, index) => ({
        description: goal.description || `Objetivo ${index + 1}`,
        day: goal.day || 'lunes',
        isCompleted: goal.isCompleted || false
      }));

      return validGoals;
    } catch (error) {
      console.error('Error parseando objetivos generados:', error);
      // Retornar objetivos por defecto si falla el parsing
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

  // Método para verificar el estado del proveedor
  async checkProviderStatus(): Promise<{
    available: boolean;
    provider: string;
    error?: string;
  }> {
    try {
      switch (this.provider) {
        case 'openai':
          return await this.checkOpenAIStatus();
        case 'anthropic':
          return await this.checkAnthropicStatus();
        case 'google':
          return await this.checkGoogleStatus();
        case 'ollama':
          return await this.checkOllamaStatus();
        default:
          return { available: false, provider: this.provider, error: 'Proveedor no soportado' };
      }
    } catch (error) {
      return { 
        available: false, 
        provider: this.provider, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  private async checkOpenAIStatus() {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    return {
      available: response.ok,
      provider: 'openai',
      error: response.ok ? undefined : 'API key inválida o error de conexión'
    };
  }

  private async checkAnthropicStatus() {
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: { 'x-api-key': this.apiKey }
    });
    return {
      available: response.ok,
      provider: 'anthropic',
      error: response.ok ? undefined : 'API key inválida o error de conexión'
    };
  }

  private async checkGoogleStatus() {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`);
    return {
      available: response.ok,
      provider: 'google',
      error: response.ok ? undefined : 'API key inválida o error de conexión'
    };
  }

  private async checkOllamaStatus() {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const response = await fetch(`${ollamaUrl}/api/tags`);
    return {
      available: response.ok,
      provider: 'ollama',
      error: response.ok ? undefined : 'Ollama no está disponible'
    };
  }
}

export const aiServiceCloud = new AIServiceCloud(); 