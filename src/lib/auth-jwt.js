import jwt from 'jsonwebtoken';

/**
 * Verifica un token JWT
 * @param {string} token - El token JWT a verificar
 * @returns {object|null} - Los datos del token si es válido, null si no es válido
 */
export function verifyToken(token) {
  try {
    if (!token) {
      return null;
    }
    // Remover 'Bearer ' si está presente
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('❌ Token JWT inválido:', error.message);
    return null;
  }
}

/**
 * Genera un token JWT
 * @param {object} payload - Los datos a incluir en el token
 * @param {string} expiresIn - Tiempo de expiración (ej: '1h', '24h', '7d')
 * @returns {string} - El token JWT generado
 */
export function generateToken(payload, expiresIn = '6h') {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  } catch (error) {
    console.error('❌ Error generando token JWT:', error.message);
    throw error;
  }
}

/**
 * Extrae el token de los headers de la request
 * @param {Request} request - La request de Next.js
 * @returns {string|null} - El token si existe, null si no
 */
export function extractTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}
