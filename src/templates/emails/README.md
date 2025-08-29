# Sistema de Emails - CoachingIA

Este sistema proporciona una solución completa para el envío de emails transaccionales y de marketing en la aplicación CoachingIA.

## 📁 Estructura del Proyecto

```
src/
├── types/
│   └── emailTypes.ts          # Enum de tipos de email e interfaces
├── utils/
│   ├── emailService.ts        # Servicio principal de emails
│   └── emailExamples.ts       # Ejemplos de uso
└── templates/
    └── emails/
        ├── base-template.html     # Template base
        ├── welcome.html           # Email de bienvenida
        ├── appointment-confirmation.html  # Confirmación de cita
        └── README.md              # Esta documentación
```

## 🚀 Configuración

### Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# Proveedor de email (resend, sendgrid, nodemailer)
EMAIL_PROVIDER=resend

# API Key del proveedor
EMAIL_API_KEY=tu_api_key_aqui

# Email remitente
FROM_EMAIL=info@coachingia.com
FROM_NAME=CoachingIA

# Configuración SMTP (solo para nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password
```

### Instalación de Dependencias

```bash
# Para Resend
npm install resend

# Para SendGrid
npm install @sendgrid/mail

# Para Nodemailer
npm install nodemailer
```

## 📧 Tipos de Email Disponibles

El sistema incluye los siguientes tipos de email:

- `WELCOME` - Email de bienvenida para nuevos usuarios
- `APPOINTMENT_CONFIRMATION` - Confirmación de citas
- `APPOINTMENT_REMINDER` - Recordatorio de citas
- `APPOINTMENT_CANCELLATION` - Cancelación de citas
- `PASSWORD_RESET` - Reset de contraseña
- `ACCOUNT_VERIFICATION` - Verificación de cuenta
- `NEWSLETTER` - Newsletter
- `COACHING_SESSION_FOLLOW_UP` - Seguimiento de sesiones
- `PAYMENT_CONFIRMATION` - Confirmación de pagos
- `PAYMENT_FAILED` - Fallo en pagos
- `COURSE_ENROLLMENT` - Inscripción a cursos
- `FEEDBACK_REQUEST` - Solicitud de feedback

## 💻 Uso Básico

### Envío de Email Simple

```typescript
import { sendEmail, EmailType } from '@/utils/emailService';

// Email de bienvenida
const result = await sendEmail('usuario@email.com', EmailType.WELCOME, {
  userName: 'Juan Pérez',
  dashboardUrl: 'https://coachingia.com/dashboard'
});

console.log(result); // { success: true, message: 'Email enviado exitosamente' }
```

### Envío Masivo

```typescript
import { sendBulkEmail, EmailType } from '@/utils/emailService';

const subscribers = ['user1@email.com', 'user2@email.com', 'user3@email.com'];

const result = await sendBulkEmail(subscribers, EmailType.NEWSLETTER, {
  newsletterTitle: 'Nuevas técnicas de coaching',
  newsletterContent: 'Contenido del newsletter...'
});

console.log(result);
// {
//   success: true,
//   sent: 3,
//   failed: 0,
//   errors: []
// }
```

## 🎨 Templates HTML

### Estructura de Template

Los templates usan variables con sintaxis `{{variable}}`:

```html
<h1>¡Hola {{userName}}!</h1>
<p>Tu cita está confirmada para el {{appointmentDate}} a las {{appointmentTime}}.</p>
```

### Variables Automáticas

Estas variables se llenan automáticamente en todos los templates:

- `{{companyName}}` - Nombre de la empresa
- `{{companyEmail}}` - Email de la empresa
- `{{companyPhone}}` - Teléfono de la empresa
- `{{companyAddress}}` - Dirección de la empresa
- `{{companyWebsite}}` - Sitio web
- `{{unsubscribeUrl}}` - URL para cancelar suscripción
- `{{privacyUrl}}` - URL de política de privacidad

### Variables Personalizadas

Puedes pasar variables personalizadas en el objeto `data`:

```typescript
await sendEmail(email, EmailType.APPOINTMENT_CONFIRMATION, {
  userName: 'María García',
  appointmentDate: '15 de Marzo, 2024',
  appointmentTime: '14:00',
  coachName: 'Dr. Carlos López',
  meetingLink: 'https://meet.google.com/abc-defg-hij'
});
```

## 🔧 Personalización

### Agregar Nuevo Tipo de Email

1. **Agregar al enum** en `src/types/emailTypes.ts`:

```typescript
export enum EmailType {
  // ... tipos existentes
  NEW_EMAIL_TYPE = 'new_email_type'
}
```

2. **Agregar template** en `src/utils/emailService.ts`:

```typescript
const EMAIL_TEMPLATES: Record<EmailType, string> = {
  // ... templates existentes
  [EmailType.NEW_EMAIL_TYPE]: 'new-email-type.html'
};

const EMAIL_SUBJECTS: Record<EmailType, string> = {
  // ... asuntos existentes
  [EmailType.NEW_EMAIL_TYPE]: 'Asunto del nuevo email'
};
```

3. **Crear template HTML** en `src/templates/emails/new-email-type.html`

### Cambiar Proveedor de Email

Simplemente cambia la variable de entorno:

```env
# Para Resend
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_123456789

# Para SendGrid
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=SG.123456789

# Para Nodemailer
EMAIL_PROVIDER=nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password
```

## 🧪 Testing

### Validar Configuración

```typescript
import { validateEmailConfig } from '@/utils/emailService';

const config = validateEmailConfig();
if (!config.valid) {
  console.error('Errores de configuración:', config.errors);
}
```

### Enviar Email de Prueba

```typescript
import { sendTestEmail } from '@/utils/emailExamples';

await sendTestEmail('tu-email@ejemplo.com');
```

## 📊 Monitoreo y Logs

El sistema registra automáticamente:

- ✅ Emails enviados exitosamente
- ❌ Errores de envío
- 📊 Estadísticas de envío masivo
- 🔧 Errores de configuración

## 🛡️ Seguridad

- Las API keys se manejan a través de variables de entorno
- Validación de emails antes del envío
- Manejo seguro de errores
- Logs sin información sensible

## 🔄 Migración

Si ya tienes un sistema de emails, puedes migrar gradualmente:

1. Configura el nuevo sistema en paralelo
2. Migra un tipo de email a la vez
3. Prueba exhaustivamente antes de cambiar completamente
4. Mantén el sistema anterior como fallback

## 📞 Soporte

Para problemas o preguntas:

1. Revisa los logs de la consola
2. Valida la configuración con `validateEmailConfig()`
3. Prueba con un email de test
4. Verifica la documentación del proveedor de email

## 🚀 Próximas Mejoras

- [ ] Plantillas de email en diferentes idiomas
- [ ] Sistema de cola para emails masivos
- [ ] Analytics de apertura y clics
- [ ] A/B testing de templates
- [ ] Integración con CRM
- [ ] Plantillas personalizables desde admin
