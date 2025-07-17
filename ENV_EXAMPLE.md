# Configuración de Variables de Entorno

## 📋 Variables Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Configuración de la base de datos
MONGODB_URI=mongodb://localhost:27017/coachingia

# Configuración de IA - Proveedor principal
AI_PROVIDER=ollama

# Ollama (desarrollo local)
OLLAMA_BASE_URL=http://localhost:11434

# Hugging Face (gratuito - 30K requests/mes)
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
HUGGINGFACE_MODEL=microsoft/DialoGPT-medium

# Google AI (gratuito - 15 requests/minuto)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# OpenAI (de pago - $5 crédito/mes)
OPENAI_API_KEY=your_openai_api_key_here

# Configuración del entorno
NODE_ENV=development
```

## 🔧 Configuraciones por Entorno

### Desarrollo Local
```env
NODE_ENV=development
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
```

### Producción con Hugging Face (Gratuito)
```env
NODE_ENV=production
AI_PROVIDER=huggingface
HUGGINGFACE_API_KEY=tu_api_key_aqui
HUGGINGFACE_MODEL=microsoft/DialoGPT-medium
```

### Producción con Google AI (Gratuito)
```env
NODE_ENV=production
AI_PROVIDER=google
GOOGLE_AI_API_KEY=tu_api_key_aqui
```

### Producción con OpenAI (De Pago)
```env
NODE_ENV=production
AI_PROVIDER=openai
OPENAI_API_KEY=tu_api_key_aqui
```

## 🚀 Cómo Obtener las API Keys

### Hugging Face (Gratuito)
1. Ve a [huggingface.co](https://huggingface.co)
2. Crea una cuenta gratuita
3. Ve a Settings > Access Tokens
4. Crea un nuevo token
5. Copia el token a `HUGGINGFACE_API_KEY`

### Google AI (Gratuito)
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Crea una nueva API key
4. Copia la key a `GOOGLE_AI_API_KEY`

### OpenAI (De Pago)
1. Ve a [platform.openai.com](https://platform.openai.com)
2. Crea una cuenta
3. Ve a API Keys
4. Crea una nueva API key
5. Copia la key a `OPENAI_API_KEY`

## 🔄 Cambiar de Proveedor

Para cambiar de proveedor, solo necesitas modificar la variable `AI_PROVIDER`:

```env
# Cambiar a Hugging Face
AI_PROVIDER=huggingface

# Cambiar a Google AI
AI_PROVIDER=google

# Cambiar a OpenAI
AI_PROVIDER=openai

# Volver a Ollama
AI_PROVIDER=ollama
```

## 🛡️ Seguridad

- **Nunca** subas el archivo `.env.local` al repositorio
- **Siempre** usa variables de entorno en producción
- **Rota** las API keys regularmente
- **Monitorea** el uso de las APIs para evitar costos inesperados

## 📊 Límites y Costos

| Proveedor | Límite Gratuito | Costo Adicional |
|-----------|----------------|-----------------|
| Ollama | Ilimitado | $0 |
| Hugging Face | 30K requests/mes | $0.06/1K requests |
| Google AI | 15 requests/min | $0.001/1K tokens |
| OpenAI | $5 crédito/mes | $0.002/1K tokens |

## 🔍 Verificar Configuración

Puedes verificar que todo esté configurado correctamente ejecutando:

```bash
npm run check:ollama
```

O visitando el endpoint de verificación:
```
GET /api/ai/generate-goals
``` 