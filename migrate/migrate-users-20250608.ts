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

// JSON con los usuarios a migrar
const usersToMigrate = [
  {
    name: 'Admin',
    lastName: 'Prueba',
    email: 'admin@coach.com',
    password: 'admin123',
    roles: ['Admin'], // Array de nombres de roles
    age: 30,
    active: true
  },
  {
    name: 'Coach',
    lastName: 'Prueba',
    email: 'coach@coach.com',
    password: 'coach123',
    roles: ['Coach'],
    age: 35,
    active: true
  },
  {
    name: 'Cliente',
    lastName: 'Prueba',
    email: 'cliente@coach.com',
    password: 'cliente123',
    roles: ['Client'],
    age: 25,
    active: true
  }
];

export const migrateName = 'migrate-users-20250608';

export async function up(): Promise<void> {
  console.log(`${colors.blue}🔄 Ejecutando migración: ${migrateName}${colors.reset}`);
  
  try {
    let successCount = 0;
    let skipCount = 0;
    
    for (const userData of usersToMigrate) {
      console.log(`${colors.cyan}   👤 Procesando usuario: ${userData.name} ${userData.lastName}${colors.reset}`);
      
      // Verificar si el usuario ya existe
      const existingUser = await (User as any).findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`${colors.yellow}   ⚠️  Usuario con email "${userData.email}" ya existe${colors.reset}`);
        skipCount++;
        continue;
      }
      
      // Buscar los roles por nombre
      const roleIds: mongoose.Types.ObjectId[] = [];
      
      for (const roleName of userData.roles) {
        const role = await (Role as any).findOne({ name: roleName, active: true });
        
        if (!role) {
          throw new Error(`No se encontró el rol "${roleName}". Asegúrate de ejecutar la migración de roles primero.`);
        }
        
        roleIds.push(new mongoose.Types.ObjectId(role._id));
        console.log(`${colors.blue}      📋 Rol encontrado: ${role.name} (ID: ${role._id})${colors.reset}`);
      }
      
      // Crear el nuevo usuario
      const newUserData = {
        name: userData.name,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password, // En un entorno real, esto debería estar hasheado
        roles: roleIds,
        age: userData.age,
        active: userData.active,
        creationDate: new Date(),
        isDeleted: false,
        clients: [],
        coaches: [],
        enterprises: []
      };
      
      const newUser = new (User as any)(newUserData);
      await newUser.save();
      
      console.log(`${colors.green}   ✅ Usuario "${userData.name} ${userData.lastName}" creado exitosamente${colors.reset}`);
      console.log(`${colors.green}      📧 Email: ${userData.email}${colors.reset}`);
      console.log(`${colors.green}      🔐 Contraseña: ${userData.password}${colors.reset}`);
      console.log(`${colors.green}      👤 Roles: ${userData.roles.join(', ')}${colors.reset}`);
      
      successCount++;
    }
    
    console.log(`${colors.green}✅ Migración ${migrateName} completada exitosamente${colors.reset}`);
    console.log(`${colors.green}   📊 Usuarios creados: ${successCount}${colors.reset}`);
    console.log(`${colors.yellow}   📊 Usuarios omitidos (ya existían): ${skipCount}${colors.reset}\n`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error en migración ${migrateName}:${colors.reset}`, error);
    throw error;
  }
}

export async function down(): Promise<void> {
  console.log(`${colors.yellow}🔄 Revirtiendo migración: ${migrateName}${colors.reset}`);
  
  try {
    let deletedCount = 0;
    
    // Eliminar todos los usuarios que se crearon en esta migración
    for (const userData of usersToMigrate) {
      const deletedUser = await (User as any).deleteOne({ email: userData.email });
      
      if (deletedUser.deletedCount > 0) {
        console.log(`${colors.yellow}   🗑️  Usuario ${userData.name} ${userData.lastName} eliminado${colors.reset}`);
        deletedCount++;
      } else {
        console.log(`${colors.yellow}   ⚠️  Usuario ${userData.name} ${userData.lastName} no encontrado para eliminar${colors.reset}`);
      }
    }
    
    console.log(`${colors.yellow}✅ Migración ${migrateName} revertida exitosamente${colors.reset}`);
    console.log(`${colors.yellow}   📊 Usuarios eliminados: ${deletedCount}${colors.reset}\n`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error revirtiendo migración ${migrateName}:${colors.reset}`, error);
    throw error;
  }
} 