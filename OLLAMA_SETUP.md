# Configuración de Ollama para Generación Automática de Objetivos

## ¿Qué es Ollama?

Ollama es una herramienta gratuita que te permite ejecutar modelos de IA localmente en tu computadora. Para este proyecto, lo usamos para generar objetivos automáticamente basándose en las métricas del cliente.

## Ventajas de Ollama

- ✅ **Completamente gratuito**
- ✅ **Funciona offline** (sin conexión a internet)
- ✅ **Privacidad total** (los datos no salen de tu computadora)
- ✅ **Rápido** (no hay latencia de red)
- ✅ **Personalizable** (puedes ajustar los parámetros)

## Instalación

### 1. Descargar Ollama

Ve a [ollama.ai](https://ollama.ai) y descarga la versión para tu sistema operativo:
- **Windows**: Descarga el instalador .exe
- **macOS**: Descarga el archivo .dmg
- **Linux**: Usa el comando curl proporcionado en el sitio

### 2. Instalar Ollama

1. Ejecuta el instalador descargado
2. Sigue las instrucciones del asistente de instalación
3. Ollama se ejecutará automáticamente como servicio

### 3. Descargar el Modelo

Abre una terminal o línea de comandos y ejecuta:

```bash
ollama pull llama3.1:8b
```

Este comando descargará el modelo Llama 3.1 8B (aproximadamente 4.7GB).

### 4. Verificar la Instalación

Ejecuta este comando para verificar que todo funciona:

```bash
ollama list
```

Deberías ver algo como:
```
NAME           ID     SIZE   MODIFIED
llama3.1:8b    abc123 4.7GB  2 hours ago
```

## Configuración en la Aplicación

### Variables de Entorno

Si Ollama no está ejecutándose en el puerto por defecto (11434), puedes configurar la URL:

```env
# .env.local
OLLAMA_BASE_URL=http://localhost:11434
```

### Verificar Conexión

Una vez instalado, puedes verificar que Ollama está funcionando visitando:
- `http://localhost:11434/api/tags` (debería mostrar los modelos disponibles)

## Uso en la Aplicación

### 1. Generar Objetivos Automáticamente

1. Ve al detalle de un cliente
2. Haz clic en "Generar Objetivos con IA"
3. Selecciona el número de objetivos a generar
4. Haz clic en "Generar objetivos"
5. Revisa los objetivos generados
6. Haz clic en "Aceptar Objetivos"

### 2. Personalizar la Generación

El sistema considera las siguientes métricas para generar objetivos:

- **Enfoque del cliente** (focus)
- **Biografía del cliente**
- **Objetivos anteriores**
- **Número de sesiones completadas**
- **Calificación promedio**
- **Notas del coach**

## Modelos Alternativos

Si quieres probar otros modelos, puedes descargarlos:

```bash
# Modelo más pequeño (más rápido, menos preciso)
ollama pull llama3.1:3b

# Modelo más grande (más lento, más preciso)
ollama pull llama3.1:70b

# Modelo especializado en español
ollama pull llama3.1:8b-instruct-q4_0
```

Para cambiar el modelo, edita el archivo `src/lib/services/ai-service.ts`:

```typescript
model: 'llama3.1:8b', // Cambia por el modelo que prefieras
```

## Solución de Problemas

### Ollama no se conecta

1. Verifica que Ollama esté ejecutándose:
   ```bash
   ollama serve
   ```

2. Verifica el puerto:
   ```bash
   curl http://localhost:11434/api/tags
   ```

3. Reinicia Ollama:
   ```bash
   # Windows
   net stop ollama
   net start ollama
   
   # macOS/Linux
   sudo systemctl restart ollama
   ```

### Error de memoria

Si tienes poca RAM, usa un modelo más pequeño:

```bash
ollama pull llama3.1:3b
```

### Generación lenta

1. Usa un modelo más pequeño
2. Reduce el número de objetivos a generar
3. Ajusta los parámetros en `ai-service.ts`:
   ```typescript
   options: {
     temperature: 0.5, // Menor = más rápido
     top_p: 0.8,
     max_tokens: 500 // Menor = más rápido
   }
   ```

## Estructura de Datos

### Prompt de Entrada

El sistema envía un prompt estructurado que incluye:

```
OBJETIVO PRINCIPAL: [título del objetivo]
ENFOQUE DEL CLIENTE: [focus del cliente]
BIOGRAFÍA: [bio del cliente]
MÉTRICAS ACTUALES:
- Sesiones completadas: [número]
- Calificación promedio: [rating]
- Última sesión: [fecha]
OBJETIVOS ANTERIORES: [lista de objetivos previos]
NOTAS DEL COACH: [notas del coach]
```

### Respuesta Esperada

El modelo debe responder con JSON estructurado:

```json
[
  {
    "description": "Descripción del objetivo específico y medible",
    "day": "lunes",
    "isCompleted": false
  }
]
```

## Personalización Avanzada

### Ajustar el Prompt

Puedes modificar el prompt en `src/lib/services/ai-service.ts` para:

- Cambiar el tono de los objetivos
- Agregar más contexto
- Incluir métricas adicionales
- Modificar el formato de respuesta

### Agregar Nuevos Modelos

1. Descarga el modelo:
   ```bash
   ollama pull [nombre-del-modelo]
   ```

2. Actualiza el servicio:
   ```typescript
   model: '[nombre-del-modelo]',
   ```

3. Ajusta los parámetros según el modelo

## Recursos Adicionales

- [Documentación oficial de Ollama](https://ollama.ai/docs)
- [Modelos disponibles](https://ollama.ai/library)
- [Guía de prompts](https://ollama.ai/docs/prompts)
- [Optimización de rendimiento](https://ollama.ai/docs/performance)

## Soporte

Si tienes problemas:

1. Verifica que Ollama esté instalado correctamente
2. Revisa los logs de la aplicación
3. Verifica la conexión a `localhost:11434`
4. Asegúrate de que el modelo esté descargado

Para más ayuda, consulta la documentación oficial de Ollama o los logs de la aplicación. 