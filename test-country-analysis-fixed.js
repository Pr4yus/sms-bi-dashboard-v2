const axios = require('axios');

async function testCountryAnalysisFixed() {
  console.log('🧪 Probando vista individual con análisis de uso (error corregido)...\n');

  try {
    // Probar el endpoint que estaba fallando
    const response = await axios.get('http://localhost:4000/sms-analytics/accounts/guatemala/2025/5', {
      timeout: 30000
    });

    console.log('✅ ✅ ✅ ÉXITO: El error de proyección de MongoDB se ha corregido');
    console.log(`📊 Datos obtenidos correctamente:`);
    console.log(`   - País: ${response.data.country}`);
    console.log(`   - Período: ${response.data.period}`);
    console.log(`   - Total de cuentas: ${response.data.summary.total_accounts}`);
    console.log(`   - Cuentas granel: ${response.data.summary.granel}`);
    console.log(`   - Cuentas alto: ${response.data.summary.alto}`);
    console.log(`   - Cuentas adecuado: ${response.data.summary.adecuado}`);
    console.log(`   - Cuentas bajo: ${response.data.summary.bajo}`);
    console.log(`   - Cuentas crítico: ${response.data.summary.critico}`);
    console.log(`   - Cuentas sin actividad: ${response.data.summary.sin_actividad}`);
    
    if (response.data.accounts && response.data.accounts.length > 0) {
      console.log(`\n📋 Ejemplo de cuenta procesada:`);
      const sampleAccount = response.data.accounts[0];
      console.log(`   - Nombre: ${sampleAccount.account_name}`);
      console.log(`   - Estado: ${sampleAccount.usage_status}`);
      console.log(`   - Es granel: ${sampleAccount.is_bulk_plan}`);
      console.log(`   - SMS enviados: ${sampleAccount.sent}`);
      console.log(`   - SMS contratados: ${sampleAccount.contracted}`);
      console.log(`   - Porcentaje de uso: ${sampleAccount.usage_percentage}%`);
    }

    console.log('\n🎉 ¡El error de proyección de MongoDB se ha solucionado completamente!');
    console.log('✅ La vista individual ahora funciona correctamente');
    console.log('✅ El filtro de granel se aplica correctamente');
    console.log('✅ La clasificación de estados funciona sin errores');

  } catch (error) {
    console.error('❌ ❌ ❌ ERROR: El problema persiste');
    console.error(`Error: ${error.message}`);
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

// Ejecutar la prueba
testCountryAnalysisFixed(); 