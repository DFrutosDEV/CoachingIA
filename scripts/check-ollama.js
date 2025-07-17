#!/usr/bin/env node

const http = require('http');

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

async function checkOllama() {
  console.log('🔍 Verificando estado de Ollama...\n');

  try {
    // Verificar si Ollama está ejecutándose
    const isRunning = await checkOllamaStatus();
    
    if (!isRunning) {
      console.log('❌ Ollama no está ejecutándose');
      console.log('\n📋 Pasos para solucionarlo:');
      console.log('1. Instala Ollama desde https://ollama.ai');
      console.log('2. Ejecuta: ollama serve');
      console.log('3. Descarga el modelo: ollama pull llama3.1:8b');
      return false;
    }

    // Verificar modelos disponibles
    const models = await getAvailableModels();
    
    if (models.length === 0) {
      console.log('⚠️  Ollama está ejecutándose pero no hay modelos disponibles');
      console.log('\n📥 Descarga el modelo recomendado:');
      console.log('ollama pull llama3.1:8b');
      return false;
    }

    // Verificar si el modelo recomendado está disponible
    const hasRecommendedModel = models.some(model => 
      model.includes('llama3.1:8b') || model.includes('llama3.1')
    );

    console.log('✅ Ollama está funcionando correctamente');
    console.log(`📦 Modelos disponibles: ${models.length}`);
    
    if (hasRecommendedModel) {
      console.log('✅ Modelo recomendado (llama3.1:8b) está disponible');
    } else {
      console.log('⚠️  Modelo recomendado no encontrado');
      console.log('📥 Descarga el modelo: ollama pull llama3.1:8b');
    }

    console.log('\n🚀 Puedes usar la generación automática de objetivos');
    return true;

  } catch (error) {
    console.error('❌ Error verificando Ollama:', error.message);
    return false;
  }
}

function checkOllamaStatus() {
  return new Promise((resolve) => {
    const req = http.get(`${OLLAMA_URL}/api/tags`, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function getAvailableModels() {
  return new Promise((resolve) => {
    const req = http.get(`${OLLAMA_URL}/api/tags`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          const models = response.models?.map(model => model.name) || [];
          resolve(models);
        } catch (error) {
          resolve([]);
        }
      });
    });

    req.on('error', () => {
      resolve([]);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve([]);
    });
  });
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkOllama().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { checkOllama, checkOllamaStatus, getAvailableModels }; 