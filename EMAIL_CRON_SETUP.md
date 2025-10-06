# 📧 Configuración de Emails Automáticos con Cron Jobs

## 🚀 Configuración Rápida

### 1. Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env.local` (desarrollo) y en Vercel (producción):

```env
# Configuración de Cron Jobs
CRON_SECRET=tu_secreto_super_seguro_aqui
CRON_INTERVAL_MINUTES=1

# Configuración de Email (ya existente)
EMAIL_PROVIDER=gmail
GMAIL_USER=tu_email@gmail.com
GMAIL_APP_PASSWORD=tu_app_password_de_gmail
EMAIL_FROM=CoachingIA <noreply@coachingia.com>
```

### 2. Generar CRON_SECRET

```bash
# Generar un secreto seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Configuración en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a Settings > Environment Variables
3. Agrega las variables:
   - `CRON_SECRET`: El secreto que generaste
   - `CRON_INTERVAL_MINUTES`: 1 (o el intervalo que prefieras)

## 📋 Uso del Sistema

### Programar un Email Individual

```typescript
// POST /api/emails/schedule
{
  "to": "usuario@ejemplo.com",
  "subject": "Recordatorio de sesión",
  "html": "<h1>Tu sesión es mañana</h1>",
  "sendDate": "2024-01-15T10:00:00.000Z",
  "maxRetries": 3
}
```

### Programar Múltiples Emails

```typescript
// POST /api/emails/schedule
[
  {
    to: 'usuario1@ejemplo.com',
    subject: 'Recordatorio 1',
    html: '<h1>Recordatorio 1</h1>',
    sendDate: '2024-01-15T10:00:00.000Z',
  },
  {
    to: 'usuario2@ejemplo.com',
    subject: 'Recordatorio 2',
    html: '<h1>Recordatorio 2</h1>',
    sendDate: '2024-01-15T11:00:00.000Z',
  },
];
```

### Obtener Estadísticas

```typescript
// GET /api/emails/schedule
// Respuesta:
{
  "success": true,
  "data": {
    "pending": 5,
    "sent": 150,
    "failed": 2,
    "total": 157,
    "upcoming24h": 3
  }
}
```

## 🔧 Funcionamiento del Cron Job

### Frecuencia de Ejecución

- **Desarrollo**: El cron job NO se ejecuta automáticamente
- **Producción**: Se ejecuta cada minuto según `vercel.json`
- **Configurable**: Cambia `CRON_INTERVAL_MINUTES` para ajustar el rango de tiempo

### Lógica de Procesamiento

1. **Rango de Tiempo**: El cron job busca emails con `sendDate` en el rango:
   - Desde: `ahora - CRON_INTERVAL_MINUTES`
   - Hasta: `ahora + CRON_INTERVAL_MINUTES`

2. **Procesamiento**:
   - Envía emails pendientes en el rango
   - Marca como enviados los exitosos
   - Reintenta los fallidos (máximo 3 intentos)
   - Marca como fallidos permanentes después de 3 intentos

3. **Seguridad**:
   - Requiere `CRON_SECRET` en el header Authorization
   - Formato: `Bearer tu_secreto`

## 📊 Modelo de Base de Datos

```typescript
interface Email {
  to: string; // Email destinatario
  subject: string; // Asunto del email
  html: string; // Contenido HTML
  createdAt: Date; // Fecha de creación
  sendDate: Date; // Fecha programada de envío
  status: 'pending' | 'sent' | 'failed';
  errorMessage?: string; // Mensaje de error si falla
  sentAt?: Date; // Fecha real de envío
  retryCount: number; // Número de reintentos
  maxRetries: number; // Máximo de reintentos (default: 3)
}
```

## 🛠️ Ejemplos de Uso en tu Aplicación

### Programar Email de Bienvenida

```typescript
import { scheduleEmail } from '@/lib/services/scheduled-email-service';

// Programar email de bienvenida para enviar en 1 hora
const welcomeDate = new Date();
welcomeDate.setHours(welcomeDate.getHours() + 1);

await scheduleEmail({
  to: 'nuevo@usuario.com',
  subject: '¡Bienvenido a CoachingIA!',
  html: '<h1>¡Gracias por registrarte!</h1>',
  sendDate: welcomeDate,
});
```

### Programar Recordatorio de Sesión

```typescript
// Programar recordatorio 1 día antes de la sesión
const reminderDate = new Date(sessionDate);
reminderDate.setDate(reminderDate.getDate() - 1);

await scheduleEmail({
  to: clientEmail,
  subject: 'Recordatorio: Tu sesión es mañana',
  html: `<h1>Hola ${clientName}</h1><p>Tu sesión con ${coachName} es mañana a las ${sessionTime}</p>`,
  sendDate: reminderDate,
});
```

## 🔍 Monitoreo y Debugging

### Verificar Estado del Cron Job

```bash
# Ver estadísticas
curl -X GET https://tu-app.vercel.app/api/emails/schedule

# Ver logs del cron job (en Vercel Dashboard)
# Ve a Functions > Cron Jobs
```

### Logs del Cron Job

El cron job genera logs detallados:

- 📧 Emails encontrados para procesar
- 📤 Progreso de envío
- ✅ Emails enviados exitosamente
- ❌ Emails fallidos
- 📊 Estadísticas finales

## ⚠️ Consideraciones Importantes

1. **Límites de Vercel**:
   - Cron jobs tienen timeout de 60 segundos
   - No uses intervalos menores a 1 minuto

2. **Límites de Gmail**:
   - Máximo 500 emails por día (cuenta gratuita)
   - Máximo 100 emails por hora

3. **Manejo de Errores**:
   - Los emails fallidos se reintentan automáticamente
   - Después de 3 intentos fallidos, se marcan como fallidos permanentes

4. **Seguridad**:
   - NUNCA expongas tu `CRON_SECRET`
   - Usa HTTPS en producción
   - Valida siempre los datos de entrada

## 🚨 Solución de Problemas

### Error: "No autorizado"

- Verifica que `CRON_SECRET` esté configurado correctamente
- Asegúrate de que el header Authorization sea correcto

### Emails no se envían

- Verifica la configuración de Gmail SMTP
- Revisa los logs del cron job en Vercel
- Verifica que `EMAIL_PROVIDER` esté configurado

### Cron job no se ejecuta

- Verifica que `vercel.json` esté en la raíz del proyecto
- Asegúrate de que el endpoint `/api/cron/send-scheduled-emails` exista
- Revisa que el proyecto esté desplegado correctamente en Vercel
