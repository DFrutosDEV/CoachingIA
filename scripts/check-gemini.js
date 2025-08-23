#!/usr/bin/env node

const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function checkGeminiConfig() {
  console.log('🔍 Verificando configuración de Google Gemini...\n');

  // Verificar variables de entorno
  const googleApiKey = process.env.GOOGLE_AI_API_KEY;
  const aiProvider = process.env.AI_PROVIDER;

  console.log('📋 Variables de entorno:');
  console.log(`   AI_PROVIDER: ${aiProvider || 'no configurado'}`);
  console.log(`   GOOGLE_AI_API_KEY: ${googleApiKey ? '✅ configurada' : '❌ no configurada'}`);

  if (googleApiKey) {
    console.log(`   API Key (primeros 10 chars): ${googleApiKey.substring(0, 10)}...`);
  }

  if (!googleApiKey) {
    console.log('\n❌ Error: GOOGLE_AI_API_KEY no está configurada');
    console.log('\n📝 Para configurar Google Gemini:');
    console.log('1. Ve a https://makersuite.google.com/app/apikey');
    console.log('2. Crea una nueva API Key');
    console.log('3. Agrega GOOGLE_AI_API_KEY=tu_api_key en tu archivo .env.local');
    console.log('4. Reinicia la aplicación');
    process.exit(1);
  }

  // Verificar conexión con diferentes modelos
  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash'
  ];

  console.log('\n🌐 Verificando conexión con diferentes modelos de Gemini...');

  for (const model of models) {
    try {
      console.log(`\n📡 Probando modelo: ${model}`);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${googleApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hola, responde solo con "OK"'
            }]
          }],
          generationConfig: {
            maxOutputTokens: 10
          }
        })
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${model} está funcionando correctamente`);
        console.log(`   Respuesta: ${data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta'}`);
      } else {
        const errorText = await response.text();
        console.log(`❌ Error con ${model}: ${response.status} ${response.statusText}`);
        
        if (response.status === 429) {
          console.log(`   🔧 Error 429: Cuota excedida para ${model}`);
          console.log(`   💡 Soluciones:`);
          console.log(`      - Espera unos minutos antes de volver a intentar`);
          console.log(`      - Verifica tu cuota en Google AI Studio`);
          console.log(`      - Considera usar un modelo diferente`);
        } else if (response.status === 400) {
          console.log(`   🔧 Error 400: Modelo ${model} no disponible o inválido`);
        } else if (response.status === 403) {
          console.log(`   🔧 Error 403: API Key no tiene permisos para ${model}`);
        }
        
        console.log(`   Detalles: ${errorText.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`❌ Error de conexión con ${model}:`, error.message);
    }
  }

  // Verificar cuota y límites
  console.log('\n📊 Información sobre límites del plan gratuito:');
  console.log('   • 15 requests por minuto');
  console.log('   • 1,500 requests por día');
  console.log('   • 2 requests por segundo');
  console.log('   • Algunos modelos pueden tener límites específicos');

  console.log('\n💡 Recomendaciones:');
  console.log('1. Si obtienes error 429, espera 1-2 minutos antes de volver a intentar');
  console.log('2. Usa gemini-1.5-flash para el plan gratuito (más estable)');
  console.log('3. Verifica tu cuota en https://makersuite.google.com/app/apikey');
  console.log('4. Considera actualizar tu plan si necesitas más requests');

  console.log('\n📚 Recursos útiles:');
  console.log('- Google AI Studio: https://makersuite.google.com');
  console.log('- Documentación: https://ai.google.dev/docs');
  console.log('- Límites de cuota: https://ai.google.dev/pricing');
  console.log('- Modelos disponibles: https://ai.google.dev/models');
}

// Ejecutar verificación
checkGeminiConfig().catch(console.error);
