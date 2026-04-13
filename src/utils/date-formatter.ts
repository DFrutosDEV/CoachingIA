/**
 * Utilidades centralizadas para formatear fechas y horas.
 * La fuente de verdad vive aqui y prioriza Italia (`it` / `Europe/Rome`).
 */

import { routing } from '@/i18n/routing';
import { getPreferredLocale } from './locale-storage';

export type Locale = 'it' | 'es' | 'en';

export type DateFormat =
  | 'full'
  | 'long'
  | 'medium'
  | 'short'
  | 'weekday-long'
  | 'weekday-short'
  | 'month-long'
  | 'month-short'
  | 'time-12'
  | 'time-24'
  | 'datetime-full'
  | 'datetime-short'
  | 'relative'
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
  locale?: Locale | string;
  format?: DateFormat;
  customOptions?: CustomFormatOptions;
  timeZone?: string;
}

export interface DateConfig {
  language: Locale;
  localeCode: string;
  timeZone: string;
}

export const APP_LOCALES: Locale[] = ['it', 'es', 'en'];
export const DEFAULT_LOCALE: Locale = routing.defaultLocale as Locale;
export const DEFAULT_TIMEZONE = 'Europe/Rome';

export const localeMap: Record<Locale, string> = {
  it: 'it-IT',
  es: 'es-AR',
  en: 'en-US',
};

export const timezoneMap: Record<Locale, string> = {
  it: 'Europe/Rome',
  es: 'America/Argentina/Buenos_Aires',
  en: 'America/New_York',
};

const formatConfigs: Record<DateFormat, Intl.DateTimeFormatOptions> = {
  full: {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  long: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  medium: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  short: {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  },
  'weekday-long': {
    weekday: 'long',
  },
  'weekday-short': {
    weekday: 'short',
  },
  'month-long': {
    month: 'long',
  },
  'month-short': {
    month: 'short',
  },
  'time-12': {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  },
  'time-24': {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  },
  'datetime-full': {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  },
  'datetime-short': {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  },
  relative: {},
  custom: {},
};

function isValidLocale(locale?: string | null): locale is Locale {
  return Boolean(locale && APP_LOCALES.includes(locale as Locale));
}

function isDateFormat(value?: string): value is DateFormat {
  return Boolean(value && value in formatConfigs);
}

function parseDateInput(date: string | Date): Date | null {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return Number.isNaN(dateObj.getTime()) ? null : dateObj;
}

function getEffectiveFormatOptions(
  fallbackFormat: DateFormat,
  options: DateFormatterOptions
) {
  const format = isDateFormat(options.format) ? options.format : fallbackFormat;

  if (format === 'relative') {
    return { format, intlOptions: {} as Intl.DateTimeFormatOptions };
  }

  const intlOptions =
    format === 'custom' && options.customOptions
      ? options.customOptions
      : formatConfigs[format];

  return { format, intlOptions };
}

function buildFormatterOptions(
  fallbackFormat: DateFormat,
  options: DateFormatterOptions
) {
  const config = getDateConfig(options.locale);
  const { format, intlOptions } = getEffectiveFormatOptions(fallbackFormat, options);
  const effectiveTimeZone =
    options.customOptions?.timeZone || options.timeZone || config.timeZone;

  return {
    config,
    format,
    intlOptions: {
      ...intlOptions,
      timeZone: effectiveTimeZone,
    } satisfies Intl.DateTimeFormatOptions,
  };
}

function formatRelativeDate(date: Date, localeCode: string): string {
  const now = new Date();
  const diffInSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(localeCode, { numeric: 'auto' });

  const ranges: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
    ['second', 1],
  ];

  for (const [unit, secondsInUnit] of ranges) {
    if (Math.abs(diffInSeconds) >= secondsInUnit || unit === 'second') {
      return formatter.format(
        Math.round(diffInSeconds / secondsInUnit),
        unit
      );
    }
  }

  return formatter.format(0, 'second');
}

export function normalizeLocale(locale?: string | null): Locale {
  if (isValidLocale(locale)) {
    return locale;
  }

  return DEFAULT_LOCALE;
}

