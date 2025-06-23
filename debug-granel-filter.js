const fetch = require('node-fetch');

async function debugGranelFilter() {
  console.log('🔍 DIAGNÓSTICO DEL FILTRO GRANEL');
  console.log('='.repeat(50));
  
  try {
    // 1. Probar sin filtro para ver el resumen general
    console.log('\n1. 📊 Obteniendo resumen general (sin filtro)...');
    const allResponse = await fetch('http://localhost:4000/api/sms-analytics/accounts/guatemala/2025/5/grouped-by-client');
    
    if (!allResponse.ok) {
      console.log(`❌ Error HTTP: ${allResponse.status} ${allResponse.statusText}`);
      return;
    }
    
    const allData = await allResponse.json();
    console.log(`✅ Resumen general:`);
    console.log(`   Total cuentas: ${allData.summary.total_accounts}`);
    console.log(`   🚀 Granel: ${allData.summary.granel}`);
    console.log(`   🟢 Alto: ${allData.summary.alto}`);
    console.log(`   🔵 Adecuado: ${allData.summary.adecuado}`);
    console.log(`   🟡 Bajo: ${allData.summary.bajo}`);
    console.log(`   🔴 Crítico: ${allData.summary.critico}`);
    console.log(`   ⚫ Sin actividad: ${allData.summary.sin_actividad}`);
    console.log(`   Grupos comerciales: ${allData.commercial_groups.length}`);
    
    if (allData.debug_info) {
      console.log(`   Debug - Antes del filtro: ${allData.debug_info.total_accounts_before_filter}`);
      console.log(`   Debug - Después del filtro: ${allData.debug_info.accounts_after_filter}`);
    }
    
    // 2. Probar con filtro granel
    console.log('\n2. 🚀 Probando filtro GRANEL...');
    const granelResponse = await fetch('http://localhost:4000/api/sms-analytics/accounts/guatemala/2025/5/grouped-by-client?usage_filter=granel');
    
    if (!granelResponse.ok) {
      console.log(`❌ Error HTTP: ${granelResponse.status} ${granelResponse.statusText}`);
      return;
    }
    
    const granelData = await granelResponse.json();
    console.log(`✅ Resultado del filtro granel:`);
    console.log(`   Filtro aplicado: ${granelData.filter_applied}`);
    console.log(`   Total cuentas filtradas: ${granelData.summary.total_accounts}`);
    console.log(`   Grupos comerciales: ${granelData.commercial_groups.length}`);
    
    if (granelData.debug_info) {
      console.log(`   Debug - Antes del filtro: ${granelData.debug_info.total_accounts_before_filter}`);
      console.log(`   Debug - Después del filtro: ${granelData.debug_info.accounts_after_filter}`);
      console.log(`   Debug - Efectividad: ${granelData.debug_info.filter_effectiveness}`);
    }
    
    // 3. Mostrar algunos grupos si existen
    if (granelData.commercial_groups.length > 0) {
      console.log('\n3. 📋 Grupos comerciales encontrados:');
      granelData.commercial_groups.slice(0, 5).forEach((group, index) => {
        console.log(`   ${index + 1}. ${group.client_display_name}`);
        console.log(`      - Cuentas: ${group.group_totals.total_accounts}`);
        console.log(`      - SMS enviados: ${group.group_totals.total_sent.toLocaleString()}`);
        console.log(`      - Cliente ID: ${group.client_id}`);
        
        if (group.accounts && group.accounts.length > 0) {
          console.log(`      - Primera cuenta: ${group.accounts[0].account_name} (${group.accounts[0].usage_status})`);
        }
        console.log('');
      });
    } else {
      console.log('\n❌ NO SE ENCONTRARON GRUPOS COMERCIALES CON FILTRO GRANEL');
      console.log('   Esto indica que el filtro no está funcionando correctamente');
    }
    
    // 4. Comparación de resultados
    console.log('\n4. 🔍 Análisis del problema:');
    console.log(`   Cuentas granel en resumen: ${allData.summary.granel}`);
    console.log(`   Cuentas encontradas con filtro: ${granelData.summary.total_accounts}`);
    
    if (allData.summary.granel > 0 && granelData.summary.total_accounts === 0) {
      console.log('   ❌ PROBLEMA IDENTIFICADO: El filtro no está funcionando');
      console.log('   Las cuentas granel existen pero el filtro no las encuentra');
    } else if (allData.summary.granel === granelData.summary.total_accounts) {
      console.log('   ✅ El filtro parece estar funcionando correctamente');
    }
    
  } catch (error) {
    console.log(`❌ Error durante el diagnóstico: ${error.message}`);
  }
}

// Función adicional para probar otros filtros
async function testOtherFilters() {
  console.log('\n' + '='.repeat(50));
  console.log('🧪 PROBANDO OTROS FILTROS');
  console.log('='.repeat(50));
  
  const filters = ['alto', 'adecuado', 'bajo', 'critico', 'sin_actividad'];
  
  for (const filter of filters) {
    try {
      console.log(`\n🔍 Probando filtro: ${filter}`);
      const response = await fetch(`http://localhost:4000/api/sms-analytics/accounts/guatemala/2025/5/grouped-by-client?usage_filter=${filter}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Cuentas encontradas: ${data.summary.total_accounts}`);
        console.log(`   Grupos comerciales: ${data.commercial_groups.length}`);
      } else {
        console.log(`   ❌ Error HTTP: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

async function main() {
  await debugGranelFilter();
  await testOtherFilters();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Diagnóstico completado');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { debugGranelFilter, testOtherFilters }; 