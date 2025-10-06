# Funcionalidades de IA en CoachingIA

## 🚀 Generación Automática de Objetivos

### ¿Qué hace?

El sistema utiliza **Google Gemini Pro** para generar objetivos automáticamente basándose en:

- **Objetivo principal** del cliente
- **Enfoque** (focus) del cliente
- **Biografía** y contexto personal
- **Historial** de objetivos anteriores
- **Métricas** de rendimiento (sesiones completadas, calificaciones)
- **Notas** del coach

### Ventajas

✅ **Ahorra tiempo**: Genera objetivos en segundos vs. minutos manualmente  
✅ **Consistencia**: Mantiene un estándar de calidad  
✅ **Personalización**: Se adapta al contexto específico del cliente  
✅ **Escalabilidad**: Puede manejar múltiples clientes simultáneamente  
✅ **Alta calidad**: Gemini Pro ofrece respuestas más precisas y contextuales  
✅ **Sin instalación local**: No requiere software adicional  
✅ **Gratuito**: Plan gratuito disponible con límites razonables

## 📁 Archivos Implementados

### Servicios de IA

- `src/lib/services/ai-service.ts` - Servicio principal de IA con Gemini
- `src/app/api/ai/generate-goals/route.ts` - API endpoint para generar objetivos

### Componentes de UI

- `src/components/ui/ai-goals-generator.tsx` - Modal para generar objetivos
- Integrado en `src/components/client-detail.tsx` - Botón "IA" en la pestaña de objetivos

### Utilidades

- `scripts/check-gemini.js` - Script para verificar configuración de Gemini
- `AI_FEATURES.md` - Esta documentación

## 🔧 Configuración Rápida

### 1. Obtener API Key de Google AI

```bash
# Ve a https://makersuite.google.com/app/apikey
# Crea una nueva API Key
# Copia la clave generada
```

### 2. Configurar Variable de Entorno

```bash
# En tu archivo .env.local
GOOGLE_AI_API_KEY=tu_api_key_aqui
```

### 3. Verificar Configuración

```bash
npm run check:gemini
```

### 4. Usar en la Aplicación

1. Ve al detalle de un cliente
2. Pestaña "Objetivos"
3. Haz clic en el botón "IA"
4. Selecciona número de objetivos
5. Haz clic en "Generar objetivos"

## 🎯 Cómo Funciona

### Flujo de Generación

1. **Recopilación de Datos**: El sistema recopila toda la información relevante del cliente
2. **Construcción del Prompt**: Se crea un prompt estructurado con el contexto
3. **Generación con IA**: Gemini Pro procesa el prompt y genera objetivos
4. **Validación**: Se valida y limpia la respuesta JSON
5. **Guardado**: Los objetivos se guardan en la base de datos

### Prompt de Ejemplo

```
Eres un coach profesional experto en desarrollo personal y profesional.

Necesito que generes 5 objetivos específicos y medibles para un cliente basándote en la siguiente información:

OBJETIVO PRINCIPAL: Mejorar la gestión del tiempo
ENFOQUE DEL CLIENTE: Productividad y organización
BIOGRAFÍA: Ejecutivo de marketing con 5 años de experiencia...
MÉTRICAS ACTUALES:
- Sesiones completadas: 3
- Calificación promedio: 4.2
- Última sesión: 2024-01-15
OBJETIVOS ANTERIORES: Establecer rutina matutina, Priorizar tareas importantes
NOTAS DEL COACH: Cliente muy motivado, necesita estructura clara

INSTRUCCIONES:
1. Genera 5 objetivos específicos, medibles y alcanzables
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
```

### Respuesta Esperada

```json
[
  {
    "description": "Implementar técnica Pomodoro durante 2 horas de trabajo diario",
    "day": "lunes",
    "isCompleted": false
  },
  {
    "description": "Crear lista de prioridades semanal cada domingo",
    "day": "domingo",
    "isCompleted": false
  },
  {
    "description": "Eliminar 30 minutos de distracciones digitales diarias",
    "day": "martes",
    "isCompleted": false
  }
]
```

## ⚙️ Personalización

### Ajustar Parámetros de IA

En `src/lib/services/ai-service.ts`:

```typescript
generationConfig: {
  temperature: 0.7,    // 0.0-1.0 (creatividad)
  topP: 0.9,          // 0.0-1.0 (diversidad)
  maxOutputTokens: 1000 // Máximo tokens de respuesta
}
```

### Modificar Prompt

Puedes personalizar el prompt en el método `buildPrompt()` para:

- Cambiar el tono de los objetivos
- Agregar más contexto
- Incluir métricas adicionales
- Modificar el formato de respuesta

## 🐛 Solución de Problemas

### API Key no configurada

```bash
# Verificar configuración
npm run check:gemini

# Asegúrate de tener la variable de entorno:
GOOGLE_AI_API_KEY=tu_api_key_aqui
```

### Error de cuota excedida (429)

- Verifica tu cuota en Google AI Studio
- Considera actualizar tu plan si es necesario
- Implementa rate limiting si es necesario

### Error de conexión

- Verifica tu conexión a internet
- Asegúrate de que no haya firewall bloqueando las conexiones
- Verifica que la API Key sea válida

### Objetivos de baja calidad

- Ajusta el prompt para ser más específico
- Aumenta `temperature` para más creatividad
- Agrega más contexto en el prompt

## 📊 Métricas y Monitoreo

### Logs de Generación

Los logs se guardan en la consola del servidor:

- Tiempo de generación
- Errores de parsing
- Fallbacks a objetivos por defecto

### Métricas de Uso

- Número de objetivos generados
- Tasa de éxito de generación
- Tiempo promedio de respuesta
- Uso de cuota de API

## 🔮 Futuras Mejoras

### Funcionalidades Planificadas

1. **Análisis de Sentimiento**: Evaluar el estado emocional del cliente
2. **Recomendaciones Personalizadas**: Sugerir recursos basados en objetivos
3. **Predicción de Progreso**: Estimar tiempo para completar objetivos
4. **Generación de Contenido**: Crear materiales de apoyo automáticamente
5. **Análisis de Patrones**: Identificar tendencias en el progreso

### Modelos Alternativos

- **Gemini Pro Vision**: Para análisis de contenido visual
- **Gemini Flash**: Para respuestas más rápidas

## 🤝 Contribuir

### Reportar Bugs

1. Verifica que la API Key esté configurada
2. Revisa los logs del servidor
3. Proporciona contexto del error

### Mejorar Prompts

1. Prueba diferentes enfoques
2. Documenta los cambios
3. Comparte resultados

### Agregar Funcionalidades

1. Prueba las nuevas características
2. Actualiza la documentación
3. Ajusta parámetros según sea necesario

## 📞 Soporte

Para problemas técnicos:

1. Revisa esta documentación
2. Ejecuta `npm run check:gemini`
3. Consulta los logs de la aplicación
4. Verifica la documentación oficial de Google AI

---

**Nota**: Esta funcionalidad utiliza exclusivamente Google Gemini Pro. Para uso en producción, asegúrate de configurar las cuotas y límites apropiados.
