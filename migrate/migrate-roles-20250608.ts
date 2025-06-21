import mongoose from 'mongoose';
import Role from '../src/models/Role';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const rolesToCreate = [
  { name: 'Admin', code: '1', active: true },
  { name: 'Coach', code: '2', active: true },
  { name: 'Client', code: '3', active: true },
  { name: 'Enterprise', code: '4', active: true }
];

export const migrateName = 'migrate-roles-20250608';

export async function up(): Promise<void> {
  console.log(`${colors.blue}🔄 Ejecutando migración: ${migrateName}${colors.reset}`);
  
  try {
    for (const roleData of rolesToCreate) {
      // Verificar si el rol ya existe
      const existingRole = await (Role as any).findOne({ code: roleData.code });
      
      if (existingRole) {
        console.log(`${colors.yellow}   ⚠️  Rol "${roleData.name}" (código: ${roleData.code}) ya existe${colors.reset}`);
      } else {
        // Crear el nuevo rol
        const newRole = new (Role as any)(roleData);
        await newRole.save();
        console.log(`${colors.green}   ✅ Rol "${roleData.name}" (código: ${roleData.code}) creado exitosamente${colors.reset}`);
      }
    }
    
    console.log(`${colors.green}✅ Migración ${migrateName} completada exitosamente${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}❌ Error en migración ${migrateName}:${colors.reset}`, error);
    throw error;
  }
}

export async function down(): Promise<void> {
  console.log(`${colors.yellow}🔄 Revirtiendo migración: ${migrateName}${colors.reset}`);
  
  try {
    // Eliminar todos los roles creados en esta migración
    for (const roleData of rolesToCreate) {
      await (Role as any).deleteOne({ code: roleData.code });
      console.log(`${colors.yellow}   🗑️  Rol "${roleData.name}" (código: ${roleData.code}) eliminado${colors.reset}`);
    }
    
    console.log(`${colors.yellow}✅ Migración ${migrateName} revertida exitosamente${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}❌ Error revirtiendo migración ${migrateName}:${colors.reset}`, error);
    throw error;
  }
} 