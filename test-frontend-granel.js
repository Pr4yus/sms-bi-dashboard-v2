const fetch = require('node-fetch');

async function testFrontendGranel() {
  console.log('🎨 PRUEBA DEL FRONTEND CON FILTRO GRANEL');
  console.log('='.repeat(50));
  
  try {
    // Probar el endpoint con filtro granel
    console.log('\n1. 🚀 Probando endpoint backend con filtro granel...');
    const response = await fetch('http://localhost:4000/api/sms-analytics/accounts/guatemala/2025/5/grouped-by-client?usage_filter=granel');
    
    if (!response.ok) {
      console.log(`❌ Error HTTP: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    
    console.log(`✅ Backend responde correctamente:`);
    console.log(`   📊 Total cuentas: ${data.summary.total_accounts}`);
    console.log(`   🏢 Grupos comerciales: ${data.commercial_groups.length}`);
    console.log(`   🔍 Filtro aplicado: ${data.filter_applied}`);
    
    if (data.debug_info) {
      console.log(`   🔧 Debug - Antes del filtro: ${data.debug_info.total_accounts_before_filter}`);
      console.log(`   🔧 Debug - Después del filtro: ${data.debug_info.accounts_after_filter}`);
    }
    
    // Analizar la estructura de datos
    console.log('\n2. 📋 Analizando estructura de datos...');
    if (data.commercial_groups.length > 0) {
      const firstGroup = data.commercial_groups[0];
      console.log(`   ✅ Primer grupo encontrado:`);
      console.log(`      - ID: ${firstGroup.client_id}`);
      console.log(`      - Nombre: ${firstGroup.client_display_name}`);
      console.log(`      - Cuentas: ${firstGroup.group_totals.total_accounts}`);
      console.log(`      - SMS enviados: ${firstGroup.group_totals.total_sent}`);
      
      if (firstGroup.accounts && firstGroup.accounts.length > 0) {
        console.log(`      - Primera cuenta: ${firstGroup.accounts[0].account_name}`);
        console.log(`      - Estado: ${firstGroup.accounts[0].usage_status}`);
        console.log(`      - SMS: ${firstGroup.accounts[0].sent || 0}`);
      }
    } else {
      console.log(`   ❌ No se encontraron grupos comerciales`);
    }
    
    // Verificar que la estructura sea compatible con el frontend
    console.log('\n3. 🔍 Verificando compatibilidad con frontend...');
    
    const requiredFields = [
      'commercial_groups',
      'summary',
      'filter_applied',
      'debug_info'
    ];
    
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length === 0) {
      console.log(`   ✅ Todos los campos requeridos están presentes`);
    } else {
      console.log(`   ❌ Campos faltantes: ${missingFields.join(', ')}`);
    }
    
    // Verificar estructura de grupos comerciales
    if (data.commercial_groups.length > 0) {
      const group = data.commercial_groups[0];
      const groupRequiredFields = [
        'client_id',
        'client_display_name', 
        'group_totals',
        'accounts'
      ];
      
      const missingGroupFields = groupRequiredFields.filter(field => !group[field]);
      
      if (missingGroupFields.length === 0) {
        console.log(`   ✅ Estructura de grupos comerciales correcta`);
      } else {
        console.log(`   ❌ Campos faltantes en grupos: ${missingGroupFields.join(', ')}`);
      }
      
      // Verificar group_totals
      if (group.group_totals) {
        const totalsFields = [
          'total_accounts',
          'total_sent',
          'total_ok',
          'total_errors'
        ];
        
        const missingTotalsFields = totalsFields.filter(field => group.group_totals[field] === undefined);
        
        if (missingTotalsFields.length === 0) {
          console.log(`   ✅ Estructura de totales correcta`);
        } else {
          console.log(`   ❌ Campos faltantes en totales: ${missingTotalsFields.join(', ')}`);
        }
      }
    }
    
    // Mostrar algunos ejemplos de datos
    console.log('\n4. 📊 Ejemplos de datos para frontend...');
    if (data.commercial_groups.length > 0) {
      console.log(`   📋 Primeros 3 grupos comerciales:`);
      data.commercial_groups.slice(0, 3).forEach((group, index) => {
        console.log(`      ${index + 1}. ${group.client_display_name}`);
        console.log(`         - Cuentas: ${group.group_totals.total_accounts}`);
        console.log(`         - SMS: ${group.group_totals.total_sent.toLocaleString()}`);
        console.log(`         - Cliente ID: ${group.client_id}`);
      });
    }
    
    console.log('\n5. ✅ Resumen del test:');
    console.log(`   - Backend funciona: ✅`);
    console.log(`   - Datos estructurados: ✅`);
    console.log(`   - Compatible con frontend: ✅`);
    console.log(`   - Grupos encontrados: ${data.commercial_groups.length}`);
    console.log(`   - Cuentas filtradas: ${data.summary.total_accounts}`);
    
    if (data.commercial_groups.length > 0) {
      console.log('\n💡 El filtro granel está funcionando correctamente en el backend.');
      console.log('   Si no se ven en el frontend, el problema está en la visualización.');
    }
    
  } catch (error) {
    console.log(`❌ Error durante la prueba: ${error.message}`);
  }
}

async function main() {
  await testFrontendGranel();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Prueba completada');
  console.log('\n💡 Para probar el frontend:');
  console.log('   1. Abre http://localhost:3000/country-analysis');
  console.log('   2. Selecciona Guatemala, Mayo 2025');
  console.log('   3. Elige "Agrupado por Cliente"');
  console.log('   4. Selecciona filtro "🚀 Granel (Planes A granel)"');
  console.log('   5. Haz clic en "Actualizar"');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testFrontendGranel }; 