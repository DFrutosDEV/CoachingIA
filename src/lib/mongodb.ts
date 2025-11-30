import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Logs para debugging
console.log('🔍 [MongoDB] Inicializando conexión...');
console.log('🔍 [MongoDB] NODE_ENV:', process.env.NODE_ENV);
console.log('🔍 [MONGODB_URI] Existe:', !!MONGODB_URI);
if (MONGODB_URI) {
  // Mostrar preview sin credenciales
  const uriPreview = MONGODB_URI.includes('@')
    ? MONGODB_URI.split('@')[0] + '@***'
    : MONGODB_URI.substring(0, 50);
  console.log('🔍 [MONGODB_URI] Preview:', uriPreview);

  // Verificar si es localhost en producción (error común)
  if (
    process.env.NODE_ENV === 'production' &&
    MONGODB_URI.includes('127.0.0.1')
  ) {
    console.error(
      '❌ [MongoDB] ERROR: MONGODB_URI apunta a localhost en producción!'
    );
    console.error(
      '❌ [MongoDB] Esto no funcionará en Vercel. Usa MongoDB Atlas.'
    );
  }
}

if (!MONGODB_URI) {
  console.error('❌ [MongoDB] MONGODB_URI no está definida');
  throw new Error(
    'Por favor define la variable de entorno MONGODB_URI en tu archivo .env.local'
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// En desarrollo, usar una variable global para preservar la conexión
// a través de recargas de módulos causadas por HMR (Hot Module Replacement)
declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  console.log('🔌 [MongoDB] connectDB() llamado');
  console.log(
    '🔌 [MongoDB] Estado conexión actual:',
    mongoose.connection.readyState
  );
  console.log('🔌 [MongoDB] Cached conn existe:', !!cached.conn);
  console.log('🔌 [MongoDB] Cached promise existe:', !!cached.promise);

  if (cached.conn) {
    const state = mongoose.connection.readyState;
    console.log('✅ [MongoDB] Usando conexión cacheada, estado:', state);
    if (state === 1) {
      return cached.conn;
    }
    // Si está desconectada, limpiar cache
    if (state === 0 || state === 3) {
      console.log(
        '⚠️ [MongoDB] Conexión cacheada está desconectada, limpiando cache'
      );
      cached.conn = null;
      cached.promise = null;
    }
  }

  if (!cached.promise) {
    console.log('🔄 [MongoDB] Creando nueva conexión...');
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    };

    console.log('🔄 [MongoDB] Opciones de conexión:', {
      serverSelectionTimeoutMS: opts.serverSelectionTimeoutMS,
      socketTimeoutMS: opts.socketTimeoutMS,
      connectTimeoutMS: opts.connectTimeoutMS,
    });

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then(mongoose => {
        console.log('✅ [MongoDB] Conectado exitosamente');
        console.log('✅ [MongoDB] Host:', mongoose.connection.host);
        console.log('✅ [MongoDB] Name:', mongoose.connection.name);
        console.log('✅ [MongoDB] ReadyState:', mongoose.connection.readyState);
        return mongoose;
      })
      .catch(error => {
        console.error('❌ [MongoDB] Error en la promesa de conexión:', error);
        console.error('❌ [MongoDB] Error name:', error?.name);
        console.error('❌ [MongoDB] Error message:', error?.message);
        console.error('❌ [MongoDB] Error code:', error?.code);
        throw error;
      });
  }

  try {
    console.log('⏳ [MongoDB] Esperando conexión...');
    cached.conn = await cached.promise;
    console.log(
      '✅ [MongoDB] Conexión establecida, readyState:',
      mongoose.connection.readyState
    );
  } catch (e: any) {
    cached.promise = null;
    cached.conn = null;
    console.error('❌ [MongoDB] Error conectando a MongoDB:');
    console.error('❌ [MongoDB] Tipo de error:', e?.constructor?.name);
    console.error('❌ [MongoDB] Mensaje:', e?.message);
    console.error('❌ [MongoDB] Código:', e?.code);
    console.error('❌ [MongoDB] Stack:', e?.stack);
    if (e?.cause) {
      console.error('❌ [MongoDB] Cause:', e.cause);
    }
    throw e;
  }

  return cached.conn;
}

export default connectDB;