export function getDateConfig(locale?: string | null): DateConfig {
  const normalizedLocale = normalizeLocale(locale);

  return {
    language: normalizedLocale,
    localeCode: localeMap[normalizedLocale],
    timeZone: timezoneMap[normalizedLocale] || DEFAULT_TIMEZONE,
  };
}

export function getLocaleCode(locale?: string | null): string {
  return getDateConfig(locale).localeCode;
}

export function getTimeZoneForLocale(locale?: string | null): string {
  return getDateConfig(locale).timeZone;
}

export function getLocaleFromPathname(pathname?: string | null): Locale | null {
  if (!pathname) {
    return null;
  }

  const localeFromPath = pathname.split('/')[1];
  return isValidLocale(localeFromPath) ? localeFromPath : null;
}

export function getCurrentLocale(): Locale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const localeFromPath = getLocaleFromPathname(window.location.pathname);
  if (localeFromPath) {
    return localeFromPath;
  }

  const preferredLocale = getPreferredLocale();
  if (isValidLocale(preferredLocale)) {
    return preferredLocale;
  }

  return DEFAULT_LOCALE;
}

export function formatDate(
  date: string | Date,
  options: DateFormatterOptions = {}
): string {
  const dateObj = parseDateInput(date);
  if (!dateObj) {
    return 'Fecha inválida';
  }

  const { config, format, intlOptions } = buildFormatterOptions('medium', options);
  if (format === 'relative') {
    return formatRelativeDate(dateObj, config.localeCode);
  }

  return new Intl.DateTimeFormat(config.localeCode, intlOptions).format(dateObj);
}

export function formatTime(
  date: string | Date,
  options: DateFormatterOptions = {}
): string {
  const dateObj = parseDateInput(date);
  if (!dateObj) {
    return 'Hora inválida';
  }

  const { config, format, intlOptions } = buildFormatterOptions('time-24', options);
  if (format === 'relative') {
    return formatRelativeDate(dateObj, config.localeCode);
  }

  return new Intl.DateTimeFormat(config.localeCode, intlOptions).format(dateObj);
}

export function formatDateTime(
  date: string | Date,
  options: DateFormatterOptions = {}
): string {
  const dateObj = parseDateInput(date);
  if (!dateObj) {
    return 'Fecha y hora inválidas';
  }

  const { config, format, intlOptions } = buildFormatterOptions(
    'datetime-full',
    options
  );
  if (format === 'relative') {
    return formatRelativeDate(dateObj, config.localeCode);
  }

  return new Intl.DateTimeFormat(config.localeCode, intlOptions).format(dateObj);
}

export function formatUtcDate(
  date: string | Date,
  options: DateFormatterOptions = {}
): string {
  return formatDate(date, options);
}

export function formatUtcTime(
  date: string | Date,
  options: DateFormatterOptions = {}
): string {
  return formatTime(date, options);
}

export function formatUtcDateTime(
  date: string | Date,
  options: DateFormatterOptions = {}
): string {
  return formatDateTime(date, options);
}

export function useDateFormatter() {
  const locale = getCurrentLocale();
  const config = getDateConfig(locale);

  return {
    locale,
    localeCode: config.localeCode,
    timeZone: config.timeZone,
    formatDate: (
      date: string | Date,
      format?: DateFormat,
      customOptions?: CustomFormatOptions
    ) => formatDate(date, { locale, format, customOptions }),
    formatTime: (
      date: string | Date,
      format?: DateFormat,
      customOptions?: CustomFormatOptions
    ) => formatTime(date, { locale, format, customOptions }),
    formatDateTime: (
      date: string | Date,
      format?: DateFormat,
      customOptions?: CustomFormatOptions
    ) => formatDateTime(date, { locale, format, customOptions }),
    formatUtcDate: (
      date: string | Date,
      format?: DateFormat,
      customOptions?: CustomFormatOptions
    ) => formatUtcDate(date, { locale, format, customOptions }),
    formatUtcTime: (
      date: string | Date,
      format?: DateFormat,
      customOptions?: CustomFormatOptions
    ) => formatUtcTime(date, { locale, format, customOptions }),
    formatUtcDateTime: (
      date: string | Date,
      format?: DateFormat,
      customOptions?: CustomFormatOptions
    ) => formatUtcDateTime(date, { locale, format, customOptions }),
  };
}
