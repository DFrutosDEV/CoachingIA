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

async function rollbackLastMigration(): Promise<void> {
  console.log(`${colors.cyan}${colors.bright}🔄 Iniciando rollback de la última migración...${colors.reset}\n`);
  
  try {
    // Conectar a la base de datos
    console.log(`${colors.yellow}📡 Conectando a MongoDB...${colors.reset}`);
    await connectDB();
    console.log(`${colors.green}✅ Conectado a MongoDB exitosamente${colors.reset}\n`);
    
    // Buscar la última migración ejecutada
    const lastMigration = await (Logs as any).findOne().sort({ createdAt: -1 });
    
    if (!lastMigration) {
      console.log(`${colors.yellow}⚠️  No se encontraron migraciones para revertir${colors.reset}`);
      return;
    }
    
    console.log(`${colors.blue}📋 Última migración encontrada: ${lastMigration.fileName}${colors.reset}`);
    console.log(`${colors.blue}📅 Ejecutada el: ${lastMigration.date}${colors.reset}\n`);
    
    // Buscar el archivo de migración correspondiente
    const migratePath: string = join(process.cwd(), 'migrate');
    const migrationFile = `${lastMigration.fileName}.ts`;
    const migrationPath = join(migratePath, migrationFile);
    
    try {
      // Importar el archivo de migración
      let migrationModule: any;
      
      try {
        migrationModule = await import(migrationPath);
      } catch (importError) {
        console.log(`${colors.yellow}   ⚠️  Import fallback, usando require...${colors.reset}`);
        try {
          delete require.cache[require.resolve(migrationPath)];
          migrationModule = require(migrationPath);
        } catch (requireError) {
          throw new Error(`Error importando migración: ${requireError}`);
        }
      }
      
      // Verificar que la migración tenga la función 'down'
      if (typeof migrationModule.down !== 'function') {
        throw new Error(`La migración ${lastMigration.fileName} no tiene función 'down'`);
      }
      
      console.log(`${colors.yellow}🔄 Revirtiendo migración: ${lastMigration.fileName}${colors.reset}`);
      
      // Ejecutar la función down
      await migrationModule.down();
      
      // Eliminar el registro de logs
      await (Logs as any).deleteOne({ _id: lastMigration._id });
      
      console.log(`${colors.green}✅ Migración "${lastMigration.fileName}" revertida exitosamente${colors.reset}`);
      console.log(`${colors.green}✅ Registro eliminado de logs${colors.reset}`);
      
    } catch (error) {
      console.error(`${colors.red}❌ Error revirtiendo migración ${lastMigration.fileName}:${colors.reset}`, error);
      throw error;
    }
    
    console.log(`\n${colors.green}${colors.bright}🎉 Rollback completado exitosamente!${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error durante el rollback:${colors.reset}`, error);
    process.exit(1);
  } finally {
    // Cerrar la conexión
    await mongoose.connection.close();
    console.log(`${colors.yellow}🔌 Conexión a MongoDB cerrada${colors.reset}`);
    process.exit(0);
  }
}

// Ejecutar el rollback
rollbackLastMigration().catch((error: any) => {
  console.error(`${colors.red}❌ Error fatal:${colors.reset}`, error);
  process.exit(1);
}); 