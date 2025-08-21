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

export class AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_AI_API_KEY || '';
    // Usar el modelo gemini-1.5-pro que está disponible
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';
  }

  async generateGoalsForObjective(
    objective: Objective,
    metrics: AIMetrics,
    numberOfGoals: number = 5
  ): Promise<GeneratedGoal[]> {
    try {
      if (!this.apiKey) {
        throw new Error('API Key de Google AI no configurada');
      }

      const prompt = this.buildPrompt(objective, metrics, numberOfGoals);
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
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
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 1000
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error en la API de Gemini: ${response.statusText} - ${errorData}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Respuesta inválida de Gemini');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      
      return this.parseGeneratedGoals(generatedText, numberOfGoals);
    } catch (error) {
      console.error('Error generando objetivos con IA:', error);
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
    5. Incluye un día sugerido para cada objetivo (lunes, martes, miércoles, etc.)
    
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

  // Método para verificar si Gemini está disponible
  async checkGeminiStatus(): Promise<boolean> {
    try {
      if (!this.apiKey) {
        return false;
      }

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
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

      return response.ok;
    } catch (error) {
      console.error('Gemini no está disponible:', error);
      return false;
    }
  }
}

export const aiService = new AIService(); 