import mongoose from 'mongoose';
import ConfigForm from '../src/models/ConfigForm';

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

const configQuestions = [
  "¿Cuál es tu objetivo principal en este programa de coaching?",
  "¿En qué área de tu vida te gustaría enfocarte más?",
  "¿Cuántas horas a la semana puedes dedicar a trabajar en tus objetivos?",
  "¿Prefieres trabajar en objetivos a corto plazo (1-3 meses) o largo plazo (6-12 meses)?",
  "¿Qué tipo de apoyo necesitas más del coach?",
  "¿Tienes alguna experiencia previa con coaching o desarrollo personal?",
  "¿Cuál es tu nivel de motivación actual (1-10)?",
  "¿Qué obstáculos crees que pueden impedirte alcanzar tus objetivos?",
  "¿Prefieres sesiones más estructuradas o flexibles?",
  "¿Hay algún tema específico que te gustaría abordar en las sesiones?"
];

export const migrateName = 'migrate-config-questions-20250623';

export async function up(): Promise<void> {
  console.log(`${colors.blue}🔄 Ejecutando migración: ${migrateName}${colors.reset}`);
  
  try {
    for (const question of configQuestions) {
      // Verificar si la pregunta ya existe
      const existingQuestion = await (ConfigForm as any).findOne({ title: question });
      
      if (existingQuestion) {
        console.log(`${colors.yellow}   ⚠️  Pregunta "${question.substring(0, 50)}..." ya existe${colors.reset}`);
      } else {
        // Crear la nueva pregunta
        const newQuestion = new (ConfigForm as any)({
          title: question,
          active: true,
          isObligatory: true,
        });
        await newQuestion.save();
        console.log(`${colors.green}   ✅ Pregunta "${question.substring(0, 50)}..." creada exitosamente${colors.reset}`);
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
    // Eliminar todas las preguntas creadas en esta migración
    for (const question of configQuestions) {
      await (ConfigForm as any).deleteOne({ title: question });
      console.log(`${colors.yellow}   🗑️  Pregunta "${question.substring(0, 50)}..." eliminada${colors.reset}`);
    }
    
    console.log(`${colors.yellow}✅ Migración ${migrateName} revertida exitosamente${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}❌ Error revirtiendo migración ${migrateName}:${colors.reset}`, error);
    throw error;
  }
} 