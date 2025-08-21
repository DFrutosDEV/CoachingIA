#!/usr/bin/env node

// Cargar variables de entorno desde múltiples archivos
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const https = require('https');

// Usar la versión v1 de la API en lugar de v1beta
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';

async function checkGemini() {
  console.log('🔍 Verificando estado de Gemini Pro...\n');

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  
  // Debug: mostrar todas las variables de entorno (sin mostrar la API key completa)
  console.log('📋 Variables de entorno cargadas:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- AI_PROVIDER:', process.env.AI_PROVIDER);
  console.log('- GOOGLE_AI_API_KEY:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NO CONFIGURADA');
  console.log('');

  if (!apiKey) {
    console.log('❌ API Key de Google AI no configurada');
    console.log('\n📋 Pasos para solucionarlo:');
    console.log('1. Ve a https://makersuite.google.com/app/apikey');
    console.log('2. Crea una nueva API Key');
    console.log('3. Agrega la variable de entorno: GOOGLE_AI_API_KEY=tu_api_key');
    console.log('4. Asegúrate de que el archivo se llame .env.local o .env');
    console.log('5. Reinicia la aplicación');
    return false;
  }

  try {
    // Verificar si Gemini está disponible
    const result = await checkGeminiStatus(apiKey);
    
    if (result.success) {
      console.log('✅ Gemini Pro está funcionando correctamente');
      console.log('🚀 Puedes usar la generación automática de objetivos');
      return true;
    } else {
      console.log('❌ Gemini Pro no está disponible');
      console.log('\n📋 Error:', result.error);
      console.log('\n📋 Posibles causas:');
      console.log('1. API Key inválida o expirada');
      console.log('2. Sin conexión a internet');
      console.log('3. Cuota de API excedida');
      console.log('4. API Key no tiene permisos para Gemini Pro');
      return false;
    }

  } catch (error) {
    console.error('❌ Error verificando Gemini:', error.message);
    return false;
  }
}

function checkGeminiStatus(apiKey) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      contents: [{
        parts: [{
          text: 'Hola, responde solo con "OK"'
        }]
      }],
      generationConfig: {
        maxOutputTokens: 10
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          console.log(`📡 Respuesta del servidor: ${res.statusCode} ${res.statusMessage}`);
          
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            if (response.candidates && response.candidates[0]) {
              resolve({ success: true });
            } else {
              resolve({ 
                success: false, 
                error: 'Respuesta inválida de Gemini: ' + JSON.stringify(response).substring(0, 200) 
              });
            }
          } else {
            const errorResponse = JSON.parse(data);
            resolve({ 
              success: false, 
              error: `Error ${res.statusCode}: ${errorResponse.error?.message || errorResponse.error || 'Error desconocido'}` 
            });
          }
        } catch (error) {
          resolve({ 
            success: false, 
            error: `Error parseando respuesta: ${error.message}. Respuesta: ${data.substring(0, 200)}` 
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ 
        success: false, 
        error: `Error de conexión: ${error.message}` 
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ 
        success: false, 
        error: 'Timeout: La solicitud tardó más de 10 segundos' 
      });
    });

    req.write(postData);
    req.end();
  });
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkGemini().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { checkGemini, checkGeminiStatus };
