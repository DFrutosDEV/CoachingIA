import dotenv from 'dotenv';
import { readdirSync } from 'fs';
import { join } from 'path';
import mongoose from 'mongoose';
import Logs from '../src/models/Logs';

// Cargar variables de entorno desde .env.local (o .env)
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

// Tipos para colores de consola
interface Colors {
  reset: string;
  bright: string;
  green: string;
  red: string;
  yellow: string;
  blue: string;
  cyan: string;
}

// Colores para la consola
const colors: Colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Función de conexión a MongoDB directa
async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI: string | undefined = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('Por favor define la variable de entorno MONGODB_URI en tu archivo .env.local');
  }
  
  try {
    const opts = {
      bufferCommands: false,
    };
    
    await mongoose.connect(MONGODB_URI, opts);
    console.log(`${colors.green}✅ Conectado a MongoDB${colors.reset}`);
    return mongoose;
  } catch (error) {
    console.error(`${colors.red}❌ Error conectando a MongoDB:${colors.reset}`, error);
    throw error;
  }
}

// Función para migrar modelos (funcionalidad original)
async function migrateModels(): Promise<{ createdCollections: string[], errors: string[] }> {
  console.log(`${colors.cyan}${colors.bright}📋 Migrando modelos...${colors.reset}\n`);
  
  const createdCollections: string[] = [];
  const errors: string[] = [];
  
  try {
    // Obtener la ruta de la carpeta de modelos
    const modelsPath: string = join(process.cwd(), 'src', 'models');
    
    // Leer todos los archivos en la carpeta de modelos
    let modelFiles: string[];
    try {
      modelFiles = readdirSync(modelsPath).filter((file: string) => 
        file.endsWith('.ts') || file.endsWith('.js')
      );
    } catch (error) {
      console.log(`${colors.red}❌ No se pudo leer la carpeta de modelos: ${modelsPath}${colors.reset}`);
      console.log(`${colors.yellow}💡 Asegúrate de que exista la carpeta src/models${colors.reset}`);
      return { createdCollections, errors };
    }
    
    if (modelFiles.length === 0) {
      console.log(`${colors.yellow}⚠️  No se encontraron archivos de modelos en ${modelsPath}${colors.reset}`);
      return { createdCollections, errors };
    }
    
    console.log(`${colors.blue}📁 Modelos encontrados: ${modelFiles.length}${colors.reset}`);
    modelFiles.forEach((file: string) => {
      console.log(`   - ${file}`);
    });
    console.log('');
    
    // Importar y procesar cada modelo
    for (const file of modelFiles) {
      const modelName: string = file.replace(/\.(ts|js)$/, '');
      
      try {
        console.log(`${colors.yellow}🔄 Procesando modelo: ${modelName}${colors.reset}`);
        
        // Importar el modelo dinámicamente
        const modelPath: string = join(modelsPath, file);
        let modelModule: any;
        
        try {
          // Intentar import dinámico primero
          modelModule = await import(modelPath);
        } catch (importError) {
          console.log(`${colors.yellow}   ⚠️  Import fallback, usando require...${colors.reset}`);
          try {
            // Usar require tradicional como fallback
            delete require.cache[require.resolve(modelPath)]; // Limpiar cache
            modelModule = require(modelPath);
          } catch (requireError) {
            console.log(`${colors.red}   ❌ Error importando modelo ${modelName}: ${requireError}${colors.reset}`);
            errors.push(`${modelName}: Error de importación - ${requireError}`);
            continue;
          }
        }
        
        const Model = modelModule.default || modelModule;
        
        if (!Model || !Model.collection) {
          console.log(`${colors.red}   ❌ Error: ${modelName} no es un modelo válido de Mongoose${colors.reset}`);
          errors.push(`${modelName}: No es un modelo válido de Mongoose`);
          continue;
        }
        
        // Obtener el nombre de la colección
        const collectionName: string = Model.collection.collectionName;
        
        // Verificar si la colección ya existe
        if (!mongoose.connection.db) {
          throw new Error('No hay conexión activa a la base de datos');
        }
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        const existingCollection = collections.find((col: any) => col.name === collectionName);
        
        if (existingCollection) {
          console.log(`${colors.green}   ✅ Colección '${collectionName}' ya existe${colors.reset}`);
        } else {
          // Crear la colección
          await mongoose.connection.db.createCollection(collectionName);
          console.log(`${colors.green}   ✅ Colección '${collectionName}' creada exitosamente${colors.reset}`);
          createdCollections.push(collectionName);
        }
        
        // Crear índices si están definidos en el esquema
        try {
          await Model.createIndexes();
          console.log(`${colors.green}   ✅ Índices sincronizados para '${collectionName}'${colors.reset}`);
        } catch (indexError) {
          console.log(`${colors.yellow}   ⚠️  Advertencia: Error creando índices para '${collectionName}': ${indexError}${colors.reset}`);
        }
        
      } catch (error) {
        console.log(`${colors.red}   ❌ Error procesando ${modelName}: ${error}${colors.reset}`);
        errors.push(`${modelName}: ${error}`);
      }
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ Error durante la migración de modelos:${colors.reset}`, error);
    errors.push(`Error general: ${error}`);
  }
  
  return { createdCollections, errors };
}

// Función para ejecutar migraciones específicas
async function runSpecificMigrations(): Promise<{ executed: string[], errors: string[] }> {
  console.log(`\n${colors.cyan}${colors.bright}🚀 Ejecutando migraciones específicas...${colors.reset}\n`);
  
  const executed: string[] = [];
  const errors: string[] = [];
  
  try {
    // Obtener la ruta de la carpeta de migraciones
    const migratePath: string = join(process.cwd(), 'migrate');
    
    // Leer todos los archivos en la carpeta de migraciones
    let migrationFiles: string[];
    try {
      migrationFiles = readdirSync(migratePath).filter((file: string) => {
        // Buscar archivos que terminen en .ts o .js Y que empiecen con un número seguido de guión
        const isValidExtension = file.endsWith('.ts') || file.endsWith('.js');
        const hasOrderPrefix = /^\d+-/.test(file); // Patrón: número-cualquier_cosa
        return isValidExtension && hasOrderPrefix;
      });
    } catch (error) {
      console.log(`${colors.yellow}⚠️  Carpeta de migraciones no encontrada: ${migratePath}${colors.reset}`);
      return { executed, errors };
    }
    
    if (migrationFiles.length === 0) {
      console.log(`${colors.yellow}⚠️  No se encontraron archivos de migración en ${migratePath}${colors.reset}`);
      console.log(`${colors.blue}💡 Tip: Los archivos deben seguir el patrón: [orden]-[nombre].ts${colors.reset}`);
      console.log(`${colors.blue}   Ejemplo: 1-migrate-roles-20250623.ts${colors.reset}`);
      return { executed, errors };
    }
    
    // Ordenar archivos por el número de orden al inicio del nombre
    migrationFiles.sort((a: string, b: string) => {
      const orderA = parseInt(a.split('-')[0], 10);
      const orderB = parseInt(b.split('-')[0], 10);
      
      // Si tienen el mismo número de orden, ordenar por nombre completo
      if (orderA === orderB) {
        return a.localeCompare(b);
      }
      
      return orderA - orderB;
    });
    
    console.log(`${colors.blue}📁 Migraciones encontradas (en orden de ejecución): ${migrationFiles.length}${colors.reset}`);
    migrationFiles.forEach((file: string, index: number) => {
      const orderNumber = file.split('-')[0];
      console.log(`   ${index + 1}. [Orden ${orderNumber}] ${file}`);
    });
    console.log('');
    
    // Ejecutar cada migración
    for (const file of migrationFiles) {
      const migrationName: string = file.replace(/\.(ts|js)$/, '');
      
      try {
        // Verificar si la migración ya fue ejecutada
        const existingLog = await (Logs as any).findOne({ fileName: migrationName });
        
        if (existingLog) {
          console.log(`${colors.yellow}⚠️  Migración "${migrationName}" ya fue ejecutada (${existingLog.date})${colors.reset}`);
          continue;
        }
        
        console.log(`${colors.blue}🔄 Ejecutando migración: ${migrationName}${colors.reset}`);
        
        // Importar el archivo de migración
        const migrationPath: string = join(migratePath, file);
        let migrationModule: any;
        
        try {
          migrationModule = await import(migrationPath);
        } catch (importError) {
          console.log(`${colors.yellow}   ⚠️  Import fallback, usando require...${colors.reset}`);
          try {
            delete require.cache[require.resolve(migrationPath)];
            migrationModule = require(migrationPath);
          } catch (requireError) {
            console.log(`${colors.red}   ❌ Error importando migración ${migrationName}: ${requireError}${colors.reset}`);
            errors.push(`${migrationName}: Error de importación - ${requireError}`);
            continue;
          }
        }
        
        // Verificar que la migración tenga la función 'up'
        if (typeof migrationModule.up !== 'function') {
          console.log(`${colors.red}   ❌ Error: ${migrationName} no tiene función 'up'${colors.reset}`);
          errors.push(`${migrationName}: No tiene función 'up'`);
          continue;
        }
        
        // Ejecutar la migración
        await migrationModule.up();
        
        // Registrar en logs que la migración fue ejecutada
        const logEntry = new (Logs as any)({
          fileName: migrationName,
          date: new Date().toISOString()
        });
        await logEntry.save();
        
        console.log(`${colors.green}✅ Migración "${migrationName}" ejecutada exitosamente${colors.reset}`);
        executed.push(migrationName);
        
      } catch (error) {
        console.log(`${colors.red}❌ Error ejecutando migración ${migrationName}: ${error}${colors.reset}`);
        errors.push(`${migrationName}: ${error}`);
      }
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ Error durante las migraciones específicas:${colors.reset}`, error);
    errors.push(`Error general: ${error}`);
  }
  
  return { executed, errors };
}

