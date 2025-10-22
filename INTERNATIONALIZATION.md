# Internacionalización (i18n) con next-intl

## 🌍 Configuración Implementada

Tu aplicación ahora soporta múltiples idiomas usando **next-intl**. Los idiomas disponibles son:

- 🇪🇸 **Español (es)** - Idioma por defecto
- 🇬🇧 **Inglés (en)**
- 🇮🇹 **Italiano (it)**

## 📁 Estructura de Archivos

```
CoachingIA/
├── src/
│   ├── i18n.ts                          # Configuración de i18n
│   ├── locales/                         # Archivos de traducción
│   │   ├── es/
│   │   │   └── common.json             # Traducciones en español
│   │   ├── en/
│   │   │   └── common.json             # Traducciones en inglés
│   │   └── it/
│   │       └── common.json             # Traducciones en italiano
│   ├── app/
│   │   └── [locale]/                    # Páginas con soporte i18n
│   │       ├── layout.tsx              # Layout principal con provider
│   │       ├── page.tsx                # Página de inicio
│   │       ├── dashboard/              # Dashboard movido aquí
│   │       └── login/                  # Login
│   └── components/
│       └── ui/
│           └── language-switcher.tsx   # Selector de idioma
├── middleware.ts                        # Middleware con soporte i18n
└── next.config.js                       # Configuración de Next.js
```

## 🚀 Cómo Usar las Traducciones

### En Componentes de Cliente ('use client')

```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function MiComponente() {
  const t = useTranslations('homePage');
  
  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.description')}</p>
    </div>
  );
}
```

### En Componentes de Servidor

```tsx
import { useTranslations } from 'next-intl';

export default function MiComponente() {
  const t = useTranslations('homePage');
  
  return (
    <div>
      <h1>{t('hero.title')}</h1>
    </div>
  );
}
```

## 📝 Agregar Nuevas Traducciones

1. **Abre los archivos de traducción** en `src/locales/[idioma]/common.json`

2. **Agrega tu nuevo texto** siguiendo la estructura JSON:

```json
{
  "miSeccion": {
    "titulo": "Mi Título",
    "descripcion": "Mi descripción"
  }
}
```

3. **Usa la traducción** en tu componente:

```tsx
const t = useTranslations('miSeccion');
return <h1>{t('titulo')}</h1>;
```

## 🌐 Rutas con Idiomas

Todas las rutas ahora incluyen el prefijo del idioma:

- 🇪🇸 `https://tuapp.com/es/` - Español
- 🇬🇧 `https://tuapp.com/en/` - Inglés
- 🇮🇹 `https://tuapp.com/it/` - Italiano

El middleware redirige automáticamente a `/es/` si no hay idioma en la URL.

## 🎨 Selector de Idioma

Ya está implementado un componente `<LanguageSwitcher />` que:

- Muestra el idioma actual con bandera
- Permite cambiar de idioma desde un menú dropdown
- Mantiene la ruta actual al cambiar de idioma

### Usar el Selector

```tsx
import { LanguageSwitcher } from '@/components/ui/language-switcher';

export default function Header() {
  return (
    <header>
      <LanguageSwitcher />
    </header>
  );
}
```

## ➕ Agregar un Nuevo Idioma

1. **Actualiza la lista de idiomas** en `src/i18n.ts`:

```typescript
export const locales = ['es', 'en', 'it', 'fr'] as const; // Agregar 'fr'
```

2. **Crea el archivo de traducción** en `src/locales/fr/common.json`

3. **Copia la estructura** de otro idioma y traduce los textos

4. **Actualiza el selector** en `src/components/ui/language-switcher.tsx`:

```typescript
const languages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }, // Nuevo
];
```

5. **Actualiza el middleware** en `middleware.ts` (línea 46):

```typescript
const pathnameWithoutLocale = pathname.replace(/^\/(es|en|it|fr)/, '');
```

## 🔧 Configuración de Idioma por Defecto

Para cambiar el idioma por defecto, edita `src/i18n.ts`:

```typescript
export const defaultLocale: Locale = 'en'; // Cambiar a inglés
```

## 📚 Namespaces (Organización de Traducciones)

Puedes organizar tus traducciones en diferentes archivos:

```
src/locales/es/
  ├── common.json        # Traducciones comunes
  ├── dashboard.json     # Traducciones del dashboard
  └── auth.json          # Traducciones de autenticación
```

Luego actualiza `src/i18n.ts`:

```typescript
return {
  locale,
  messages: {
    ...((await import(`./locales/${locale}/common.json`)).default),
    dashboard: (await import(`./locales/${locale}/dashboard.json`)).default,
    auth: (await import(`./locales/${locale}/auth.json`)).default,
  },
};
```

## 🔄 Detección Automática de Idioma

El middleware ya detecta automáticamente el idioma del navegador del usuario y redirige a la versión apropiada.

## ⚠️ Notas Importantes

1. **Todas las páginas deben estar en** `src/app/[locale]/`
2. **Las rutas API no tienen prefijo** de idioma (`/api/...`)
3. **El middleware maneja automáticamente** las redirecciones de idioma
4. **Los archivos estáticos** (`/public/*`) no se ven afectados

## 🐛 Solución de Problemas

### Error: "locale" is missing

Asegúrate de que el layout retorne `locale` en la configuración:

```typescript
return {
  locale,
  messages: ...
};
```

### Las rutas no funcionan

Verifica que todas tus páginas estén en `src/app/[locale]/` y no en `src/app/`

### El selector no cambia el idioma

Asegúrate de que el componente sea 'use client' y use `useRouter` de `next/navigation`

## 📖 Recursos

- [Documentación de next-intl](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

---

¡Listo! Tu aplicación ahora soporta múltiples idiomas 🎉

