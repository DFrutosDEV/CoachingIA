import { Goal, Objective } from '@/types';
import { getAIConfig, AIConfig } from '@/lib/config/ai-config';

interface AIMetrics {
  clientBio?: string;
  configFile?: ConfigFile[];
  coachNotes?: string[];
}

interface ConfigFile {
  question: string;
  answer: string;
}

interface GeneratedGoal {
  description: string;
  day: string;
  isCompleted: boolean;
}

export class AIService {
  private config: AIConfig;

  constructor() {
    this.config = getAIConfig();
  }

  async generateGoalsForObjective(
    objective: Objective,
    metrics: AIMetrics,
    numberOfGoals: number = 5
  ): Promise<GeneratedGoal[]> {
    try {
      if (!this.config.apiKey) {
        throw new Error('API Key de Google Gemini no configurada');
      }

      const prompt = this.buildPrompt(objective, metrics, numberOfGoals);
      console.log("Prompt:", prompt);
      const response = await this.callGeminiAPI(prompt);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error en la API de Gemini: ${response.statusText} - ${errorData}`);
      }

      const data = await response.json();
      const generatedText = this.extractTextFromResponse(data);
      
      return this.parseGeneratedGoals(generatedText, numberOfGoals);
    } catch (error) {
      console.error('Error generando objetivos con Gemini:', error);
      throw new Error('No se pudieron generar objetivos automáticamente');
    }
  }

  private buildPrompt(objective: Objective, metrics: AIMetrics, numberOfGoals: number): string {
    return `Eres un coach profesional experto en desarrollo personal y profesional. 
    
    Necesito que generes ${numberOfGoals} objetivos específicos y medibles para un cliente basándote en la siguiente información:

    OBJETIVO PRINCIPAL: ${objective.title}
    
    BIOGRAFÍA: ${metrics.clientBio || 'No disponible'}
    
    MÉTRICAS ACTUALES:
    - Formulario de configuración: ${metrics.configFile?.map(f => `${f.question}: ${f.answer}`).join(', ') || 'No disponible'}
    
    NOTAS DEL COACH: ${metrics.coachNotes?.join(', ') || 'No hay notas'}
    
    INSTRUCCIONES:
    1. Genera ${numberOfGoals} objetivos específicos, medibles y alcanzables
    2. Cada objetivo debe estar relacionado con el objetivo principal y el formulario de configuración
    3. Considera el progreso actual del cliente
    4. Los objetivos deben ser realistas y motivadores
    5. Incluye un día sugerido para cada objetivo (lunes, martes, miércoles, etc.)
    
    FORMATO DE RESPUESTA (JSON):
    [
      {
        "description": "Descripción del objetivo específico y medible",
        "day": "lunes",
        "isCompleted": false
      }
    ]

    Responde con el idioma del cliente.
    
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

  private async callGeminiAPI(prompt: string): Promise<Response> {
    const baseUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
    
    return fetch(`${baseUrl}?key=${this.config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: this.config.temperature,
          topP: 0.9,
          maxOutputTokens: this.config.maxTokens
        }
      })
    });
  }

  private extractTextFromResponse(data: any): string {
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Respuesta inválida de Google Gemini');
    }
    return data.candidates[0].content.parts[0].text;
  }

  // Método para verificar si Gemini está disponible
  async checkGeminiStatus(): Promise<{ available: boolean; provider: string; message: string; environment: string }> {
    try {
      if (!this.config.apiKey) {
        return {
          available: false,
          provider: 'Google Gemini',
          message: 'API Key de Google Gemini no configurada',
          environment: process.env.NODE_ENV || 'unknown'
        };
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hola, responde solo con "OK"'
            }]
          }],
          generationConfig: {
            maxOutputTokens: 10
          }
        })
      });

      return {
        available: response.ok,
        provider: 'Google Gemini',
        message: response.ok ? 'Google Gemini conectado correctamente' : `Error ${response.status}: ${response.statusText}`,
        environment: process.env.NODE_ENV || 'unknown'
      };
    } catch (error) {
      console.error('Google Gemini no está disponible:', error);
      return {
        available: false,
        provider: 'Google Gemini',
        message: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        environment: process.env.NODE_ENV || 'unknown'
      };
    }
  }
}

export const aiService = new AIService(); 