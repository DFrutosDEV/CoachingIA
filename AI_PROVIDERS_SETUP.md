# Configuración de Proveedores de IA

Este proyecto soporta múltiples proveedores de IA para generar objetivos automáticamente. Actualmente soporta **Google Gemini** y **DeepSeek**.

## Variables de Entorno

### Variable Principal
- `AI_PROVIDER`: Define qué proveedor usar (`google` o `deepseek`)

### Variables por Proveedor

#### Google Gemini
- `GOOGLE_AI_API_KEY`: Tu API key de Google AI Studio

#### DeepSeek
- `DEEPSEEK_API_KEY`: Tu API key de DeepSeek

## Configuración

### 1. Google Gemini (Recomendado para desarrollo)

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una nueva API Key
3. Agrega en tu archivo `.env.local`:

```env
AI_PROVIDER=google
GOOGLE_AI_API_KEY=tu_api_key_aqui
```

### 2. DeepSeek (Alternativa)

1. Ve a [DeepSeek Platform](https://platform.deepseek.com/)
2. Crea una cuenta y obtén tu API key
3. Agrega en tu archivo `.env.local`:

```env
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=tu_api_key_aqui
```

## Ejemplos de Configuración

### Desarrollo Local (Google Gemini)
```env
AI_PROVIDER=google
GOOGLE_AI_API_KEY=AIzaSyC...
```

### Producción (DeepSeek)
```env
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-...
```

### Sin IA (Fallback)
Si no configuras ninguna variable, el sistema usará objetivos por defecto.

## Verificación

Para verificar que tu configuración funciona:

1. Reinicia la aplicación después de cambiar las variables de entorno
2. Ve a la sección de objetivos
3. Intenta generar objetivos automáticamente
4. El sistema mostrará el estado de conexión del proveedor configurado

## Características por Proveedor

### Google Gemini
- ✅ Plan gratuito disponible
- ✅ API estable y bien documentada
- ✅ Soporte para múltiples idiomas
- ✅ Respuestas rápidas

### DeepSeek
- ✅ Modelo potente y actualizado
- ✅ Buena comprensión del contexto
- ✅ Soporte para múltiples idiomas
- ⚠️ Puede requerir plan de pago

## Solución de Problemas

### Error: "API Key no configurada"
- Verifica que la variable `AI_PROVIDER` esté configurada
- Verifica que la API key correspondiente esté configurada
- Reinicia la aplicación después de cambiar las variables

### Error: "Proveedor no disponible"
- Verifica que tu API key sea válida
- Verifica que tengas créditos disponibles (especialmente para DeepSeek)
- Revisa los logs del servidor para más detalles

### Cambio de Proveedor
Para cambiar de proveedor:
1. Actualiza `AI_PROVIDER` en `.env.local`
2. Configura la API key correspondiente
3. Reinicia la aplicación

## Notas Importantes

- **Hard Refresh**: Recuerda usar Ctrl+Shift+F5 para refrescar la página después de cambios de configuración
- **Variables de Entorno**: Las variables deben estar en `.env.local` para desarrollo local
- **Producción**: En producción, configura las variables en tu plataforma de hosting
- **Fallback**: Si ningún proveedor está disponible, el sistema usará objetivos predefinidos
