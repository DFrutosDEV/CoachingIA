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
    roleName: 'admin',
    bio: 'Administrador del sistema',
    profilePicture: '',
    phone: '+1234567890',
    address: 'Oficina Principal'
  },
  {
    userEmail: 'coach@coach.com',
    roleName: 'coach',
    bio: 'Coach profesional especializado en desarrollo personal',
    profilePicture: '',
    phone: '+1234567891',
    address: 'Centro de Coaching'
  },
  {
    userEmail: 'cliente@coach.com',
    roleName: 'client',
    bio: 'Cliente en proceso de coaching',
    profilePicture: '',
    phone: '+1234567892',
    address: 'Dirección del Cliente'
  }
];

export const migrateName = 'migrate-profiles-20250623';

export async function up(): Promise<void> {
  console.log(`${colors.blue}🔄 Ejecutando migración: ${migrateName}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  NOTA: Esta migración es opcional. La migración de usuarios ya crea los perfiles.${colors.reset}`);
  console.log(`${colors.yellow}   Esta migración solo actualiza información adicional de los perfiles existentes.${colors.reset}\n`);
  
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
      
      console.log(`${colors.blue}      👤 Usuario encontrado: ${user.email} (ID: ${user._id})${colors.reset}`);
      
      // Verificar si el perfil ya existe
      const existingProfile = await (Profile as any).findOne({ 
        user: user._id,
        isDeleted: false 
      });
      
      if (existingProfile) {
        console.log(`${colors.blue}   🔄 Actualizando perfil existente para "${profileData.userEmail}"${colors.reset}`);
        
        // Actualizar el perfil existente con información adicional
        const updateData = {
          bio: profileData.bio,
          phone: profileData.phone,
          address: profileData.address
        };
        
        await (Profile as any).findByIdAndUpdate(existingProfile._id, updateData);
        
        console.log(`${colors.green}   ✅ Perfil actualizado exitosamente${colors.reset}`);
        console.log(`${colors.green}      👤 Usuario: ${user.email}${colors.reset}`);
        console.log(`${colors.green}      📝 Bio: ${profileData.bio}${colors.reset}`);
        console.log(`${colors.green}      📞 Teléfono: ${profileData.phone}${colors.reset}`);
        console.log(`${colors.green}      🏠 Dirección: ${profileData.address}${colors.reset}`);
        
        successCount++;
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
        phone: profileData.phone,
        address: profileData.address,
        indexDashboard: [],
        clients: [],
        enterprise: null,
        isDeleted: false
      };
      
      const newProfile = new (Profile as any)(newProfileData);
      await newProfile.save();
      
      console.log(`${colors.green}   ✅ Perfil creado exitosamente${colors.reset}`);
      console.log(`${colors.green}      👤 Usuario: ${user.email}${colors.reset}`);
      console.log(`${colors.green}      📧 Email: ${user.email}${colors.reset}`);
      console.log(`${colors.green}      👤 Rol: ${role.name}${colors.reset}`);
      console.log(`${colors.green}      📝 Bio: ${profileData.bio}${colors.reset}`);
      console.log(`${colors.green}      📞 Teléfono: ${profileData.phone}${colors.reset}`);
      console.log(`${colors.green}      🏠 Dirección: ${profileData.address}${colors.reset}`);
      
      successCount++;
    }
    
    console.log(`${colors.green}✅ Migración ${migrateName} completada exitosamente${colors.reset}`);
    console.log(`${colors.green}   📊 Perfiles actualizados: ${successCount}${colors.reset}`);
    console.log(`${colors.yellow}   📊 Perfiles omitidos (no se encontró usuario): ${skipCount}${colors.reset}\n`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error en migración ${migrateName}:${colors.reset}`, error);
    throw error;
  }
}

export async function down(): Promise<void> {
  console.log(`${colors.yellow}🔄 Revirtiendo migración: ${migrateName}${colors.reset}`);
  
  try {
    let deletedCount = 0;
    
    // Restaurar valores por defecto en los perfiles
    for (const profileData of profilesToMigrate) {
      // Buscar el usuario por email
      const user = await (User as any).findOne({ email: profileData.userEmail });
      
      if (user) {
        const profile = await (Profile as any).findOne({ user: user._id });
        
        if (profile) {
          // Restaurar valores por defecto
          const updateData = {
            bio: '',
            phone: '',
            address: ''
          };
          
          await (Profile as any).findByIdAndUpdate(profile._id, updateData);
          console.log(`${colors.yellow}   🔄 Perfil de ${profileData.userEmail} restaurado a valores por defecto${colors.reset}`);
          deletedCount++;
        } else {
          console.log(`${colors.yellow}   ⚠️  Perfil de ${profileData.userEmail} no encontrado${colors.reset}`);
        }
      } else {
        console.log(`${colors.yellow}   ⚠️  Usuario ${profileData.userEmail} no encontrado${colors.reset}`);
      }
    }
    
    console.log(`${colors.yellow}✅ Migración ${migrateName} revertida exitosamente${colors.reset}`);
    console.log(`${colors.yellow}   📊 Perfiles restaurados a valores por defecto: ${deletedCount}${colors.reset}\n`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error revirtiendo migración ${migrateName}:${colors.reset}`, error);
    throw error;
  }
} 