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
  { nombre: 'Admin', codigo: '1', activo: true },
  { nombre: 'Coach', codigo: '2', activo: true },
  { nombre: 'Coachee', codigo: '3', activo: true },
  { nombre: 'Enterprise', codigo: '4', activo: true }
];

export const migrateName = 'migrate-roles-20250608';

export async function up(): Promise<void> {
  console.log(`${colors.blue}🔄 Ejecutando migración: ${migrateName}${colors.reset}`);
  
  try {
    for (const roleData of rolesToCreate) {
      // Verificar si el rol ya existe
      const existingRole = await (Role as any).findOne({ codigo: roleData.codigo });
      
      if (existingRole) {
        console.log(`${colors.yellow}   ⚠️  Rol "${roleData.nombre}" (código: ${roleData.codigo}) ya existe${colors.reset}`);
      } else {
        // Crear el nuevo rol
        const newRole = new (Role as any)(roleData);
        await newRole.save();
        console.log(`${colors.green}   ✅ Rol "${roleData.nombre}" (código: ${roleData.codigo}) creado exitosamente${colors.reset}`);
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
      await (Role as any).deleteOne({ codigo: roleData.codigo });
      console.log(`${colors.yellow}   🗑️  Rol "${roleData.nombre}" (código: ${roleData.codigo}) eliminado${colors.reset}`);
    }
    
    console.log(`${colors.yellow}✅ Migración ${migrateName} revertida exitosamente${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}❌ Error revirtiendo migración ${migrateName}:${colors.reset}`, error);
    throw error;
  }
} 