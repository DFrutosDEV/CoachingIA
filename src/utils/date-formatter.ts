/**
 * Utilidades para formatear fechas de forma centralizada
 * Soporta múltiples locales y formatos predefinidos
 */

export type Locale = 'es' | 'en' | 'it';

export type DateFormat =
  | 'full'           // Lunes, 15 de enero de 2024
  | 'long'           // 15 de enero de 2024
  | 'medium'         // 15 ene 2024
  | 'short'          // 15/1/2024
  | 'weekday-long'   // Lunes
  | 'weekday-short'  // Lun
  | 'month-long'     // enero
  | 'month-short'    // ene
  | 'time-12'        // 2:30 PM
  | 'time-24'        // 14:30
  | 'datetime-full'  // Lunes, 15 de enero de 2024 a las 14:30
  | 'datetime-short' // 15/1/2024 14:30
  | 'relative'       // hace 2 horas, hace 3 días, etc.
  | 'custom';

export interface CustomFormatOptions {
  weekday?: 'long' | 'short' | 'narrow';
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  hour12?: boolean;
  timeZone?: string;
}

export interface DateFormatterOptions {
  locale?: Locale;
  format?: DateFormat;
  customOptions?: CustomFormatOptions;
}

//! TODO: ARREGLAR ARCHIVO Y FUNCIONES PARA PODER ESTANDARIZAR LAS FECHAS
// Mapeo de locales a códigos de idioma completos
export const localeMap: Record<string, string> = {
  'es': 'es-ES',
  'en': 'en-US',
  'it': 'it-IT'
};

// Mapeo de locales a zonas horarias
const timezoneMap: Record<Locale, string> = {
  'es': 'Europe/Madrid',
  'en': 'America/New_York',
  'it': 'Europe/Rome',
};

// Configuraciones predefinidas para cada formato
const formatConfigs: Record<DateFormat, Intl.DateTimeFormatOptions> = {
  'full': {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  },
  'long': {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  },
  'medium': {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  },
  'short': {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  },
  'weekday-long': {
    weekday: 'long'
  },
  'weekday-short': {
    weekday: 'short'
  },
  'month-long': {
    month: 'long'
  },
  'month-short': {
    month: 'short'
  },
  'time-12': {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  },
  'time-24': {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  },
  'datetime-full': {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  },
  'datetime-short': {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  },
  'relative': {},
  'custom': {}
};

/**
 * Formatea una fecha según el locale y formato especificados
 */
export function formatDate(
  date: string | Date,
  options: DateFormatterOptions = {}
): string {
  const {
    locale = 'es',
    format = 'medium',
    customOptions
  } = options;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Validar que la fecha sea válida
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }

  const fullLocale = localeMap[locale] || localeMap['es'];

  // Manejar formato relativo
  if (format === 'relative') {
    return formatRelativeDate(dateObj, fullLocale);
  }

  // Obtener opciones de formato
  let formatOptions: Intl.DateTimeFormatOptions;

  if (format === 'custom' && customOptions) {
    formatOptions = customOptions;
  } else {
    formatOptions = formatConfigs[format];
  }

  // Usar el método correcto según si el formato incluye hora
  // Convertir a la zona horaria del locale especificado
  const localeTimeZone = timezoneMap[locale] || timezoneMap['es'];
  if (format === 'time-12' || format === 'time-24') {
    const timeOptions = { ...formatOptions, timeZone: localeTimeZone };
    return dateObj.toLocaleTimeString(fullLocale, timeOptions);
  } else if (formatOptions.hour !== undefined || formatOptions.minute !== undefined) {
    const dateTimeOptions = { ...formatOptions, timeZone: localeTimeZone };
    return dateObj.toLocaleString(fullLocale, dateTimeOptions);
  } else {
    return dateObj.toLocaleDateString(fullLocale, formatOptions);
  }
}

/**
 * Formatea una hora según el locale y formato especificados
 */
export function formatTime(
  date: string | Date,
  options: DateFormatterOptions = {}
): string {
  const {
    locale = 'es',
    format = 'time-24',
    customOptions
  } = options;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Validar que la fecha sea válida
  if (isNaN(dateObj.getTime())) {
    return 'Hora inválida';
  }

  const fullLocale = localeMap[locale];

  // Obtener opciones de formato
  let formatOptions: Intl.DateTimeFormatOptions;

  if (format === 'custom' && customOptions) {
    formatOptions = customOptions;
  } else {
    formatOptions = formatConfigs[format];
  }

  // Formatear la hora
  return dateObj.toLocaleTimeString(fullLocale, formatOptions);
}

/**
 * Formatea fecha y hora juntas
 */
export function formatDateTime(
  date: string | Date,
  options: DateFormatterOptions = {}
): string {
  const {
    locale = 'es',
    format = 'datetime-full'
  } = options;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Validar que la fecha sea válida
  if (isNaN(dateObj.getTime())) {
    return 'Fecha y hora inválidas';
  }

  const fullLocale = localeMap[locale];
  const formatOptions = formatConfigs[format];

  return dateObj.toLocaleString(fullLocale, formatOptions);
}

/**
 * Formatea una fecha en formato relativo (hace X tiempo)
 */
function formatRelativeDate(date: Date, locale: string): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime())) / 1000;

  if (diffInSeconds < 60) {
    return 'Hace un momento';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `Hace ${diffInWeeks} semana${diffInWeeks !== 1 ? 's' : ''}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `Hace ${diffInMonths} mes${diffInMonths !== 1 ? 'es' : ''}`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `Hace ${diffInYears} año${diffInYears !== 1 ? 's' : ''}`;
}

/**
 * Obtiene el locale actual desde la URL o localStorage
 */
export function getCurrentLocale(): Locale {
  if (typeof window === 'undefined') return 'es';

  // Intentar obtener desde la URL
  const pathname = window.location.pathname;
  const localeFromPath = pathname.split('/')[1] as Locale;
  if (['es', 'en', 'it'].includes(localeFromPath)) {
    return localeFromPath;
  }

  // Intentar obtener desde localStorage
  const storedLocale = localStorage.getItem('locale') as Locale;
  if (['es', 'en', 'it'].includes(storedLocale)) {
    return storedLocale;
  }

  // Default
  return 'es';
}

/**
 * Hook para usar el formateador de fechas con el locale actual
 */
export function useDateFormatter() {
  const locale = getCurrentLocale();

  return {
    formatDate: (date: string | Date, format?: DateFormat, customOptions?: CustomFormatOptions) =>
      formatDate(date, { locale, format, customOptions }),
    formatTime: (date: string | Date, format?: DateFormat, customOptions?: CustomFormatOptions) =>
      formatTime(date, { locale, format, customOptions }),
    formatDateTime: (date: string | Date, format?: DateFormat, customOptions?: CustomFormatOptions) =>
      formatDateTime(date, { locale, format, customOptions }),
    locale
  };
}
