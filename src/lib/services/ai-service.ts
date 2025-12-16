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
  date: string;
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

      // Si son muchos objetivos (más de 15), dividir en múltiples llamadas
      const GOALS_PER_BATCH = 12; // Número seguro de objetivos por llamada

      if (numberOfGoals > GOALS_PER_BATCH) {
        console.log(`🔵 Dividiendo generación en múltiples lotes: ${numberOfGoals} objetivos en lotes de ${GOALS_PER_BATCH}`);
        const allGoals: GeneratedGoal[] = [];
        const batches = Math.ceil(numberOfGoals / GOALS_PER_BATCH);

        for (let i = 0; i < batches; i++) {
          const goalsInThisBatch = Math.min(GOALS_PER_BATCH, numberOfGoals - allGoals.length);
          const batchNumber = i + 1;

          console.log(`🔵 Generando lote ${batchNumber}/${batches} (${goalsInThisBatch} objetivos)...`);

          // Calcular el rango de fechas para este lote
          const startDateObj = new Date(objective.startDate);
          const daysPerGoal = 30 / numberOfGoals; // Distribución de días
          const startDayOffset = allGoals.length * daysPerGoal; // Días desde el inicio para este lote
          const endDayOffset = (allGoals.length + goalsInThisBatch) * daysPerGoal; // Días hasta el final del lote

          const batchStartDate = new Date(startDateObj);
          batchStartDate.setDate(batchStartDate.getDate() + Math.floor(startDayOffset));

          const batchEndDate = new Date(startDateObj);
          batchEndDate.setDate(batchEndDate.getDate() + Math.ceil(endDayOffset));

          const batchStartDateStr = batchStartDate.toISOString().split('T')[0];
          const batchEndDateStr = batchEndDate.toISOString().split('T')[0];

          // Crear métricas específicas para este lote
          const batchMetrics: AIMetrics = {
            ...metrics,
            // Indicar en las notas que es parte de un lote mayor y el rango de fechas
            coachNotes: [
              ...(metrics.coachNotes || []),
              `Lote ${batchNumber} de ${batches} - Objetivos ${allGoals.length + 1} a ${allGoals.length + goalsInThisBatch} de ${numberOfGoals} totales. Rango de fechas: ${batchStartDateStr} a ${batchEndDateStr}`
            ]
          };

          const prompt = this.buildPrompt(
            objective,
            batchMetrics,
            goalsInThisBatch,
            batchStartDateStr,
            batchEndDateStr,
            allGoals.length + 1,
            numberOfGoals
          );

          let response: Response;
          if (this.config.provider === 'deepseek') {
            response = await this.callDeepSeekAPI(prompt);
          } else {
            response = await this.callGeminiAPI(prompt);
          }

          if (!response.ok) {
            const errorData = await response.text();
            console.error(`❌ Error en lote ${batchNumber}:`, errorData);
            throw new Error(
              `Error en la API de ${this.config.provider === 'deepseek' ? 'DeepSeek' : 'Google Gemini'} en lote ${batchNumber}: ${response.statusText}`
            );
          }

          const data = await response.json();
          const generatedText = this.extractTextFromResponse(data);
          const batchGoals = this.parseGeneratedGoals(generatedText, goalsInThisBatch);

          allGoals.push(...batchGoals);
          console.log(`✅ Lote ${batchNumber} completado: ${batchGoals.length} objetivos generados. Total acumulado: ${allGoals.length}/${numberOfGoals}`);

          // Pequeña pausa entre lotes para evitar rate limits
          if (i < batches - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        console.log(`✅ Generación completa: ${allGoals.length} objetivos en total`);
        return allGoals.slice(0, numberOfGoals); // Asegurar que no exceda el número solicitado
      }

      // Generación única para menos objetivos
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
      console.log('🔵 Respuesta completa de la API:', JSON.stringify(data, null, 2).substring(0, 1000));
      const generatedText = this.extractTextFromResponse(data);
      console.log('🔵 Texto extraído completo:', generatedText);

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
    numberOfGoals: number,
    batchStartDate?: string,
    batchEndDate?: string,
    goalStartIndex?: number,
    totalGoals?: number
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

    return `C - CONTEXTO

Eres el corazón palpitante del primer asistente virtual del mundo especializado en coaching profesional. Este sistema revolucionario apoya a coaches profesionales que trabajan en el ámbito empresarial y a coaches expertos que trabajan en life coaching, proporcionándoles una herramienta tecnológica avanzada para la creación de itinerarios de desarrollo personalizados de las habilidades blandas clásicas, además de las relacionadas con las competencias de comportamiento relativas a los "futures studies". Tu rol es crucial: debes transformar el coaching tradicional —hasta ahora desconectado de la tecnología— en una experiencia innovadora, estructurada y basada en datos objetivos. Operas dentro de una plataforma dedicada que sirve a miles de coaches profesionales en todo el mundo, con un enfoque particular en el territorio europeo (cumplimiento del GDPR). El sistema debe apoyar la toma de decisiones estratégicas de los coaches y acelerar el proceso de cambio de los coachees, sin reemplazar nunca al profesional humano, pero potenciando significativamente la eficacia a través de la inteligencia artificial.

R - ROL

Eres un Master Coach Digital con más de veinte años de experiencia en coaching ejecutivo, psicología del comportamiento y desarrollo organizativo.

Posees competencias profundas en:

Psicología del comportamiento: Conoces todas las principales teorías de la personalidad acreditadas científicamente (Big Five, DISC, Myers-Briggs, Eneagrama, PDA, Insights Discovery, Hogan Assessment, etc.).

Evaluaciones de comportamiento: Sabes interpretar cualquier documento de evaluación de comportamiento validado científicamente por universidades o empresas acreditadas.

Metodologías de coaching: Dominas enfoques sistémicos, cognitivo-conductuales y las mejores prácticas internacionales.

Personalización avanzada: Sobresales en la creación de itinerarios a medida basados en el contexto laboral, el rol, la experiencia y los objetivos específicos.

Cumplimiento normativo: Operas siempre respetando el GDPR y las normativas europeas sobre privacidad.

Tu estilo de comunicación es adaptable a las preferencias del coach, manteniendo siempre un enfoque profesional, empático y orientado a los resultados.

---

TAREA ACTUAL:

Necesito que generes ${numberOfGoals} objetivos específicos y medibles para un cliente basándote en la siguiente información:

OBJETIVO PRINCIPAL: ${objective.title}
FECHA DE INICIO DEL OBJETIVO: ${objective.startDate || 'No especificada'}

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
5. FECHAS CRÍTICAS: 
   - Fecha de inicio del objetivo: ${objective.startDate || 'la fecha actual'}
   ${batchStartDate && batchEndDate ? `- Estás generando los objetivos ${goalStartIndex || 1} a ${(goalStartIndex || 1) + numberOfGoals - 1} de ${totalGoals || numberOfGoals} totales
   - El rango de fechas para ESTOS ${numberOfGoals} objetivos debe estar entre ${batchStartDate} y ${batchEndDate}
   - Distribuye las fechas de manera uniforme dentro de este rango` : `- Debes generar las fechas para cada objetivo DISTRIBUYÉNDOLAS EN LOS PRÓXIMOS 30 DÍAS A PARTIR DE LA FECHA DE INICIO
   - El primer objetivo debe tener fecha igual o posterior a la fecha de inicio
   - Si generas ${numberOfGoals} objetivos, distribúyelos aproximadamente uno por día a lo largo de los 30 días siguientes a la fecha de inicio`}
   - Las fechas deben estar en formato YYYY-MM-DD y distribuirse de manera progresiva y lógica
6. NUNCA uses fechas anteriores a la fecha de inicio del objetivo (${objective.startDate || 'fecha actual'}) o fuera del rango especificado
7. Aplica tus conocimientos en psicología del comportamiento y metodologías de coaching para crear objetivos personalizados y efectivos

FORMATO DE RESPUESTA (JSON):
[
  {
    "description": "Descripción del objetivo específico y medible",
    "date": "Fecha para este objetivo (YYYY-MM-DD) - DEBE ser >= ${objective.startDate || 'fecha actual'} y <= 30 días después",
    "aforism": "Un aforismo motivacional relacionado con el objetivo (máx 200 caracteres)",
    "tiempoEstimado": "Tiempo estimado en minutos o formato legible (ej: '15 min', '30 minutos')",
    "ejemplo": "Ejemplo práctico y concreto de cómo aplicar el objetivo",
    "indicadorExito": "Criterio claro para medir si el objetivo se completó exitosamente",
  }
]

IMPORTANTE: 
- CRÍTICO: Todas las fechas deben ser >= ${objective.startDate || 'fecha actual'} y distribuirse en los próximos 30 días desde la fecha de inicio. NUNCA uses fechas del pasado o anteriores a la fecha de inicio.
- El aforism debe ser inspirador y relacionado con el objetivo
- El tiempoEstimado debe ser realista y específico
- El ejemplo debe ser concreto y accionable
- El indicadorExito debe ser medible y claro
- Distribuye las fechas de manera progresiva: si generas ${numberOfGoals} objetivos, distribúyelos equitativamente en el período de 30 días desde ${objective.startDate || 'la fecha actual'}
- Aplica tu experiencia como Master Coach Digital para crear objetivos que realmente impulsen el desarrollo del coachee

IDIOMA: ${this.getLanguageName(metrics.locale || 'es')}

CRÍTICO: Responde TODO (description, date, aforism, tiempoEstimado, ejemplo, indicadorExito) en ${this.getLanguageName(metrics.locale || 'es')}. Nunca mezcles idiomas.

Responde SOLO con el JSON, sin texto adicional.`;
  }

  private parseGeneratedGoals(
    generatedText: string,
    expectedCount: number
  ): GeneratedGoal[] {
    try {
      console.log('🔵 Texto generado recibido (primeros 1000 chars):', generatedText.substring(0, 1000));
      console.log('🔵 Texto generado recibido (últimos 500 chars):', generatedText.substring(Math.max(0, generatedText.length - 500)));

      // Limpiar el texto: remover bloques de código markdown (```json ... ```)
      let cleanedText = generatedText.trim();

      // Remover ```json al inicio si existe
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/i, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '');
      }

      // Remover ``` al final si existe
      if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.replace(/\s*```$/, '');
      }

      cleanedText = cleanedText.trim();
      console.log('🔵 Texto limpiado (primeros 500 chars):', cleanedText.substring(0, 500));

      // Intentar encontrar el JSON de diferentes formas
      let jsonString = '';

      // Método 1: Buscar el primer [ y el último ]
      const firstBracket = cleanedText.indexOf('[');
      const lastBracket = cleanedText.lastIndexOf(']');

      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        jsonString = cleanedText.substring(firstBracket, lastBracket + 1);
        console.log('🔵 JSON extraído método 1 - Longitud:', jsonString.length);
      } else if (firstBracket !== -1) {
        // JSON incompleto - el array no está cerrado
        let tempString = cleanedText.substring(firstBracket);

        // Contar llaves para verificar objetos completos
        const openBraces = (tempString.match(/\{/g) || []).length;
        const closeBraces = (tempString.match(/\}/g) || []).length;

        console.log('🔵 JSON incompleto detectado - Llaves abiertas:', openBraces, 'Cerradas:', closeBraces);

        // Si tenemos objetos completos pero falta el cierre del array
        if (openBraces === closeBraces && closeBraces > 0) {
          // Buscar el último } que cierra el último objeto
          const lastCloseBrace = tempString.lastIndexOf('}');
          if (lastCloseBrace !== -1) {
            // Verificar si el JSON es válido hasta este punto
            let validUntil = lastCloseBrace;

            // Buscar el último objeto completo válido
            // Esto significa encontrar el último } que está precedido por un string cerrado
            let foundValidObject = false;

            // Intentar parsear hasta cada } para encontrar el último objeto válido
            for (let i = closeBraces; i > 0; i--) {
              // Encontrar el i-ésimo } desde el final
              let currentBrace = -1;
              let braceCount = 0;
              for (let j = tempString.length - 1; j >= 0; j--) {
                if (tempString[j] === '}') {
                  braceCount++;
                  if (braceCount === i) {
                    currentBrace = j;
                    break;
                  }
                }
              }

              if (currentBrace !== -1) {
                // Intentar parsear hasta este punto (agregando el cierre del array)
                const testJson = tempString.substring(0, currentBrace + 1) + '\n]';
                try {
                  JSON.parse(testJson);
                  // Si llegamos aquí, este objeto es válido
                  validUntil = currentBrace;
                  foundValidObject = true;
                  console.log(`🔵 Objeto válido encontrado en posición ${i} (índice ${currentBrace})`);
                  break;
                } catch (e) {
                  // Este objeto no es válido, continuar con el anterior
                  continue;
                }
              }
            }

            if (foundValidObject) {
              jsonString = tempString.substring(0, validUntil + 1) + '\n]';
              console.log('🔵 JSON reparado - usando último objeto válido completo');
            } else {
              // Si no encontramos ningún objeto válido, intentar usar el último y cerrar strings abiertos
              // Buscar el último " que cierra un string antes del último }
              let lastQuote = tempString.lastIndexOf('"', lastCloseBrace);

              // Si encontramos una comilla, verificar si está balanceada
              if (lastQuote !== -1) {
                // Contar comillas antes del último }
                const quotesBefore = (tempString.substring(0, lastCloseBrace + 1).match(/"/g) || []).length;
                // Si es impar, hay un string sin cerrar
                if (quotesBefore % 2 !== 0) {
                  // Buscar el penúltimo objeto completo
                  let prevCloseBrace = tempString.lastIndexOf('}', lastCloseBrace - 1);
                  if (prevCloseBrace !== -1) {
                    jsonString = tempString.substring(0, prevCloseBrace + 1) + '\n]';
                    console.log('🔵 JSON reparado - removiendo último objeto con string incompleto');
                  } else {
                    // Cerrar el string manualmente
                    jsonString = tempString.substring(0, lastCloseBrace) + '"\n' + tempString.substring(lastCloseBrace) + '\n]';
                    console.log('🔵 JSON reparado - cerrando string incompleto manualmente');
                  }
                } else {
                  jsonString = tempString.substring(0, lastCloseBrace + 1) + '\n]';
                  console.log('🔵 JSON reparado - agregando ] después del último objeto');
                }
              } else {
                jsonString = tempString.substring(0, lastCloseBrace + 1) + '\n]';
                console.log('🔵 JSON reparado - agregando ] después del último objeto');
              }
            }
          } else {
            jsonString = tempString + ']';
            console.log('🔵 JSON reparado - agregando ] al final');
          }
        } else {
          // Intentar usar regex como fallback
          const jsonMatch = cleanedText.match(/\[[\s\S]*/);
          if (jsonMatch) {
            jsonString = jsonMatch[0] + ']';
            console.log('🔵 JSON reparado método regex');
          } else {
            console.error('❌ JSON incompleto o mal formado');
            throw new Error('JSON incompleto en la respuesta');
          }
        }
      } else {
        // Método 2: Usar regex para encontrar el array JSON
        const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
          console.log('🔵 JSON extraído método regex');
        } else {
          console.error('❌ No se encontró JSON válido en la respuesta');
          throw new Error('No se encontró JSON válido en la respuesta');
        }
      }

      console.log('🔵 JSON extraído (primeros 500 chars):', jsonString.substring(0, 500));
      console.log('🔵 JSON extraído (últimos 500 chars):', jsonString.substring(Math.max(0, jsonString.length - 500)));

      // Intentar parsear directamente
      try {
        const goals = JSON.parse(jsonString);

        // Validar que sea un array y tenga la estructura correcta
        if (!Array.isArray(goals)) {
          console.error('❌ La respuesta no es un array válido:', typeof goals);
          throw new Error('La respuesta no es un array válido');
        }

        console.log('✅ JSON parseado exitosamente, cantidad de objetivos:', goals.length);

        // Validar y limpiar cada objetivo
        const validGoals = goals.slice(0, expectedCount).map((goal, index) => ({
          description: goal.description || `Objetivo ${index + 1}`,
          date: goal.date || new Date().toISOString(),
          aforism: goal.aforism || '',
          tiempoEstimado: goal.tiempoEstimado || '',
          ejemplo: goal.ejemplo || '',
          indicadorExito: goal.indicadorExito || '',
          isCompleted: goal.isCompleted || false,
        }));

        return validGoals;
      } catch (parseError: any) {
        console.error('❌ Error parseando JSON:', parseError.message);

        // Si hay un error de string sin terminar, intentar repararlo
        if (parseError.message.includes('Unterminated string') || parseError.message.includes('position')) {
          const positionMatch = parseError.message.match(/position (\d+)/);
          if (positionMatch) {
            const position = parseInt(positionMatch[1]);
            console.error('❌ Error en posición:', position);

            // Intentar extraer objetos válidos manualmente
            // Buscar todos los patrones de objeto { ... } completos
            // Usar un enfoque más robusto: buscar desde el inicio y encontrar objetos balanceados
            let validObjects: any[] = [];
            let i = 0;
            let depth = 0;
            let inString = false;
            let escapeNext = false;
            let startIndex = -1;

            while (i < Math.min(position, jsonString.length)) {
              const char = jsonString[i];

              if (escapeNext) {
                escapeNext = false;
                i++;
                continue;
              }

              if (char === '\\') {
                escapeNext = true;
                i++;
                continue;
              }

              if (char === '"' && !escapeNext) {
                inString = !inString;
              }

              if (!inString) {
                if (char === '{') {
                  if (depth === 0) {
                    startIndex = i;
                  }
                  depth++;
                } else if (char === '}') {
                  depth--;
                  if (depth === 0 && startIndex !== -1) {
                    // Hemos encontrado un objeto completo
                    const objString = jsonString.substring(startIndex, i + 1);
                    try {
                      // Intentar parsear el objeto individual
                      const obj = JSON.parse(objString);

                      // Intentar construir un array con todos los objetos válidos hasta ahora más este nuevo
                      const testArrayString = '[' +
                        (validObjects.length > 0 ? validObjects.map(o => JSON.stringify(o)).join(',') + ',' : '') +
                        objString + ']';
                      JSON.parse(testArrayString);

                      // Si llegamos aquí, el objeto es válido y puede agregarse al array
                      validObjects.push(obj);
                      console.log(`✅ Objeto ${validObjects.length} válido (posición ${startIndex}-${i + 1})`);
                      startIndex = -1;
                    } catch (e) {
                      // Este objeto no es válido, detener aquí
                      console.log(`❌ Objeto incompleto detectado en posición ${startIndex}-${i + 1}, usando ${validObjects.length} objetos válidos`);
                      break;
                    }
                  }
                }
              }

              i++;
            }

            if (validObjects.length > 0) {
              console.log(`✅ Se encontraron ${validObjects.length} objetos válidos antes del error`);

              // Validar y limpiar cada objetivo
              const validGoals = validObjects.slice(0, expectedCount).map((goal, index) => ({
                description: goal.description || `Objetivo ${index + 1}`,
                date: goal.date || new Date().toISOString(),
                aforism: goal.aforism || '',
                tiempoEstimado: goal.tiempoEstimado || '',
                ejemplo: goal.ejemplo || '',
                indicadorExito: goal.indicadorExito || '',
                isCompleted: goal.isCompleted || false,
              }));

              return validGoals;
            }
          }

          // Mostrar contexto del error
          if (parseError.message.includes('position')) {
            const positionMatch = parseError.message.match(/position (\d+)/);
            if (positionMatch) {
              const position = parseInt(positionMatch[1]);
              const start = Math.max(0, position - 200);
              const end = Math.min(jsonString.length, position + 200);
              console.error('❌ Contexto alrededor del error (posición ' + position + '):');
              console.error('...' + jsonString.substring(start, position) + '>>>ERROR AQUÍ<<<' + jsonString.substring(position, end) + '...');
            }
          }
        }

        throw parseError;
      }
    } catch (error: any) {
      console.error('❌ Error general parseando objetivos generados:', error);
      throw error;
    }
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
