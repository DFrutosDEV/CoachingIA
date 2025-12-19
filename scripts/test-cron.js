/**
 * Script para testear el endpoint del cron job de emails programados
 * 
 * Uso:
 *   node scripts/test-cron.js
 * 
 * O con variables de entorno:
 *   BASE_URL=http://localhost:3000 node scripts/test-cron.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ENDPOINT = '/api/cron/send-scheduled-emails';
const CRON_SECRET = process.env.CRON_SECRET; // Opcional, ya que la auth está comentada

async function testCronEndpoint() {
  console.log('🧪 Iniciando test del cron job...\n');
  console.log(`📍 URL: ${BASE_URL}${ENDPOINT}`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`);

  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Agregar header de autorización si existe CRON_SECRET
    if (CRON_SECRET) {
      headers['Authorization'] = `Bearer ${CRON_SECRET}`;
      console.log('🔐 Usando autenticación con CRON_SECRET');
    } else {
      console.log('⚠️  CRON_SECRET no configurado (la auth está comentada en el endpoint)');
    }

    console.log('\n📤 Enviando request POST...\n');

    const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
      method: 'POST',
      headers,
    });

    const data = await response.json();
    const status = response.status;

    console.log(`📊 Status: ${status}`);
    console.log(`📦 Response:`, JSON.stringify(data, null, 2));

    if (status === 200 && data.success) {
      console.log('\n✅ Test exitoso! El cron job se inició correctamente.');
      console.log('💡 Nota: El procesamiento se ejecuta en background.');
      console.log('💡 Revisa los logs del servidor para ver el progreso completo.');
    } else {
      console.log('\n❌ Test falló. Revisa la respuesta arriba.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Error al ejecutar el test:');
    console.error(error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Asegúrate de que el servidor esté corriendo:');
      console.error('   npm run dev');
    }

    process.exit(1);
  }
}

// Ejecutar el test
testCronEndpoint();
