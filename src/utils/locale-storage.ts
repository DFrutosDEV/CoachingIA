/**
 * Utilidades para manejar el localStorage de manera segura
 */

export const LOCALE_STORAGE_KEY = 'preferred-locale';

/**
 * Obtiene el locale preferido del localStorage de manera segura
 */
export function getPreferredLocale(): string | null {
  if (typeof window === 'undefined') {
    return null; // No hay localStorage en el servidor
  }

  try {
    return localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch (error) {
    console.warn('Error al acceder al localStorage:', error);
    return null;
  }
}

/**
 * Guarda el locale preferido en el localStorage de manera segura
 */
export function setPreferredLocale(locale: string): void {
  if (typeof window === 'undefined') {
    return; // No hay localStorage en el servidor
  }

  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch (error) {
    console.warn('Error al guardar en localStorage:', error);
  }
}

/**
 * Verifica si un locale es válido
 */
export function isValidLocale(locale: string | null, validLocales: string[]): boolean {
  return locale !== null && validLocales.includes(locale);
}
