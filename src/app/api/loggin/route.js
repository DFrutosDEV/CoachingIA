import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Definir el esquema de Role
const RoleSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'The name cannot exceed 50 characters']
  },
  codigo: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'The code cannot exceed 50 characters']
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

RoleSchema.index({ nombre: 1 });

const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);

// Definir el esquema de User
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'The name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'The last name cannot exceed 50 characters']
  },
  password: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'The password cannot exceed 50 characters']
  },
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  }],
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  age: {
    type: Number,
    min: [0, 'The age cannot be negative'],
    max: [120, 'The age cannot be greater than 120']
  },
  creationDate: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

UserSchema.index({ name: 1 });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Conectar a MongoDB
async function connectMongoDB() {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tu_base_de_datos');
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    throw error;
  }
}

export async function POST(request) {
  try {
    // Conectar a la base de datos
    await connectMongoDB();
    
    // Obtener datos del cuerpo de la petición
    const { email, contrasena } = await request.json();
    
    // Validar que se proporcionen email y contraseña
    if (!email || !contrasena) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email y contraseña son requeridos' 
        },
        { status: 400 }
      );
    }
    
    console.log('🔍 Intentando login con:', { email, password: contrasena });
    
    // Buscar usuario por email y contraseña (usando el campo correcto 'password')
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      password: contrasena,
      active: true
    }).populate('roles');
    
    console.log('👤 Usuario encontrado:', user ? 'SÍ' : 'NO');
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Credenciales inválidas' 
        },
        { status: 401 }
      );
    }
    
    // Login exitoso - retornar datos del usuario (sin contraseña)
    const userResponse = {
      _id: user._id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      roles: user.roles,
      age: user.age,
      creationDate: user.creationDate,
      active: user.active
    };
    
    console.log('✅ Login exitoso para:', email);
    
    return NextResponse.json(
      {
        success: true,
        message: 'Login exitoso',
        user: userResponse
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('❌ Error en login:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor',
        error: error.message
      },
      { status: 500 }
    );
  }
}

// Método GET para verificar que el endpoint está funcionando
export async function GET() {
  return NextResponse.json(
    { 
      message: 'Endpoint de login funcionando correctamente',
      metodo: 'Usa POST para hacer login con email y contraseña'
    },
    { status: 200 }
  );
}