async function runMigrations(): Promise<void> {
  console.log(`${colors.cyan}${colors.bright}🚀 Iniciando proceso de migración completo...${colors.reset}\n`);
  
  try {
    // Conectar a la base de datos
    console.log(`${colors.yellow}📡 Conectando a MongoDB...${colors.reset}`);
    await connectDB();
    console.log(`${colors.green}✅ Conectado a MongoDB exitosamente${colors.reset}\n`);
    
    // 1. Migrar modelos (crear colecciones e índices)
    const modelsResult = await migrateModels();
    
    // 2. Ejecutar migraciones específicas
    const migrationsResult = await runSpecificMigrations();
    
    // Resumen final
    console.log(`\n${colors.cyan}${colors.bright}📊 Resumen completo de la migración:${colors.reset}`);
    
    // Resumen de modelos
    console.log(`\n${colors.blue}📋 Modelos:${colors.reset}`);
    console.log(`${colors.green}✅ Colecciones nuevas creadas: ${modelsResult.createdCollections.length}${colors.reset}`);
    if (modelsResult.createdCollections.length > 0) {
      modelsResult.createdCollections.forEach((collection: string) => {
        console.log(`   - ${collection}`);
      });
    }
    
    // Resumen de migraciones
    console.log(`\n${colors.blue}🚀 Migraciones específicas:${colors.reset}`);
    console.log(`${colors.green}✅ Migraciones ejecutadas: ${migrationsResult.executed.length}${colors.reset}`);
    if (migrationsResult.executed.length > 0) {
      migrationsResult.executed.forEach((migration: string) => {
        console.log(`   - ${migration}`);
      });
    }
    
    // Errores combinados
    const allErrors = [...modelsResult.errors, ...migrationsResult.errors];
    if (allErrors.length > 0) {
      console.log(`\n${colors.red}❌ Errores encontrados: ${allErrors.length}${colors.reset}`);
      allErrors.forEach((error: string) => {
        console.log(`   - ${error}`);
      });
    }
    
    // Mostrar todas las colecciones existentes
    console.log(`\n${colors.blue}📋 Colecciones en la base de datos:${colors.reset}`);
    if (mongoose.connection.db) {
      const allCollections = await mongoose.connection.db.listCollections().toArray();
      allCollections.forEach((collection: any) => {
        console.log(`   - ${collection.name}`);
      });
    }
    
    console.log(`\n${colors.green}${colors.bright}🎉 Proceso de migración completado exitosamente!${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error durante el proceso de migración:${colors.reset}`, error);
    process.exit(1);
  } finally {
    // Cerrar la conexión
    await mongoose.connection.close();
    console.log(`${colors.yellow}🔌 Conexión a MongoDB cerrada${colors.reset}`);
    process.exit(0);
  }
}

// Ejecutar las migraciones
runMigrations().catch((error: any) => {
  console.error(`${colors.red}❌ Error fatal:${colors.reset}`, error);
  process.exit(1);
}); 