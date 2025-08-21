# Configuración de Gemini Pro en CoachingIA

## 🚀 Configuración Rápida

### 1. Obtener API Key de Google AI

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia la API Key generada

### 2. Configurar Variables de Entorno

Crea o edita tu archivo `.env.local` (o `.env`):

```env
# Configuración de IA
AI_PROVIDER=google
GOOGLE_AI_API_KEY=tu_api_key_aqui

# Otras variables necesarias
MONGODB_URI=mongodb://localhost:27017/coachingia
JWT_SECRET=tu_jwt_secret_aqui
NODE_ENV=development
```

### 3. Verificar Configuración

```bash
# Verificar variables de entorno
npm run check:env

# Verificar modelos disponibles
npm run list:gemini-models

# Verificar conexión con Gemini
npm run check:gemini
```

Si todo está correcto, verás:
```
✅ Gemini Pro está funcionando correctamente
🚀 Puedes usar la generación automática de objetivos
```

## 🔧 Uso en la Aplicación

### Generar Objetivos Automáticamente

1. Ve al dashboard de coach
2. Selecciona un cliente
3. Ve a la pestaña "Objetivos"
4. Haz clic en el botón "IA" 
5. Selecciona el número de objetivos
6. Haz clic en "Generar objetivos"

### Funcionalidades Disponibles

- ✅ Generación automática de objetivos personalizados
- ✅ Análisis del contexto del cliente
- ✅ Consideración del historial de objetivos
- ✅ Integración con métricas de rendimiento

## 📊 Límites y Costos

### Plan Gratuito
- **15 requests por minuto**
- **Sin costo mensual**
- **Requiere verificación con tarjeta**

### Plan de Pago
- **$0.001 por 1K tokens**
- **Sin límite de requests**
- **Solo pagas por lo que uses**

## 🐛 Solución de Problemas

### Error: "API Key no configurada"
```bash
# Verificar configuración
npm run check:env

# Asegúrate de que la variable esté en .env.local o .env
GOOGLE_AI_API_KEY=tu_api_key_aqui

# Reinicia la aplicación
npm run dev
```

### Error: "Cuota excedida" (429)
- **Normal en plan gratuito**: Límite de 15 requests/minuto
- **Solución**: Espera 1 minuto antes de hacer otra solicitud
- **Alternativa**: Actualiza a plan de pago para límites más altos

### Error: "Sin conexión"
- Verifica tu conexión a internet
- Asegúrate de que no haya firewall bloqueando
- Verifica que la API Key sea válida

### Respuestas de baja calidad
- Ajusta el prompt en `src/lib/services/ai-service.ts`
- Modifica `temperature` para más creatividad
- Agrega más contexto en el prompt

## 🔒 Seguridad

### Mejores Prácticas
- **Nunca** subas la API Key al repositorio
- **Rota** las API Keys regularmente
- **Monitorea** el uso para evitar costos inesperados
- **Usa** variables de entorno en producción

### Configuración de Producción
```env
# En producción, usa variables de entorno del servidor
GOOGLE_AI_API_KEY=tu_api_key_produccion
NODE_ENV=production
```

## 📈 Monitoreo

### Logs de la Aplicación
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
1. **Análisis de Sentimiento**: Evaluar estado emocional
2. **Recomendaciones Personalizadas**: Sugerir recursos
3. **Predicción de Progreso**: Estimar tiempo de completado
4. **Generación de Contenido**: Crear materiales de apoyo
5. **Análisis de Patrones**: Identificar tendencias

### Modelos Alternativos Disponibles
- **gemini-1.5-pro**: Modelo actual (recomendado)
- **gemini-1.5-flash**: Más rápido, menos preciso
- **gemini-2.0-flash**: Versión más nueva
- **gemini-2.5-pro**: Versión más avanzada

## 📞 Soporte

### Recursos Útiles
- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [Documentación de Gemini](https://ai.google.dev/docs)
- [Pricing de Google AI](https://ai.google.dev/pricing)
- [Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)

### Comandos de Verificación
```bash
# Verificar configuración
npm run check:env

# Listar modelos disponibles
npm run list:gemini-models

# Verificar conexión
npm run check:gemini

# Ver logs de la aplicación
npm run dev

# Verificar endpoint
curl http://localhost:3000/api/ai/generate-goals
```

## ✅ Estado Actual

**Configuración Completada:**
- ✅ API Key configurada correctamente
- ✅ Modelo `gemini-1.5-pro` seleccionado
- ✅ Servicio de IA actualizado
- ✅ Endpoints funcionando
- ✅ UI actualizada para Gemini

**Nota**: El error 429 (cuota excedida) es normal en el plan gratuito. La API está funcionando correctamente.

---

**Nota**: Esta configuración reemplaza completamente el uso de Ollama. Gemini Pro ofrece mejor calidad y no requiere instalación local.
