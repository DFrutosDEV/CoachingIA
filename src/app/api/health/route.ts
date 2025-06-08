import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// GET /api/health - Verificar el estado de la conexión a la base de datos
export async function GET() {
  try {
    await connectDB();
    
    // Verificar el estado de la conexión
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'desconectado',
      1: 'conectado',
      2: 'conectando',
      3: 'desconectando'
    };
    
    const isConnected = dbState === 1;
    
    return NextResponse.json({
      success: true,
      database: {
        status: states[dbState as keyof typeof states] || 'desconocido',
        connected: isConnected,
        host: mongoose.connection.host || 'N/A',
        name: mongoose.connection.name || 'N/A'
      },
      timestamp: new Date().toISOString(),
      message: isConnected ? 'Base de datos conectada correctamente' : 'Problema con la conexión a la base de datos'
    }, {
      status: isConnected ? 200 : 503
    });
    
  } catch (error) {
    console.error('Error en health check:', error);
    return NextResponse.json({
      success: false,
      database: {
        status: 'error',
        connected: false
      },
      error: 'No se pudo conectar a la base de datos',
      timestamp: new Date().toISOString()
    }, {
      status: 503
    });
  }
} 