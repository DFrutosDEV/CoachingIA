import mongoose from 'mongoose';
import User from '../src/models/User';
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

export const migrateName = 'migrate-users-20250608';

export async function up(): Promise<void> {
  console.log(`${colors.blue}🔄 Ejecutando migración: ${migrateName}${colors.reset}`);
  
  try {
    // Buscar el rol de Admin (código 1)
    const adminRole = await (Role as any).findOne({ codigo: '1' });
    
    if (!adminRole) {
      throw new Error('No se encontró el rol de Admin. Asegúrate de ejecutar la migración de roles primero.');
    }
    
    console.log(`${colors.blue}   📋 Rol Admin encontrado: ${adminRole.nombre} (ID: ${adminRole._id})${colors.reset}`);
    
    // Verificar si el usuario ya existe
    const existingUser = await (User as any).findOne({ email: 'prueba@ej.com' });
    
    if (existingUser) {
      console.log(`${colors.yellow}   ⚠️  Usuario con email "prueba@ej.com" ya existe${colors.reset}`);
    } else {
      // Crear el nuevo usuario con ObjectId del rol
      const userData = {
        name: 'Prueba',
        lastName: 'Usuario',
        email: 'prueba@ej.com',
        password: 'admin', // En un entorno real, esto debería estar hasheado
        roles: [new mongoose.Types.ObjectId(adminRole._id)], // Asegurar que sea ObjectId
        active: true,
        creationDate: new Date()
      };
      
      const newUser = new (User as any)(userData);
      await newUser.save();
      
      console.log(`${colors.green}   ✅ Usuario de prueba "${userData.name}" creado exitosamente${colors.reset}`);
      console.log(`${colors.green}      📧 Email: ${userData.email}${colors.reset}`);
      console.log(`${colors.green}      🔐 Contraseña: ${userData.password}${colors.reset}`);
      console.log(`${colors.green}      👤 Rol: Admin (ObjectId: ${adminRole._id})${colors.reset}`);
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
    // Eliminar el usuario de prueba
    const deletedUser = await (User as any).deleteOne({ email: 'prueba@ej.com' });
    
    if (deletedUser.deletedCount > 0) {
      console.log(`${colors.yellow}   🗑️  Usuario de prueba eliminado${colors.reset}`);
    } else {
      console.log(`${colors.yellow}   ⚠️  Usuario de prueba no encontrado para eliminar${colors.reset}`);
    }
    
    console.log(`${colors.yellow}✅ Migración ${migrateName} revertida exitosamente${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}❌ Error revirtiendo migración ${migrateName}:${colors.reset}`, error);
    throw error;
  }
} 