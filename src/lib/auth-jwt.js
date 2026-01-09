import jwt from 'jsonwebtoken';

/**
 * Obtiene el JWT_SECRET de las variables de entorno
 * Next.js carga automáticamente las variables de entorno desde .env.local y .env
 * @returns {string} - El secret JWT
 * @throws {Error} - Si JWT_SECRET no está definido
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    const error = new Error(
      'JWT_SECRET is not defined in the environment variables. ' +
      'Please add JWT_SECRET in your .env.local or .env file in the project root.'
    );
    console.error('❌ Critical error:', error.message);
    throw error;
  }

  return secret;
}

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
    const secret = getJwtSecret();
    const decoded = jwt.verify(cleanToken, secret);
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
    const secret = getJwtSecret();
    return jwt.sign(payload, secret, { expiresIn });
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
