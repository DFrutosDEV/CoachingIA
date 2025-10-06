import { verifyToken } from './auth-jwt';

// Tipos para los datos del token
export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
  iat?: number; // issued at
  exp?: number; // expires at
}

// ✅ Función SEGURA para extraer datos del token
export function getTokenData(token: string): TokenPayload | null {
  try {
    if (!token) {
      console.warn('⚠️ Token vacío');
      return null;
    }

    // ✅ Verificar token con la librería JWT (incluye validación de firma y expiración)
    const decoded = verifyToken(token);

    if (!decoded) {
      console.warn('⚠️ Token inválido o expirado');
      return null;
    }

    return decoded as TokenPayload;
  } catch (error) {
    console.error('❌ Error verificando token:', error);
    return null;
  }
}

// ✅ Función para extraer solo el rol del token (forma segura)
export function getUserRoleFromToken(token: string): string | null {
  const tokenData = getTokenData(token);
  console.log('🔍 Token data:', tokenData);
  if (!tokenData) {
    return null;
  }

  const role = tokenData.role;
  console.log('🔍 Rol extraído del token:', role);

  return role || null;
}

// ✅ Función para extraer userId del token
export function getUserIdFromToken(token: string): string | null {
  const tokenData = getTokenData(token);
  return tokenData?.userId || null;
}

// ✅ Función para verificar si el token está por expirar (útil para refresh)
export function isTokenExpiringSoon(
  token: string,
  minutesBeforeExpiry: number = 5
): boolean {
  const tokenData = getTokenData(token);

  if (!tokenData || !tokenData.exp) {
    return true; // Considerar como expirado si no hay fecha de expiración
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const expirationTime = tokenData.exp;
  const timeUntilExpiry = expirationTime - currentTime;
  const minutesUntilExpiry = timeUntilExpiry / 60;

  return minutesUntilExpiry <= minutesBeforeExpiry;
}

// ❌ Función INSEGURA (solo para debugging - NO USAR EN PRODUCCIÓN)
export function decodeTokenUnsafe(token: string): any {
  try {
    console.warn(
      '⚠️ ADVERTENCIA: Usando decodificación insegura - solo para debugging'
    );
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('❌ Error decodificando token:', error);
    return null;
  }
}

/**
 * Obtiene el token JWT desde Redux Persist o localStorage
 * @returns {string | null} El token JWT o null si no existe
 */
export function getStoredToken(): string | null {
  try {
    // Intentar obtener del Redux Persist primero
    const persistAuth = localStorage.getItem('persist:auth');
    if (persistAuth) {
      const authData = JSON.parse(persistAuth);
      if (authData.token) {
        // El token está serializado como string por Redux Persist
        const token = JSON.parse(authData.token);
        if (token && token !== 'null') {
          return token;
        }
      }
    }

    // Si no está en Redux Persist, intentar localStorage directo
    const directToken = localStorage.getItem('token');
    if (directToken && directToken !== 'null') {
      return directToken;
    }

    return null;
  } catch (error) {
    console.error('❌ Error obteniendo token almacenado:', error);
    return null;
  }
}

/**
 * Guarda el token JWT en localStorage (para compatibilidad)
 * @param {string} token - El token JWT a guardar
 */
export function storeToken(token: string): void {
  try {
    localStorage.setItem('token', token);
  } catch (error) {
    console.error('❌ Error guardando token:', error);
  }
}

/**
 * Limpia el token JWT de localStorage
 */
export function clearStoredToken(): void {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
  } catch (error) {
    console.error('❌ Error limpiando token:', error);
  }
}
