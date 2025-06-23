const http = require('http');

console.log('🔍 Verificando estado de Backend y Frontend...\n');

// Test Backend
function testBackend() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:4000/api/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Backend (puerto 4000): FUNCIONANDO');
          try {
            const parsed = JSON.parse(data);
            console.log(`   Status: ${parsed.status}`);
            console.log(`   Module: ${parsed.module}`);
          } catch (e) {
            console.log('   Response:', data);
          }
        } else {
          console.log(`❌ Backend (puerto 4000): ERROR ${res.statusCode}`);
        }
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Backend (puerto 4000): NO DISPONIBLE');
      console.log(`   Error: ${err.message}`);
      resolve();
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Backend (puerto 4000): TIMEOUT');
      req.destroy();
      resolve();
    });
  });
}

// Test Frontend
function testFrontend() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Frontend (puerto 3000): FUNCIONANDO');
        console.log('   Página principal carga correctamente');
      } else {
        console.log(`❌ Frontend (puerto 3000): ERROR ${res.statusCode}`);
      }
      resolve();
    });
    
    req.on('error', (err) => {
      console.log('❌ Frontend (puerto 3000): NO DISPONIBLE');
      console.log(`   Error: ${err.message}`);
      console.log('   Asegúrate de ejecutar: npm run dev en /frontend');
      resolve();
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Frontend (puerto 3000): TIMEOUT');
      req.destroy();
      resolve();
    });
  });
}

// Test API Proxy
function testAPIProxy() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/api/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ API Proxy (3000→4000): FUNCIONANDO');
          console.log('   El proxy de Next.js está redirigiendo correctamente');
        } else {
          console.log(`❌ API Proxy (3000→4000): ERROR ${res.statusCode}`);
        }
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ API Proxy (3000→4000): ERROR');
      console.log(`   Error: ${err.message}`);
      resolve();
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ API Proxy (3000→4000): TIMEOUT');
      req.destroy();
      resolve();
    });
  });
}

// Ejecutar tests
async function runTests() {
  await testBackend();
  console.log('');
  await testFrontend();
  console.log('');
  await testAPIProxy();
  console.log('');
  
  console.log('📋 RESUMEN:');
  console.log('   Backend debe estar en: http://localhost:4000');
  console.log('   Frontend debe estar en: http://localhost:3000');
  console.log('   API debe funcionar en: http://localhost:3000/api/health');
  console.log('');
  console.log('🔧 Si hay errores:');
  console.log('   1. Backend: cd sms-bi-dashboard/backend && npm run start:dev');
  console.log('   2. Frontend: cd sms-bi-dashboard/frontend && npm run dev');
  console.log('   3. Verificar next.config.js tiene el proxy correcto');
}

runTests(); 