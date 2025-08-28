import mongoose from 'mongoose';
import User from '../src/models/User';
import Profile from '../src/models/Profile';
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
    age: 30,
    role: 'Admin'
  },
  {
    name: 'Coach',
    lastName: 'Prueba',
    email: 'coach@coach.com',
    password: 'coach123',
    age: 35,
    role: 'Coach'
  },
  {
    name: 'Cliente',
    lastName: 'Prueba',
    email: 'cliente@coach.com',
    password: 'cliente123',
    age: 25,
    role: 'Client'
  }
];

export const migrateName = 'migrate-users-20250623';

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
      
      // Crear el usuario (sin name, lastName, age)
      const newUserData = {
        email: userData.email,
        password: userData.password, // En un entorno real, esto debería estar hasheado
        isDeleted: false,
        firstLogin: true,
      };
      
      const newUser = new (User as any)(newUserData);
      await newUser.save();
      
      // Buscar o crear el rol correspondiente
      let role = await (Role as any).findOne({ name: userData.role });
      if (!role) {
        console.log(`${colors.yellow}   ⚠️  Rol "${userData.role}" no encontrado`);
        skipCount++;
        continue;
      }
      
      // Crear el perfil del usuario
      const newProfileData = {
        user: newUser._id,
        role: role._id,
        name: userData.name,
        lastName: userData.lastName,
        age: userData.age,
        profilePicture: '',
        bio: '',
        phone: '',
        address: '',
        indexDashboard: [],
        clients: [],
        enterprise: null,
        isDeleted: false,
      };
      
      const newProfile = new (Profile as any)(newProfileData);
      await newProfile.save();
      
      console.log(`${colors.green}   ✅ Usuario "${userData.name} ${userData.lastName}" creado exitosamente${colors.reset}`);
      console.log(`${colors.green}      📧 Email: ${userData.email}${colors.reset}`);
      console.log(`${colors.green}      🔐 Contraseña: ${userData.password}${colors.reset}`);
      console.log(`${colors.green}      👤 Rol: ${userData.role}${colors.reset}`);
      
      successCount++;
    }
    
    console.log(`${colors.green}✅ Migración ${migrateName} completada exitosamente${colors.reset}`);
    console.log(`${colors.green}   📊 Usuarios y perfiles creados: ${successCount}${colors.reset}`);
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
    
    // Eliminar todos los usuarios y perfiles que se crearon en esta migración
    for (const userData of usersToMigrate) {
      // Buscar el usuario por email
      const user = await (User as any).findOne({ email: userData.email });
      
      if (user) {
        // Eliminar el perfil asociado
        const deletedProfile = await (Profile as any).deleteOne({ user: user._id });
        if (deletedProfile.deletedCount > 0) {
          console.log(`${colors.yellow}   🗑️  Perfil de ${userData.name} ${userData.lastName} eliminado${colors.reset}`);
        }
        
        // Eliminar el usuario
        const deletedUser = await (User as any).deleteOne({ email: userData.email });
        
        if (deletedUser.deletedCount > 0) {
          console.log(`${colors.yellow}   🗑️  Usuario ${userData.name} ${userData.lastName} eliminado${colors.reset}`);
          deletedCount++;
        }
      } else {
        console.log(`${colors.yellow}   ⚠️  Usuario ${userData.name} ${userData.lastName} no encontrado para eliminar${colors.reset}`);
      }
    }
    
    console.log(`${colors.yellow}✅ Migración ${migrateName} revertida exitosamente${colors.reset}`);
    console.log(`${colors.yellow}   📊 Usuarios y perfiles eliminados: ${deletedCount}${colors.reset}\n`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error revirtiendo migración ${migrateName}:${colors.reset}`, error);
    throw error;
  }
} 