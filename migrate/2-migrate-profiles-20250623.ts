import mongoose from 'mongoose';
import User from '../src/models/User';
import Role from '../src/models/Role';
import Profile from '../src/models/Profile';

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

// JSON con los perfiles a migrar (asociados a los usuarios)
const profilesToMigrate = [
  {
    userEmail: 'admin@coach.com',
    roleName: 'Admin',
    bio: 'Administrador del sistema',
    profilePicture: ''
  },
  {
    userEmail: 'coach@coach.com',
    roleName: 'Coach',
    bio: 'Coach profesional especializado en desarrollo personal',
    profilePicture: ''
  },
  {
    userEmail: 'cliente@coach.com',
    roleName: 'Client',
    bio: 'Cliente en proceso de coaching',
    profilePicture: ''
  }
];

export const migrateName = 'migrate-profiles-20250623';

export async function up(): Promise<void> {
  console.log(`${colors.blue}🔄 Ejecutando migración: ${migrateName}${colors.reset}`);
  
  try {
    let successCount = 0;
    let skipCount = 0;
    
    for (const profileData of profilesToMigrate) {
      console.log(`${colors.cyan}   👤 Procesando perfil para: ${profileData.userEmail}${colors.reset}`);
      
      // Buscar el usuario por email
      const user = await (User as any).findOne({ email: profileData.userEmail });
      
      if (!user) {
        throw new Error(`No se encontró el usuario con email "${profileData.userEmail}". Asegúrate de ejecutar la migración de usuarios primero.`);
      }
      
      console.log(`${colors.blue}      👤 Usuario encontrado: ${user.name} ${user.lastName} (ID: ${user._id})${colors.reset}`);
      
      // Verificar si el perfil ya existe
      const existingProfile = await (Profile as any).findOne({ 
        user: user._id,
        isDeleted: false 
      });
      
      if (existingProfile) {
        console.log(`${colors.yellow}   ⚠️  Perfil para usuario "${profileData.userEmail}" ya existe${colors.reset}`);
        skipCount++;
        continue;
      }
      
      // Buscar el rol por nombre
      const role = await (Role as any).findOne({ name: profileData.roleName, active: true });
      
      if (!role) {
        throw new Error(`No se encontró el rol "${profileData.roleName}". Asegúrate de ejecutar la migración de roles primero.`);
      }
      
      console.log(`${colors.blue}      📋 Rol encontrado: ${role.name} (ID: ${role._id})${colors.reset}`);
      
      // Crear el nuevo perfil
      const newProfileData = {
        user: new mongoose.Types.ObjectId(user._id),
        role: new mongoose.Types.ObjectId(role._id),
        profilePicture: profileData.profilePicture,
        bio: profileData.bio,
        indexDashboard: [],
        clients: [],
        enterprise: null,
        isDeleted: false
      };
      
      const newProfile = new (Profile as any)(newProfileData);
      await newProfile.save();
      
      console.log(`${colors.green}   ✅ Perfil creado exitosamente${colors.reset}`);
      console.log(`${colors.green}      👤 Usuario: ${user.name} ${user.lastName}${colors.reset}`);
      console.log(`${colors.green}      📧 Email: ${user.email}${colors.reset}`);
      console.log(`${colors.green}      👤 Rol: ${role.name}${colors.reset}`);
      console.log(`${colors.green}      📝 Bio: ${profileData.bio}${colors.reset}`);
      
      successCount++;
    }
    
    console.log(`${colors.green}✅ Migración ${migrateName} completada exitosamente${colors.reset}`);
    console.log(`${colors.green}   📊 Perfiles creados: ${successCount}${colors.reset}`);
    console.log(`${colors.yellow}   📊 Perfiles omitidos (ya existían): ${skipCount}${colors.reset}\n`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error en migración ${migrateName}:${colors.reset}`, error);
    throw error;
  }
}

export async function down(): Promise<void> {
  console.log(`${colors.yellow}🔄 Revirtiendo migración: ${migrateName}${colors.reset}`);
  
  try {
    let deletedCount = 0;
    
    // Eliminar todos los perfiles que se crearon en esta migración
    for (const profileData of profilesToMigrate) {
      // Buscar el usuario por email
      const user = await (User as any).findOne({ email: profileData.userEmail });
      
      if (user) {
        const deletedProfile = await (Profile as any).deleteOne({ user: user._id });
        
        if (deletedProfile.deletedCount > 0) {
          console.log(`${colors.yellow}   🗑️  Perfil de ${profileData.userEmail} eliminado${colors.reset}`);
          deletedCount++;
        } else {
          console.log(`${colors.yellow}   ⚠️  Perfil de ${profileData.userEmail} no encontrado para eliminar${colors.reset}`);
        }
      } else {
        console.log(`${colors.yellow}   ⚠️  Usuario ${profileData.userEmail} no encontrado${colors.reset}`);
      }
    }
    
    console.log(`${colors.yellow}✅ Migración ${migrateName} revertida exitosamente${colors.reset}`);
    console.log(`${colors.yellow}   📊 Perfiles eliminados: ${deletedCount}${colors.reset}\n`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error revirtiendo migración ${migrateName}:${colors.reset}`, error);
    throw error;
  }
} 