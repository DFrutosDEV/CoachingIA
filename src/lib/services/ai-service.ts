import { Objective } from '@/types';
import { getAIConfig, AIConfig } from '@/lib/config/ai-config';

interface AIMetrics {
  clientBio?: string;
  configFile?: ConfigFile[];
  coachNotes?: string[];
  locale?: string;
  pdaContent?: {
    fileName: string;
    content: string;
    mimeType: string;
  };
  aiConfig?: {
    voiceTone?: string;
    difficultyLevel?: string;
    challengeTypes?: string;
    includeWeekends?: boolean;
    pdaFileId?: string;
  };
}

interface ConfigFile {
  question: string;
  answer: string;
}

interface GeneratedGoal {
  description: string;
  day: string;
  aforism: string;
  tiempoEstimado: string;
  ejemplo: string;
  indicadorExito: string;
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
        throw new Error(
          `API Key de ${this.config.provider === 'deepseek' ? 'DeepSeek' : 'Google Gemini'} no configurada`
        );
      }

      const prompt = this.buildPrompt(objective, metrics, numberOfGoals);
      console.log('Prompt:', prompt);

      let response: Response;
      if (this.config.provider === 'deepseek') {
        response = await this.callDeepSeekAPI(prompt);
      } else {
        response = await this.callGeminiAPI(prompt);
      }

      console.log('📡 Respuesta recibida:');
      console.log('Status:', response.status);
      console.log('OK:', response.ok);
      console.log('StatusText:', response.statusText);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Error completo de Gemini API:');
        console.error('Status:', response.status, response.statusText);
        console.error('URL:', response.url);
        console.error('Error Body:', errorData);
        try {
          const errorJson = JSON.parse(errorData);
          console.error('Error JSON:', JSON.stringify(errorJson, null, 2));
        } catch (e) {
          console.error('Error como texto:', errorData);
        }
        throw new Error(
          `Error en la API de ${this.config.provider === 'deepseek' ? 'DeepSeek' : 'Google Gemini'}: ${response.statusText} - ${errorData}`
        );
      }

      const data = await response.json();
      const generatedText = this.extractTextFromResponse(data);

      return this.parseGeneratedGoals(generatedText, numberOfGoals);
    } catch (error) {
      console.error(
        `❌ Error generando objetivos con ${this.config.provider}:`
      );
      console.error('Error completo:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw new Error('No se pudieron generar objetivos automáticamente');
    }
  }

  private buildPrompt(
    objective: Objective,
    metrics: AIMetrics,
    numberOfGoals: number
  ): string {
    // Preparar información adicional del PDA si existe
    let pdaSection = '';
    if (metrics.pdaContent) {
      pdaSection = `
    DOCUMENTO PDA ADICIONAL:
    Archivo: ${metrics.pdaContent.fileName}
    Tipo: ${metrics.pdaContent.mimeType}
    Contenido:
    ${metrics.pdaContent.content}
    
    IMPORTANTE: Usa la información del PDA para personalizar aún más los objetivos al perfil del cliente.
`;
    }

    return `Eres un coach profesional experto en desarrollo personal y profesional. 
    
    Necesito que generes ${numberOfGoals} objetivos específicos y medibles para un cliente basándote en la siguiente información:

    OBJETIVO PRINCIPAL: ${objective.title}
    
    BIOGRAFÍA: ${metrics.clientBio || 'No disponible'}
    
    MÉTRICAS ACTUALES:
    - Formulario de configuración: ${metrics.configFile?.map(f => `${f.question}: ${f.answer}`).join(', ') || 'No disponible'}
    
    NOTAS DEL COACH: ${metrics.coachNotes?.join(', ') || 'No hay notas'}
    ${pdaSection}    
    
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
        "aforism": "Un aforismo motivacional relacionado con el objetivo (máx 200 caracteres)",
        "tiempoEstimado": "Tiempo estimado en minutos o formato legible (ej: '15 min', '30 minutos')",
        "ejemplo": "Ejemplo práctico y concreto de cómo aplicar el objetivo",
        "indicadorExito": "Criterio claro para medir si el objetivo se completó exitosamente",
        "isCompleted": false
      }
    ]

    IMPORTANTE: 
    - El aforism debe ser inspirador y relacionado con el objetivo
    - El tiempoEstimado debe ser realista y específico
    - El ejemplo debe ser concreto y accionable
    - El indicadorExito debe ser medible y claro
    
    IDIOMA: ${this.getLanguageName(metrics.locale || 'es')}
    
    CRÍTICO: Responde TODO (description, aforism, tiempoEstimado, ejemplo, indicadorExito, day) en ${this.getLanguageName(metrics.locale || 'es')}. Nunca mezcles idiomas.
    
    Responde SOLO con el JSON, sin texto adicional.`;
  }

  private parseGeneratedGoals(
    generatedText: string,
    expectedCount: number
  ): GeneratedGoal[] {
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
        aforism: goal.aforism || '',
        tiempoEstimado: goal.tiempoEstimado || '',
        ejemplo: goal.ejemplo || '',
        indicadorExito: goal.indicadorExito || '',
        isCompleted: goal.isCompleted || false,
      }));

      return validGoals;
    } catch (error) {
      console.error('Error parseando objetivos generados:', error);
      // Retornar objetivos por defecto si falla el parsing
      return this.generateDefaultGoals(expectedCount);
    }
  }

  private generateDefaultGoals(count: number): GeneratedGoal[] {
    const days = [
      'lunes',
      'martes',
      'miércoles',
      'jueves',
      'viernes',
      'sábado',
      'domingo',
    ];
    const defaultGoals = [
      'Revisar progreso semanal y establecer prioridades',
      'Practicar técnicas de gestión del tiempo',
      'Desarrollar habilidades de comunicación',
      'Establecer metas específicas para la semana',
      'Evaluar resultados y ajustar estrategias',
    ];

    return Array.from({ length: count }, (_, index) => ({
      description: defaultGoals[index] || `Objetivo ${index + 1}`,
      day: days[index % days.length],
      aforism: 'El éxito es la suma de pequeños esfuerzos repetidos día tras día.',
      tiempoEstimado: '30 min',
      ejemplo: 'Aplica este objetivo en tu rutina diaria para ver resultados.',
      indicadorExito: 'Completaste todas las tareas relacionadas con este objetivo.',
      isCompleted: false,
    }));
  }

  private async callDeepSeekAPI(prompt: string): Promise<Response> {
    return fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      }),
    });
  }

  private async callGeminiAPI(prompt: string): Promise<Response> {
    // Usar el modelo configurado en lugar de hardcodearlo
    const model = this.config.model || 'gemini-1.5-flash';
    const baseUrl = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`;
    const url = `${baseUrl}?key=${this.config.apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: this.config.temperature,
        topP: 0.9,
        maxOutputTokens: this.config.maxTokens,
      },
    };

    console.log('🔍 Llamando a Gemini API:');
    console.log('Modelo:', model);
    console.log('URL (sin key):', baseUrl);
    console.log('Body (primeros 200 chars del prompt):', {
      ...requestBody,
      contents: [
        {
          parts: [
            {
              text: prompt.substring(0, 200) + '...',
            },
          ],
        },
      ],
    });

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
  }

  private extractTextFromResponse(data: any): string {
    if (this.config.provider === 'deepseek') {
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Respuesta inválida de DeepSeek');
      }
      return data.choices[0].message.content;
    } else {
      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content
      ) {
        throw new Error('Respuesta inválida de Google Gemini');
      }
      return data.candidates[0].content.parts[0].text;
    }
  }

  // Función auxiliar para obtener el nombre del idioma
  private getLanguageName(locale: string): string {
    const languageMap: Record<string, string> = {
      'es': 'Español',
      'en': 'English',
      'it': 'Italiano',
      'fr': 'Français',
    };
    return languageMap[locale] || 'Español';
  }

  // Método para verificar si el AI está disponible
  async checkAIStatus(): Promise<{
    available: boolean;
    provider: string;
    message: string;
    environment: string;
  }> {
    try {
      if (!this.config.apiKey) {
        return {
          available: false,
          provider:
            this.config.provider === 'deepseek' ? 'DeepSeek' : 'Google Gemini',
          message: `API Key de ${this.config.provider === 'deepseek' ? 'DeepSeek' : 'Google Gemini'} no configurada`,
          environment: process.env.NODE_ENV || 'unknown',
        };
      }

      let response: Response;

      if (this.config.provider === 'deepseek') {
        response = await fetch(`${this.config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: [
              {
                role: 'user',
                content: 'Hola, responde solo con "OK"',
              },
            ],
            max_tokens: 10,
          }),
        });
      } else {
        const model = this.config.model || 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${this.config.apiKey}`;
        console.log('🔍 checkAIStatus - Llamando a Gemini API:');
        console.log('Modelo:', model);
        console.log('URL (sin key):', `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=...`);

        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: 'Hola, responde solo con "OK"',
                  },
                ],
              },
            ],
            generationConfig: {
              maxOutputTokens: 10,
            },
          }),
        });
      }

      console.log('📡 checkAIStatus - Respuesta recibida:');
      console.log('Status:', response.status);
      console.log('OK:', response.ok);
      console.log('StatusText:', response.statusText);
      console.log('URL:', response.url);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Error en checkAIStatus:');
        console.error('Status:', response.status, response.statusText);
        console.error('Error Body:', errorData);
        try {
          const errorJson = JSON.parse(errorData);
          console.error('Error JSON:', JSON.stringify(errorJson, null, 2));
        } catch (e) {
          console.error('Error como texto:', errorData);
        }
      }

      return {
        available: response.ok,
        provider:
          this.config.provider === 'deepseek' ? 'DeepSeek' : 'Google Gemini',
        message: response.ok
          ? `${this.config.provider === 'deepseek' ? 'DeepSeek' : 'Google Gemini'} conectado correctamente`
          : `Error ${response.status}: ${response.statusText}`,
        environment: process.env.NODE_ENV || 'unknown',
      };
    } catch (error) {
      console.error(
        `${this.config.provider === 'deepseek' ? 'DeepSeek' : 'Google Gemini'} no está disponible:`,
        error
      );
      return {
        available: false,
        provider:
          this.config.provider === 'deepseek' ? 'DeepSeek' : 'Google Gemini',
        message: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        environment: process.env.NODE_ENV || 'unknown',
      };
    }
  }
}

export const aiService = new AIService();
